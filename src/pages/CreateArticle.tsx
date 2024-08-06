import { useRef, useState, useCallback, useEffect } from "react"; // Import hooks from React
import { z } from "zod"; // Import Zod for schema validation
import { useForm } from "react-hook-form"; // Import useForm from react-hook-form
import { Button } from "@/components/ui/button"; // Import custom Button component
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Import form components
import { Input } from "@/components/ui/input"; // Import custom Input component
import { Loader2 } from "lucide-react"; // Import Loader2 icon from lucide-react
import JoditEditor from "jodit-pro-react"; // Import JoditEditor component
import { zodResolver } from "@hookform/resolvers/zod"; // Import Zod resolver for react-hook-form
import * as tus from "tus-js-client"; // Import tus-js-client for file uploads
import axios from "axios"; // Import axios for API calls
import { Progress } from "@/components/ui/progress"; // Import custom Progress component
import { toast } from "sonner"; // Import toast for notifications
import { useSelector } from "react-redux";
import React from "react";

// Define the schema for form validation
const formSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be at most 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>; // Define the type for form data based on the schema

const CreateArticle = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  }); // Initialize form with react-hook-form and Zod resolver

  const [loading, setLoading] = useState(false); // State for loading status
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [uploadPercentage, setUploadPercentage] = useState(0); // State for upload progress
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for selected file
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // State for file input key to reset the input
  const [isUploadRunning, setIsUploadRunning] = useState(false); // State for upload running status
  const [upload, setUpload] = useState<tus.Upload | null>(null); // State for tus upload instance
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // State for video URL after upload
  const editor = useRef(null); // Ref for the Jodit editor
  const {
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = form; // Destructure methods and state from useForm

  const config = {
    readonly: false,
  }; // Configuration for Jodit editor

  const startUpload = useCallback(() => {
    if (!upload) return;
  
    setIsUploadRunning(true);
  
    upload.options.onError = (error) => {
      console.error("Upload failed:", error);
      setError(`Failed because: ${error.message}`);
      setIsUploadRunning(false);
      setLoading(false);
    };
  
    upload.options.onProgress = (bytesUploaded, bytesTotal) => {
      let percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
      // Cap the percentage at 99 to avoid showing 100 until the video is loaded
      if (Number(percentage) >= 99) {
        percentage = "99";
      }
      setUploadPercentage(Number(percentage));
      console.log(bytesUploaded, bytesTotal, `${percentage}%`);
    };
  
    upload.options.onSuccess = () => {
      if (upload.file instanceof File) {
        console.log(`Download ${upload.file.name} from ${upload.url}`);
        setVideoUrl(upload.url || null);
  
        // Video is successfully uploaded but not yet inserted into the editor.
        // We do not set uploadPercentage to 100% here, to wait until the editor insertion.
  
        // Append the video tag to the editor content
        const currentContent = getValues("content");
        const newContent = `${currentContent}<div><video width="400" controls><source src="${upload.url}" type="${selectedFile?.type}" />Your browser does not support the video tag.</video></div>`;
        setValue("content", newContent);
        setIsUploadRunning(false);
  
        // Call a function to set the percentage to 100% once the video is loaded in the editor
        setUploadPercentageTo100();
      }
    };
  
    upload.start();
  }, [upload, selectedFile, getValues, setValue]);
  
  const setUploadPercentageTo100 = () => {
    setUploadPercentage(100);
    // Reset the state
    setSelectedFile(null);
    setUpload(null);
    setFileInputKey(Date.now());
  };
  const loginData = useSelector((state:any)=> state?.LoginDetailsReducer)
console.log(loginData,"loginData")
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setSelectedFile(file);

      if (file) {
        const options = {
          endpoint: "https://tusd.tusdemo.net/files/",
          metadata: {
            filename: file.name,
            filetype: file.type,
          },
          addRequestId: true,
        };

        const newUpload = new tus.Upload(file, options);

        newUpload.findPreviousUploads().then((previousUploads) => {
          if (previousUploads.length > 0) {
            const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
            const recentUploads = previousUploads.filter(
              (upload) =>
                new Date(upload.creationTime).getTime() > threeHoursAgo
            );

            if (recentUploads.length > 0) {
              newUpload.resumeFromPreviousUpload(recentUploads[0]);
            }
          }

          setUpload(newUpload);
        });
      }
    },
    []
  );

  const makeDummyAPICall = (title: string, content: string) => {
    console.log(`Making API call with title: ${title} and content: ${content}`);

    axios
      .post(
        "http://test.kb.etvbharat.com/wp-json/wp/v2/posts",
        {
          status: "draft",
          title,
          content,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic cmFqa0B0ZXN0LmluOnJvb3Q=`, // Basic Auth header
          },
        }
      )
      .then((response) => {
        const id = response?.data?.id;
        if (id) {
          toast("success", {
            description: "Post created successfully!",
          });
        } else {
          toast("failed to post");
        }
      })
      .catch((error) => {
        console.error(`API call failed`, error);
      });
  };

  const handleBlur = useCallback(() => {
    const titleValue = getValues("title");
    const contentValue = getValues("content");

    if (titleValue || contentValue) {
      makeDummyAPICall(titleValue, contentValue);
    }
  }, [getValues]);

  const onSubmit = (data: FormData, isDraft: boolean) => {
    console.log(data, isDraft, "data");
    if (!selectedFile) {
      console.log("No file selected for upload");
    } else if (uploadPercentage < 100) {
      console.log("File upload not complete");
    } else {
      // Perform the final form submission, e.g., send data to your API
      toast("Form submitted successfully", {
        description: `${data}`,
      });
    }
  };

  const handleEditorChange = useCallback(
    (newContent: string) => {
      setValue("content", newContent);

      // Check if the video URL is removed
      if (videoUrl && !newContent.includes(videoUrl)) {
        setVideoUrl(null);
        setFileInputKey(Date.now()); // Reset the file input
        setSelectedFile(null);
        setUploadPercentage(0); // Reset the selected file state
        toast("Video removed from content");
      }
    },
    [setValue, videoUrl]
  );

  useEffect(() => {
    if (videoUrl) {
      const currentContent = getValues("content");
      if (!currentContent.includes(videoUrl)) {
        setVideoUrl(null);
        setFileInputKey(Date.now()); // Reset the file input
        setUploadPercentage(0);
        setSelectedFile(null); // Reset the selected file state
      }
    }
  }, [getValues, videoUrl]);

  return (
    <div className="bg-background text-foreground flex items-center justify-evenly h-full">
      <div className="w-full divide-y divide-slate-300">
        <div className="w-full flex">
          <Form {...form}>
            <form
              onSubmit={handleSubmit((data: FormData) => onSubmit(data, false))}
              className="space-y-2"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Article Title"
                        {...field}
                        onBlur={handleBlur}
                      />
                    </FormControl>
                    <FormMessage>
                      {errors.title && errors.title.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <JoditEditor
                    ref={editor}
                    value={getValues("content")}
                    config={config}
                    onChange={handleEditorChange}
                    onBlur={(newContent: string) => {
                      setValue("content", newContent);
                      handleBlur();
                    }}
                  />
                </FormControl>
                <FormMessage>
                  {errors.content && errors.content.message}
                </FormMessage>
              </FormItem>
              <FormItem>
                <FormLabel>Upload</FormLabel>
                <FormControl>
                  <Input
                    key={fileInputKey} // Use the key to reset the input field
                    id="picture"
                    className="bg-slate-400"
                    type="file"
                    onChange={handleFileChange}
                  />
                </FormControl>
                <FormMessage>
                  {errors.content && errors.content.message}
                </FormMessage>
                {uploadPercentage > 0 && (
                  <div>
                    <p>Upload Progress: {uploadPercentage}%</p>
                    <Progress value={uploadPercentage} />
                  </div>
                )}
                <Button
                  type="button"
                  onClick={startUpload}
                  disabled={!selectedFile || isUploadRunning}
                >
                  {isUploadRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </FormItem>
              {error && <div style={{ color: "red" }}>{error}</div>}
              {loading ? (
                <Button className="w-full" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <>
                  <div className="flex gap-2 justify-between">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSubmit((data: FormData) =>
                        onSubmit(data, true)
                      )}
                    >
                      Save as Draft
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => form.reset()}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Submit</Button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
