import { useRef, useState, useCallback } from "react";
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
  const [isUploadRunning, setIsUploadRunning] = useState(false);
  const [upload, setUpload] = useState<tus.Upload | null>(null);
  const editor = useRef(null);
  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  const config = {
    readonly: false,
  };

  const startUpload = useCallback(() => {
    if (!upload) return;

    upload.options.onError = (error) => {
      console.error("Upload failed:", error);
      setError(`Failed because: ${error.message}`);
      setIsUploadRunning(false);
      setLoading(false);
    };

    upload.options.onProgress = (bytesUploaded, bytesTotal) => {
      const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
      setUploadPercentage(Number(percentage));
      console.log(bytesUploaded, bytesTotal, `${percentage}%`);
    };
    upload.options.onSuccess = () => {
      if (upload.file instanceof File) {
        console.log(`Download ${upload.file.name} from ${upload.url}`);
      }
      setLoading(false);
      setIsUploadRunning(false);
      setUploadPercentage(100);
      form.reset();
    };

    setIsUploadRunning(!isUploadRunning);
    upload.start();
  }, [upload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
            (upload) => new Date(upload.creationTime).getTime() > threeHoursAgo
          );

          if (recentUploads.length > 0) {
            newUpload.resumeFromPreviousUpload(recentUploads[0]);
          }
        }

        setUpload(newUpload);
        startUpload();
      });
    }
  }, [startUpload]);

  const onSubmit = (data: FormData, isDraft: boolean) => {
    console.log(data, isDraft, "data");
    if (selectedFile) {
      setLoading(true);
      startUpload();
    } else {
      console.log("No file selected for upload");
    }
  };

  return (
    <div className="bg-background text-foreground flex-grow flex items-center justify-evenly h-screen">
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
                    value={form.getValues("content")}
                    config={config}
                    onBlur={(newContent: string) => setValue("content", newContent)}
                  />
                </FormControl>
                <FormMessage>
                  {errors.content && errors.content.message}
                </FormMessage>
              </FormItem>
              <FormItem>
                <FormLabel>Upload</FormLabel>
                <FormControl>
                  <Input id="picture" className="bg-slate-400" type="file" onChange={handleFileChange} />
                </FormControl>
                <FormMessage>
                  {errors.content && errors.content.message}
                </FormMessage>
              </FormItem>
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
                      onClick={handleSubmit((data: FormData) => onSubmit(data, true))}
                    >
                      Save as Draft
                    </Button>

                    <div className="flex gap-2">
                      <Button type="submit" variant="secondary">
                        Cancel
                      </Button>
                      <Button type="submit">Submit</Button>
                    </div>
                  </div>
                </>
              )}
              {uploadPercentage > 0 && (
                <div>
                  <p>Upload Progress: {uploadPercentage}%</p>
                  <div style={{ width: `${uploadPercentage}%`, backgroundColor: "blue", height: "5px" }} />
                </div>
              )}
              {error && <div style={{ color: "red" }}>{error}</div>}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
