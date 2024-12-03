import { useState, useCallback, useEffect } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import * as tus from "tus-js-client";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "@/config/app";
import { ArticleFlag } from "@/Redux/reducers/ArticlesFlag";
import { Editor } from "@tinymce/tinymce-react";

// Define the schema for form validation
const formSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be at most 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  // content:z.string(),
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
  const [loadingImg, setLoadingImg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [imageFileInputKey, setImageFileInputKey] = useState(Date.now());
  const [isUploadRunning, setIsUploadRunning] = useState(false);
  const [upload] = useState<tus.Upload | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [s3_base_url, setS3_base_url] = useState("");
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



  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setSelectedFile(file);
    },
    []
  );

  const createBasicAuthHeader = () => {
    const credentials = `${loginParams?.email}:${loginParams?.password}`;
    const encodedCredentials = btoa(credentials);
    return `Basic ${encodedCredentials}`;
  };

  const startUpload = useCallback(() => {
    if (!selectedFile) return;
    setVideoUrl(null); 
    const upload = new tus.Upload(selectedFile, {
      endpoint: "http://test.kb.etvbharat.com/wp-tus?curtime=" + curtime,
      chunkSize: 5 * 1024 * 1024,
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
          setVideoUrl(final_uploaded_url);
        if (upload.file instanceof File) {
          setVideoUrl(upload.url);
          const CurrentContent = getValues("content");
          const newContent = `${CurrentContent}
 <div class="video-container">
  <video controls preload='auto' width="600">
    <source src="${final_uploaded_url}" type="${selectedFile?.type}">
    Your browser does not support the video tag.
  </video>
</div>`;
          setValue("content", newContent);
        }
        makeMediaAPICall(final_uploaded_url);
        setIsUploadRunning(false);
        setUploadPercentage(0);
        setFileInputKey(Date.now());
        setImageFileInputKey(Date.now());
        setSelectedFile(null); // Clear the selected file
      },
    });

    upload.start();
  }, [upload, selectedFile, getValues, setValue]);

  const makeMediaAPICall = (url: string) => {
    axios
      .get(
        `${BASE_URL}media/v1/path?file_url=` +
          url +
          "&user_id=" +
          userDetails?.id.toString()
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
    const videoTagRegex =
      /<video[^>]*>\s*<source\s+src=['"]([^'"]+)['"]\s+type=['"]([^'"]+)['"][^>]*>[\s\S]*?<\/video>/is;

    // Using exec() to match the content
    const matchResult = videoTagRegex.exec(contentWithVideo);
    if (matchResult) {
      const videoUrl = matchResult[1]; // Extract the video URL
      const fileType = matchResult[2].split("/")[1]; // Extract the file type (e.g., "mp4")

      // Construct the new video format with square brackets
      const customVideoTag = `[video ${fileType}='${videoUrl}'][/video]`;

      // Replace only the matched video tag with the custom format
      const contentForApiCall = contentWithVideo.replace(
        videoTagRegex,
        customVideoTag
      );
      // Now you can proceed with making the API call
      makeArticleAPICall(data.title, contentForApiCall);
    } else {
      toast("Form not submitted: Missing video URL or title");
    }
  };

  const [imageFile, setImageFile] = useState<File | null>(null); // Separate state for image file

  const handleFileChangeImage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file:any = e?.target?.files?.[0] || null;
      if (file) {
        if (!file.type.startsWith("image/")) {
          toast.error("Only image files are allowed.");
          return;
        }
        setImageFile(file); // Set image file
        setImageFileInputKey(Date.now()); // Ensure the key is updated
      } else {
        toast.error("No file selected.");
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type. Only images are allowed.");
        return;
      }
    },
    []
  );
  

  const handleImageUpload = useCallback(() => {
    if (!imageFile) {
      toast.error("No image file selected.");
      return;
    }
  
    setLoadingImg(true);
    const authHeader = createBasicAuthHeader();
  
    const formData = new FormData();
    formData.append("file", imageFile);
  
    axios
      .post(
        `${BASE_URL}wp/v2/media`, // Replace with your actual endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: authHeader,
          },
        }
      )
      .then((response:any) => {
        const imageUrl = response?.data?.source_url;
        const currentContent = getValues("content");
        const updatedContent = `${currentContent}<div class="image-container"><img src="${imageUrl}" alt="${imageFile?.name}" width="600" /></div>`;
        setValue("content", updatedContent);
        toast.success("Image uploaded successfully!");
        setImageFile(null);
      })
      .catch((error:any) => {
        toast.error(error.data);
      })
      .finally(() => {
        setLoadingImg(false);
      });
  }, [imageFile, getValues, setValue]);
  

  useEffect(() => {
    axios.get(`${BASE_URL}media/v1/path`).then((response) => {
      const S3Url = response?.data?.s3_base;
      setS3_base_url(S3Url);
    });
  }, [getValues, videoUrl]);

  return (
    <div className="bg-background text-foreground flex items-center justify-evenly max-h-full">
      <div className="w-full divide-y divide-slate-300">
        <div className="w-full flex">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-2 w-full"
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
<FormField
  control={form.control}
  name="content"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Content</FormLabel>
      <FormControl>
      <Editor
      apiKey='r0gaizxe4aaa1yunnjujdr34ldg7qm9l1va0s8jrdx8ewji9'
      value={field.value} // Bind form content to the editor
          onEditorChange={(content: string) => {
            field.onChange(content); // Sync TinyMCE content with the form
          }}
          
      init={{
        plugins: [
          // Core editing features
          'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
          // Your account includes a free trial of TinyMCE premium features
          // Try the most popular premium features until Dec 17, 2024:
          'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown',
          // Early access to document converters
          'importword', 'exportword', 'exportpdf'
        ],
        readOnly: false,
        toolbar: false,
        tinycomments_mode: 'embedded',
        tinycomments_author: 'Author name',
        mergetags_list: [
          { value: 'First.Name', title: 'First Name' },
          { value: 'Email', title: 'Email' },
        ],
        ai_request: ( respondWith:any) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
      }}
    />
      </FormControl>
      <FormMessage>{errors.content && errors.content.message}</FormMessage>
    </FormItem>
  )}
/>


              <FormItem className="flex space-y-4 gap-2">
                <div className="flex flex-col space-y-2 w-full">
                  <FormLabel>Upload video</FormLabel>
                  <FormControl>
                    <Input
                      key={fileInputKey}
                      id="picture"
                      className="bg-slate-400"
                      type="file"
                      onChange={handleFileChange}
                      autoFocus={true}
                    />
                  </FormControl>
                  <FormMessage>
                    {errors.content && errors.content.message}
                  </FormMessage>
                </div>

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
                    "Upload video"
                  )}
                </Button>
              </FormItem>
              <FormItem>
                <FormItem className="flex space-y-4 gap-2">
                  <div className="flex flex-col space-y-2 w-full">
                    <FormLabel> Upload Image</FormLabel>
                    <FormControl>
                    
                      <Input
                        key={imageFileInputKey}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChangeImage}
                        autoFocus={true}
                      />
                    </FormControl>
                  </div>
                  <Button type="button" onClick={handleImageUpload}>
                    {loadingImg ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <p>Upload Image</p>
                    )}
                  </Button>
                </FormItem>
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
                    onClick={handleSubmit((data: FormData) => onSubmit(data))}
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
