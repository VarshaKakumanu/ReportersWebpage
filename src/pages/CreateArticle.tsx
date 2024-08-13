import { useRef, useState, useCallback, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import JoditEditor from "jodit-pro-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as tus from "tus-js-client";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "@/config/app";
import { ArticleFlag } from "@/Redux/reducers/ArticlesFlag";

// Define the schema for form validation
const formSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be at most 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

const CreateArticle = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [isUploadRunning, setIsUploadRunning] = useState(false);
  const [upload] = useState<tus.Upload | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const editor = useRef(null);
  const [s3_base_url,setS3_base_url] = useState("");
  const curtime = Math.ceil(Date.now() / 1000);
  const userDetails = useSelector((state: any) => state?.userDetails);
  const loginParams = useSelector((state: any) => state.loginParams);
  const dispatch = useDispatch();
 
  const {
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = form;

  const config = {
    readonly: false,
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setSelectedFile(file);
    },
    []
  );

  const createBasicAuthHeader = () => {
    const credentials = `${loginParams?.email}:${loginParams?.password}`;
    const encodedCredentials = btoa(credentials); // Encode credentials to Base64
    return `Basic ${encodedCredentials}`;
  };

  const startUpload = useCallback(() => {
    if (!selectedFile) return;
    const upload = new tus.Upload(selectedFile, {
      endpoint: "http://test.kb.etvbharat.com/wp-tus?curtime=" + curtime,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: selectedFile.name,
        filetype: selectedFile?.type,
      },
      onError: (error: any) => {
        toast("Upload failed:", error);
        setError(`Failed because: ${error.message}`);
        setIsUploadRunning(false);
        setLoading(false);
        upload.start();
      },
      onProgress: (bytesUploaded: any, bytesTotal: any) => {
        let percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        if (percentage === "100.00") {
          percentage = "99.90";
        }
        setUploadPercentage(Number(percentage));
        console.log(bytesUploaded, bytesTotal, `${percentage}%`);
      },
      onSuccess: () => {
      
        let final_uploaded_url =
          s3_base_url + curtime + "/" + selectedFile?.name;
        if (upload.file instanceof File) {
          setVideoUrl(upload.url || null);
          const CurrentContent = getValues("content");
          const newContent = `<div>
   <div> ${CurrentContent}</div>
  <video style="max-width: 50%; height: auto;" controls>
    <source src="${final_uploaded_url}" type="${selectedFile?.type}" />
    Your browser does not support the video tag.
  </video>
</div>`;
          setValue("content", newContent);
        }
        makeMediaAPICall(final_uploaded_url);
        setIsUploadRunning(false);
        setUploadPercentage(100);
        if (uploadPercentage === 100) {
          setUploadPercentage(0);
        }
        setFileInputKey(Date.now());
      },
    });

    upload.start();
  }, [upload, selectedFile, getValues, setValue]);

  const makeMediaAPICall = (url: string) => {
    axios
      .get(
        `${BASE_URL}media/v1/path?file_url=` +
          url +
          "&user_id=" +  userDetails?.id.toString()
         
      )
      .catch((error) => {
        toast.error("Error fetching articles:", {
          description: error.message,
        });
        setLoading(false);
      });
  };

  const makeArticleAPICall = (title: string, content: string) => {
  
    const authHeader = createBasicAuthHeader();
    setLoading(true);
    axios
      .post(
        `${BASE_URL}wp/v2/posts`,
        {
          status: "draft",
          title,
          content,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
        }
      )
      .then((response) => {
        const id = response?.data?.id;
        if (id) {
          toast("success", {
            description: "Post created successfully!",
          });
          dispatch(ArticleFlag(true));
          form.reset();
        } else {
          toast("failed to post");
          dispatch(ArticleFlag(false));
        }
      })
      .catch((error) => {
        toast(`API call failed`, error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onSubmit = (data: FormData) => {
    let contentWithVideo = data.content;
  
    // Find the <video> tag with its source URL
    const videoTagRegex = /<div><video[^>]*><source src=['"]([^'"]+)['"][^>]*type=['"]([^'"]+)['"][^>]*>[^<]*<\/video><\/div>/i;
    const match = contentWithVideo.match(videoTagRegex);
  
    if (match) {
      const videoUrl = match[1];  // Extract the video URL
      const fileType = match[2].split("/")[1]; // Extract the file type (e.g., "mp4")
      
      // Construct the new video format with square brackets
      const customVideoTag = `[video ${fileType}='${videoUrl}'][/video]`;
      
      // Replace only the matched video tag with the custom format
      contentWithVideo = contentWithVideo.replace(videoTagRegex, `<p class='venkat'>${customVideoTag}</p>`);
      
      console.log(contentWithVideo, data.title, "contentWithVideo");
  
      // Now you can proceed with making the API call
      makeArticleAPICall(data.title, contentWithVideo);
    } else {
      toast("Form not submitted: Missing video URL or title");
    }
  };
  
  
  

  const handleEditorChange =
    (newContent: string) => {
      setValue("content", newContent);
    }
 
useEffect(() => {
    axios.get(`${BASE_URL}media/v1/path`).then((response)=>{
      const S3Url = response?.data?.s3_base;
      setS3_base_url(S3Url)
    })
  }, [getValues, videoUrl]);

  return (
    <div className="bg-background text-foreground flex items-center justify-evenly h-screen overflow-y-auto">
      <div className="w-full divide-y divide-slate-300">
        <div className="w-full flex">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
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
                    key={fileInputKey}
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
                <div className="flex gap-2 justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSubmit((data: FormData) =>
                      onSubmit(data)
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
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
