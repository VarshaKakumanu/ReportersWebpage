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
import axios from "axios";
import { toast } from "sonner";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "@/config/app";
import { ArticleFlag } from "@/Redux/reducers/ArticlesFlag";
import { Editor } from "@tinymce/tinymce-react";
import Test from "./Test";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { debounce } from "lodash";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [s3_base_url, setS3_base_url] = useState("");
  const loginParams = useSelector((state: any) => state.loginParams);
  const dispatch = useDispatch();

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

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

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
          // toast.success("Post created successfully!");
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
    console.log(data, "dataaaaa");
    let contentWithVideo = data.content;

    if (!contentWithVideo) {
      toast.error("Form not submitted: Content is required");
      return;
    }

    // Regex to match all video tags
    const videoTagRegex =
      /<video[^>]*>\s*<source\s+src=['"]([^'"]+)['"]\s+type=['"]([^'"]+)['"][^>]*>[\s\S]*?<\/video>/gis;

    // Replace all video tags with custom format
    let matchResult = [...contentWithVideo.matchAll(videoTagRegex)];
    if (matchResult.length > 0) {
      matchResult.forEach((match) => {
        const videoUrl = match[1];
        const fileType = match[2].split("/")[1];
        const customVideoTag = `[video ${fileType}='${videoUrl}'][/video]`;
        contentWithVideo = contentWithVideo.replace(match[0], customVideoTag);
      });
      // Make API call with modified content
      makeArticleAPICall(data.title || "Untitled Post", contentWithVideo);
      form.reset();
      toast.success("Article posted successfully!");
    } else {
      // If no video tag is present, submit content as is
      makeArticleAPICall(data.title || "Untitled Post", contentWithVideo);
      toast.success("Article posted successfully!");
    }
    form.reset();
  };

  useEffect(() => {
    axios.get(`${BASE_URL}media/v1/path`).then((response) => {
      const S3Url = response?.data?.s3_base;
      setS3_base_url(S3Url);
    });
  }, [getValues, videoUrl]);

  let uploadCount = 0;
  let uploadType = ""; // Track total video uploads

  const showUploadToast = debounce(() => {
    if (uploadCount === 1) {
      toast.success(
        `${
          uploadType === "image"
            ? "1 Image uploaded successfully!"
            : "1 Video uploaded successfully!"
        }`
      );
    } else if (uploadCount > 1) {
      toast.success(
        `${
          uploadType === "image"
            ? "Images uploaded successfully!"
            : `${uploadCount} Videos uploaded successfully!`
        }`
      );
    }
    uploadCount = 0; // Reset count after showing toast
    uploadType = ""; // Reset upload type
  }, 1000);

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
                          content_style: `
                          div { margin: 10px; padding: 3px; }
                          img, video {
                            display: block;
                            width: 100%;
                            max-width: 800px;
                            margin: 10px 0;
                            border-radius: 8px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                            object-fit: contain;
                          }
                          @media (max-width: 768px) {
                            img, video {
                              width: 90%;
                              margin: 10px auto;
                            }
                          }
                        `,
                          resize: true,
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
                      <DialogContent className=" h-full rounded-md  min-w-full overflow-y-scroll flex flex-col md:flex-row  justify-center items-start">
                        <Badge  onClick={() => setIsDialogOpen(false)} className="gap-1 cursor-pointer shadow-md"><Icons.leftArrow/>Back</Badge>
                        <Test
                          setIsDialogOpen={setIsDialogOpen}
                          onVideoUpload={(videoUrl: string) => {
                            setTimeout(() => {
                              const currentContent = getValues("content");
                              const videoTemplate = `
                                <video
                                 playsinline
                                 preload="metadata"
                                  loading="lazy"
                                  id="uploaded-video-${Date.now()}"
                                  controls
                                  style="
                                    display: block;
                                    width:80%;
                                    max-width: 800px; /* Adjust to your desired max width */
                                    height: auto; /* Maintain aspect ratio */
                                    object-fit: cover; /* Ensure the video covers the container */
                                    border-radius: 8px; /* Optional: Rounded corners for a polished look */
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Optional: Subtle shadow for depth */
                                    margin: 0 auto; /* Center the video within its container */
                                    background-color: black; /* Optional: Background for better contrast */
                                  "
                                >
                                  <source src="${videoUrl}" type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                              `;
                          
                              const updatedContent = `${currentContent}\n${videoTemplate}`;
                              setValue("content", updatedContent);
                              uploadCount += 1; // Increment upload counter
                              uploadType = "video"; // Set upload type
                              setIsDialogOpen(false);
                              showUploadToast();
                            }, 100); // Simulate processing delay
                          }}
                          
                          onImageUpload={(imageUrl: string) => {
                            const currentContent = getValues("content");
                            const imageTemplate = `
                              <img
                                loading="lazy"
                                src="${imageUrl}"
                                alt="Uploaded image"
                                style="
                                  display: block;
                                    width:80%;
                                    max-width: 800px; /* Adjust to your desired max width */
                                    height: auto; /* Maintain aspect ratio */
                                    object-fit: cover; /* Ensure the video covers the container */
                                    border-radius: 8px; /* Optional: Rounded corners for a polished look */
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Optional: Subtle shadow for depth */
                                    margin: 0 auto; /* Center the video within its container */
                                    background-color: black; /* Optional: Background for better contrast */
                                "
                              />
                            `;
                            const updatedContent = `${currentContent}\n${imageTemplate}`;
                            setValue("content", updatedContent);
                            uploadCount += 1; // Increment upload counter
                            uploadType = "image"; // Set upload type
                            setIsDialogOpen(false);
                            showUploadToast();
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
                <div className="flex gap-2 justify-end">
                  {/* <Button
                    type="button"
                    variant="outline"
                    onClick={handleSubmit(onSubmit)}
                  >
                    Save as Draft
                  </Button> */}

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
