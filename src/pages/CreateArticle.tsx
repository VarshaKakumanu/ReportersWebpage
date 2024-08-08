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
import React from "react";
import { useSelector } from "react-redux";

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
  const loginParams = useSelector((state: any) => state.loginParams);
  const s3_base_url = "http://chartbeat-datastream-storage.s3.ap-south-1.amazonaws.com/wp-content/uploads/2024/08/"
  const curtime = Math.ceil(Date.now() / 1000);
  const [postId, setpostId] = useState(Math.ceil(Date.now() / 1000));

  const {
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = form; // Destructure methods and state from useForm

  const config = {
    readonly: false,
  }; // Configuration for Jodit editor

  const makeMediaAPICall = (url: string) => {
    axios.get("http://test.kb.etvbharat.com/wp-json/media/v1/path?file_url=" + url + "&user_id=" + postId + "&post_id=" + postId)
      .then((response: any) => {
        console.log(response, "resooooooooooooo")
      })
      .catch((error) => {
        toast.error("Error fetching articles:", {
          description: error.message,
        });
        setLoading(false);
      });
  };

  const startUpload = useCallback(() => {

    if (!upload) return;

    console.log("Starting upload...");

    setIsUploadRunning(true);

    upload.options.onError = (error) => {
      console.error("Upload failed:", error);
      setError(`Failed because: ${error.message}`);
      setIsUploadRunning(false);
      setLoading(false);
      // Optionally handle retry logic or user feedback
      upload.start();
    };

    upload.options.onProgress = (bytesUploaded, bytesTotal) => {
      let percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
      setUploadPercentage(Number(percentage));
      console.log(bytesUploaded, bytesTotal, `${percentage}%`);
    };

    upload.options.onSuccess = () => {
      console.log("Upload successful", upload.url);
      const final_uploaded_url = `${s3_base_url}${curtime}/${selectedFile?.name}`;
      if (upload.file instanceof File) {
        setVideoUrl(upload.url || null);
        const currentContent = getValues("content");
        const newContent = `${currentContent}<div><video width="400" controls><source src="${upload.url}" type="${selectedFile?.type}" />Your browser does not support the video tag.</video></div>`;
        setValue("content", newContent);
        makeMediaAPICall(final_uploaded_url);
        setIsUploadRunning(false);
        setUploadPercentage(100);
        setSelectedFile(null);
        setUpload(null);
        setFileInputKey(Date.now());
      }
    };


    upload.start();
  }, [upload, selectedFile, getValues, setValue]);

  const onSubmit = (data: FormData, isDraft: boolean) => {
    console.log(data, isDraft, "data");

    if (!videoUrl) {
      toast("No file selected for upload or upload not complete");
    } else if (uploadPercentage < 100) {
      toast("File upload not complete");
    } else {
      toast("Form submitted successfully", {
        description: `${data.title}`,
      });

      if (!isDraft) {
        makeDummyAPICall(data.title, data.content);
      }

      setUploadPercentage(0);
      setSelectedFile(null);
      setUpload(null);
      setFileInputKey(Date.now());
      setVideoUrl(null);
    }
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      console.log("Selected file:", file);
      setSelectedFile(file);

      if (file) {
        const options = {
          endpoint: `http://test.kb.etvbharat.com/wp-tus?curtime=${curtime}`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          metadata: {
            filename: file.name,
            filetype: file.type,
          },
          addRequestId: true,
          headers: {
            'Authorization': createBasicAuthHeader(), // Ensure this header is allowed by the server
            'Tus-Resumable': '1.0.0'
          }
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

  const createBasicAuthHeader = () => {
    const credentials = `${loginParams?.email}:${loginParams?.password}`;
    const encodedCredentials = btoa(credentials); // Encode credentials to Base64
    return `Basic ${encodedCredentials}`;
  };

  const makeDummyAPICall = (title: string, content: string) => {
    const authHeader = createBasicAuthHeader();
    console.log(title, content, "fffffffffffffffffffffffffffffffffffffffff")

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
            // Authorization: `Basic cmFqa0B0ZXN0LmluOnJvb3Q=`, // Basic Auth header
            Authorization: authHeader,
          },
        }
      )
      .then((response) => {
        const id = response?.data?.id;
        if (id) {
          setpostId(id)
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
                      <Input placeholder="Article Title" {...field} />
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
