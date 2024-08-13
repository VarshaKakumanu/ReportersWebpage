import { useEffect, useState } from "react";
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
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loggedIn } from "@/Redux/reducers/login";
import axios from "axios";
import { Loader2, Terminal } from "lucide-react";
import { toast } from "sonner";
import { updateUserDetails } from "@/Redux/reducers/userDetails";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginDataDetails } from "@/Redux/reducers/logindata";
import { loginPram } from "@/Redux/reducers/Loginparam";
import { BASE_URL } from "@/config/app";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import React from "react";

// Define the schema for form validation
const formSchema = z.object({
  role: z.string(),
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must be at most 50 characters"),
  password: z.string().min(4, "Password must be at least 6 characters"),
});

const Login = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
      username: "",
      password: "",
    },
  });
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [params, setParams] = useState<{ msg?: string; email?: string; pwd?: string; error?: any }>({});

  useEffect(() => {
    // Extract the query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const msg:any = urlParams.get("msg");
    const email:any = urlParams.get("email");
    const pwd:any = urlParams.get("pwd");
    const error :any= urlParams.get("error");

    // Set parameters based on the msg type
    if (msg) {
      setParams({ msg, email, pwd, error });
    }
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      email: data?.username,
      password: data?.password,
    });

    const paramsCheck = new URLSearchParams({
      role: "contributor",
      username: data?.username,
      password: data?.password,
    });

    try {
      const response = await axios.post(`${BASE_URL}users/v1/checklogin`, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const result = response?.data?.access_token;

      if (result) {
        dispatch(loginDataDetails(result));
        localStorage.setItem("access_token", result);

        const userResponse = await axios.get(`${BASE_URL}users/v1/checkUser?${paramsCheck}`, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        const userResult = userResponse?.data;

        if (userResult?.username) {
          const loginParamDispatch = Array.from(params.entries());
          dispatch(loginPram(loginParamDispatch));
          dispatch(updateUserDetails(userResult));
          dispatch(loggedIn(true));
          window.location.href = "/";
        } else {
          toast("Failed to login", {
            description: "Invalid username or password",
          });
          dispatch(loggedIn(false));
        }
      } else {
        await axios.get(`${BASE_URL}wp/v2/users/me?${params}`, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        toast("Failed to login", {
          description: "Invalid username or password",
        });
        dispatch(loggedIn(false));
      }
    } catch (error: any) {
      toast("Failed to login", {
        description: error?.response?.data?.RespStmsg,
      });
      dispatch(loggedIn(false));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground flex-grow flex flex-col items-center justify-evenly h-screen">
      <div>
        {params.msg === "credentials" && params.email && params.pwd && (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Login Details</AlertTitle>
            <AlertDescription>
              Your credentials have been provided: <br />
              <strong>Email:</strong> {params.email} <br />
              <strong>Password:</strong> {params.pwd}
            </AlertDescription>
          </Alert>
        )}
        {params.msg === "inbox" && (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Login Details</AlertTitle>
            <AlertDescription>
              Check your email inbox for login credentials: {params.email}
            </AlertDescription>
          </Alert>
        )}
        {params.msg === "error" && (
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Login Error</AlertTitle>
            <AlertDescription>Something went wrong</AlertDescription>
          </Alert>
        )}
      </div>
      <div className="flex items-center justify-evenly w-full">
        <div className="space-y-4 hidden md:flex flex-col p-4">
          <h2 className="text-8xl mb-4">Etv Bharat</h2>
          <h1 className="text-xl font-semibold w-96 px-2">
            Login to access and enjoy our exclusive articles, tailored to your interests.
          </h1>
        </div>

        <div className="space-y-5 p-4 w-80">
          <h2 className="text-xl md:text-3xl text-center font-semibold gap-3">
            <div className="flex justify-center items-center text-2xl md:hidden">Etv Bharat</div>
            <div className="flex md:justify-center">Login</div>
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormDescription className="flex gap-2">
                      <Link to="/forgotPassword">Forgot Password?</Link>
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
                <Button type="submit" className="w-full">
                  Submit
                </Button>
              )}

              {error && <div style={{ color: "red" }}>{error}</div>}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
