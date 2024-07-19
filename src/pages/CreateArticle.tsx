import { useRef, useState } from "react";
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

  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const editor = useRef(null);
  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  const config = {
    readonly: false,
  };

  const onSubmit = async (data: FormData, isDraft: boolean) => {
    console.log(data, isDraft, "dataaaaaaaaaaaa");
  };

  return (
    <div className="bg-background text-foreground flex-grow flex items-center justify-evenly h-screen">
      <div className=" w-full divide-y divide-slate-300">
        <div className="w-full flex">
          {" "}
          <Form {...form}>
            <form
              onSubmit={handleSubmit((data) => onSubmit(data, false))}
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
                    onBlur={(newContent) => setValue("content", newContent)}
                  />
                </FormControl>
                <FormMessage>
                  {errors.content && errors.content.message}
                </FormMessage>
                <FormItem>
                  <FormLabel>Upload To Tuss</FormLabel>
                  <FormControl>
                    <Input id="picture" type="file" />
                  </FormControl>
                  <FormMessage>
                    {errors.content && errors.content.message}
                  </FormMessage>
                </FormItem>
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
                      onClick={handleSubmit((data) => onSubmit(data, true))}
                    >
                      Save as Draft
                    </Button>

                    <div className="flex gap-2">
                      <Button type="submit" variant="secondary">
                        cancle
                      </Button>
                      <Button type="submit">Submit</Button>
                    </div>
                  </div>
                </>
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
