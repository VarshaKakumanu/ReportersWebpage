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
import { Icons } from "@/components/icons";
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

  const editorSkin = theme === "dark" ? "oxide-dark" : "oxide";
  const editorContentCss = theme === "dark" ? "dark" : "default";

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
          toast.success("Post created successfully!");
          dispatch(ArticleFlag(true));
          form.reset();
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
    } else {
      makeArticleAPICall(data.title || "Untitled Post", contentWithVideo);
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
                    <FormLabel className="flex items-center justify-between w-full">
                      <p>Content</p>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger>
                          <Button
                            className="flex gap-2"
                            onClick={() => setIsDialogOpen(true)}
                          >
                            Upload video/image <Icons.upLoad />
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="h-full rounded-md m-1 min-w-full overflow-y-scroll flex justify-center items-center">
                          <Test
                            PostCall={() => {
                              toast.success("Post created successfully!");
                              setIsDialogOpen(false);
                            }}
                            onVideoUpload={(videoUrl: string) => {
                              const currentContent = getValues("content");
                              const updatedContent = `${currentContent}
            <div class="video-container">
              <video controls preload="auto" width="600">
                <source src="${videoUrl}" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>`;
                              setValue("content", updatedContent);
                              setIsDialogOpen(false);
                              toast.success("Video uploaded successfully!");
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
                    </FormLabel>
                    <FormControl>
                      <Editor
                        apiKey="r0gaizxe4aaa1yunnjujdr34ldg7qm9l1va0s8jrdx8ewji9"
                        value={field.value}
                        onEditorChange={(content: string) => {
                          field.onChange(content);
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
                            "quickbars",
                          ],
                          height: 200,
                          skin: editorSkin,
                          content_css: editorContentCss,
                          file_picker_types: "file image media",
                          menubar: false,
                          toolbar: false,
                          branding: false,
                          readOnly: false,
                          tinycomments_mode: "embedded",
                          tinycomments_author: "Author name",
                          elementpath: false,
                          quickbars_selection_toolbar:
                            "bold italic | blocks | quicklink blockquote",
                          setup: (editor) => {
                            editor.ui.registry.addContextToolbar(
                              "paragraphlink",
                              {
                                predicate: (node) => {
                                  return node.nodeName.toLowerCase() === "p";
                                },
                                items: "quicklink",
                                position: "selection",
                              }
                            );
                          },
                        }}
                      />
                    </FormControl>
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
