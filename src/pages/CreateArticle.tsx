import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "@/config/app";
import { ArticleFlag } from "@/Redux/reducers/ArticlesFlag";
import { Editor } from "@tinymce/tinymce-react";
import Test from "./Test";

// Define the schema for form validation
const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
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
  const [upload] = useState<tus.Upload | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [s3_base_url, setS3_base_url] = useState("");
  const loginParams = useSelector((state: any) => state.loginParams);
  const dispatch = useDispatch();

  const {
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = form;

  const createBasicAuthHeader = () => {
    const credentials = `${loginParams?.email}:${loginParams?.password}`;
    const encodedCredentials = btoa(credentials);
    return `Basic ${encodedCredentials}`;
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
                        apiKey="r0gaizxe4aaa1yunnjujdr34ldg7qm9l1va0s8jrdx8ewji9"
                        value={field.value} // Bind form content to the editor
                        onEditorChange={(content: string) => {
                          field.onChange(content); // Sync TinyMCE content with the form
                        }}
                        init={{
                          plugins: [
                            "anchor",
                            "autolink",
                            "charmap",
                            "codesample",
                            "emoticons",
                            "image",
                            "link",
                            "lists",
                            "media",
                            "searchreplace",
                            "table",
                            "visualblocks",
                            "wordcount",
                            "checklist",
                            "mediaembed",
                            "casechange",
                            "export",
                            "formatpainter",
                            "pageembed",
                            "a11ychecker",
                            "tinymcespellchecker",
                            "permanentpen",
                            "powerpaste",
                            "advtable",
                            "advcode",
                            "editimage",
                            "advtemplate",
                            "mentions",
                            "tinycomments",
                            "tableofcontents",
                            "footnotes",
                            "mergetags",
                            "autocorrect",
                            "typography",
                            "inlinecss",
                            "markdown",
                            "importword",
                            "exportword",
                            "exportpdf",
                          ],
                          menubar: false,
                          toolbar: false,
                          branding: false, // Disables the TinyMCE branding URL
                          readOnly: false,
                          tinycomments_mode: "embedded",
                          tinycomments_author: "Author name",
                          elementpath: false,
                        }}
                      />
                    </FormControl>
                    <FormMessage>
                      {errors.content && errors.content.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormItem className="flex space-y-4 gap-2">
                <div className="flex flex-col space-y-2 w-full">
                  <FormLabel>Video</FormLabel>
                  <FormControl>
                    <Test
                      onVideoUpload={(videoUrl: string) => {
                        setTimeout(() => {
                          const currentContent = getValues("content");
                          const updatedContent = `${currentContent}
       <div class="video-container">
        <video controls preload="auto" width="600">
          <source src="${videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>`;
                          setValue("content", updatedContent);
                          toast.success("Video uploaded successfully!");
                        }, 2000);
                      }}
                      onImageUpload={(imageUrl: string) => {
                        setTimeout(() => {
                          const currentContent = getValues("content");
                          const updatedContent = `${currentContent}
       <div class="image-container">
        <img src="${imageUrl}" alt="Uploaded image" width="600" />
      </div>`;
                          setValue("content", updatedContent);
                          toast.success("Image uploaded successfully!");
                        }, 2000);
                      }}
                    />
                  </FormControl>
                  <FormMessage>
                    {errors.content && errors.content.message}
                  </FormMessage>
                </div>
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
