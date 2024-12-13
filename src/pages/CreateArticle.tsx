import { useState, useEffect } from "react";
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
import * as tus from "tus-js-client";
import axios from "axios";
import { toast } from "sonner";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "@/config/app";
import { ArticleFlag } from "@/Redux/reducers/ArticlesFlag";
import { Editor } from "@tinymce/tinymce-react";
import Test from "./Test";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import { Icons } from "@/components/icons";
import { useTheme } from "@/hooks/useTheme";

type FormData = {
  title: string;
  content: string;
};

const CreateArticle = () => {
  const form = useForm<FormData>({
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
  const { theme } = useTheme();

  // const editorSkin = theme === "dark" ? "oxide-dark" : "oxide";
  // const editorContentCss = theme === "dark" ? "dark" : "default";

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
          dispatch(ArticleFlag(true));
          toast.success("Post created successfully!");
          // form.reset();
        } else {
          toast.error("Failed to post");
          dispatch(ArticleFlag(false));
        }
      })
      .catch((error) => {
        toast.error(`API call failed: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onSubmit = (data: FormData) => {
    let contentWithVideo = data.content;
    if (!contentWithVideo) {
      toast.error("Form not submitted: Content is required");
      return;
    }

    const videoTagRegex =
      /<video[^>]*>\s*<source\s+src=['"]([^'"]+)['"]\s+type=['"]([^'"]+)['"][^>]*>[\s\S]*?<\/video>/is;

    const matchResult = videoTagRegex.exec(contentWithVideo);
    if (matchResult) {
      const videoUrl = matchResult[1];
      const fileType = matchResult[2].split("/")[1];
      const customVideoTag = `[video ${fileType}='${videoUrl}'][/video]`;
      const contentForApiCall = contentWithVideo.replace(
        videoTagRegex,
        customVideoTag
      );
      makeArticleAPICall(data.title || "Untitled Post", contentForApiCall);
      form.reset();
    } else {
      // makeArticleAPICall(data.title || "Untitled Post", contentWithVideo);
      toast.error("Missing video content");
    }
  };

  useEffect(() => {
    axios.get(`${BASE_URL}media/v1/path`).then((response) => {
      const S3Url = response?.data?.s3_base;
      setS3_base_url(S3Url);
    });
  }, [getValues, videoUrl]);

  return (
    <div className="bg-purple-100 text-foreground flex items-center justify-evenly max-h-full">
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
                      <Input
                        className="bg-white rounded-lg focus:outline-none focus:ring-0"
                        placeholder="Article Title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>
                      {errors.title && "Title is required"}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <p>Content</p>
                    </FormLabel>
                    <FormControl className="shadow-lg">
                      <Editor
                        // onClick={ e => {e.stopPropagation()}}
                        apiKey="r0gaizxe4aaa1yunnjujdr34ldg7qm9l1va0s8jrdx8ewji9"
                        value={field.value}
                        onEditorChange={(content: string) => {
                          field.onChange(content);
                        }}
                        init={{
                          plugins: [
                            "anchor",
                            "autolink",
                            "lists",
                            "link",
                            "media",
                            "image",
                            "emoticons",
                            "charmap",
                            "searchreplace",
                            "table",
                            "visualblocks",
                            "wordcount",
                          ],
                          placeholder: "Write Your Article Here..",
                          height: 220,
                          menubar: false,
                          branding: false,
                          elementpath: false,
                          toolbar: false, // Hide the main toolbar
                          setup: (editor) => {
                            editor.on("init", () => {
                              const container = editor.getContainer();
                              const statusbar =
                                container.querySelector(".tox-statusbar");
                              if (statusbar) {
                                const buttonContainer =
                                  document.createElement("div");
                                buttonContainer.style.display = "flex";
                                buttonContainer.style.alignItems = "center";
                                buttonContainer.style.marginLeft = "auto";

                                const insertButton =
                                  document.createElement("button");
                                insertButton.textContent =
                                  "Insert Video or Image";
                                insertButton.type = "button";
                                insertButton.style.marginLeft = "8px";
                                insertButton.style.padding = "4px 8px";
                                insertButton.style.backgroundColor = "#FFC107";
                                insertButton.style.color = "#000";
                                insertButton.style.border = "none";
                                insertButton.style.cursor = "pointer";
                                insertButton.style.borderRadius = "4px";

                                insertButton.addEventListener("click", (e) => {
                                  e.stopPropagation(); // Prevent propagation
                                  e.preventDefault(); // Prevent any default form submission
                                  setIsDialogOpen(true);
                                });

                                buttonContainer.appendChild(insertButton);
                                statusbar.appendChild(buttonContainer);
                              }
                            });
                          },
                        }}
                      />
                    </FormControl>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger>
                        <Button className="hidden" />
                      </DialogTrigger>
                      <DialogContent
                        className="h-full rounded-md m-1 min-w-full overflow-y-scroll flex justify-center items-center"
                      >
                        <Test
                          onVideoUpload={(videoUrl: string) => {
                            setTimeout(() => {
                              const currentContent = getValues("content");
                              const updatedContent = `${currentContent}
        <div class="video-container">
          <video id="uploaded-video" controls preload="auto" width="600">
            <source src="${videoUrl}" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>`;
                              setValue("content", updatedContent);
                              setIsDialogOpen(false);
                              // handleSubmit(onSubmit)();
                              toast.success("Video uploaded successfully!");
                            }, 3000);
                          }}
                          onImageUpload={(imageUrl: string) => {
                            const currentContent = getValues("content");
                            const updatedContent = `${currentContent}
      <div class="image-container">
        <img src="${imageUrl}" alt="Uploaded image" width="600" />
      </div>`;
                            setValue("content", updatedContent);
                            setIsDialogOpen(false);
                            toast.success("Image uploaded successfully!");
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    <FormMessage>
                      {errors.content && "Content is required"}
                    </FormMessage>
                  </FormItem>
                )}
              />

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
                    variant="outline"
                    onClick={handleSubmit(onSubmit)}
                  >
                    Save as Draft
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
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
