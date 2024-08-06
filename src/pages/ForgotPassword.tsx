import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";

// Define the schema for form validation
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });
  const navigate = useNavigate();

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setLoading(true);

    // API call using axios
    axios.post("https://test.kb.etvbharat.com/wp-json/users/v1/reset-password", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response: any) => {
        toast("Success", {
          description: response?.data?.message
        });
        navigate("/login");
      })
      .catch((error:any) => {
        toast("Error:", {
          description: error?.response?.data?.message
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <div className="bg-background text-foreground flex-grow flex items-center justify-evenly h-screen">
      <div className="space-y-4 hidden md:flex flex-col p-4">
        <h2 className="text-8xl mb-4">Etv Bharat</h2>
        <h1 className="text-xl font-semibold w-96 px-2">Reset Your password and access the Login</h1>
      </div>
      <div className="space-y-4 p-4 w-80 divide-y divide-slate-300 ">
      <h2 className="text-xl md:text-3xl text-center font-semibold gap-3">
          {" "}
          <div className="flex justify-center items-center text-2xl md:hidden">
            Etv Bharat
          </div>{" "}
          <div className="flex md:justify-center">Forgot Password</div>
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@example.com" {...field} />
                  </FormControl>
                  <FormDescription className="flex gap-2">
                    <Link to="/login">Already have a Login?</Link>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             {loading ? (
              <Button className="w-full" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <>
                {" "}
                <Button type="submit" className="w-full">Submit</Button>
              </>
            )}

          </form>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPassword;


