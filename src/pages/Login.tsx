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
import { Icons } from "@/components/icons";
import { ModeToggle } from "@/components/mode-toggle";

// Define the schema for form validation
const formSchema = z.object({
  username: z
    .string()
    .email("Invalid email address") // Ensure the username is a valid email
    .max(50, "Username must be at most 50 characters"),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters"), // Adjusted to 6 characters for a stronger password policy
});


const Login = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [params, setParams] = useState<{
    msg?: string;
    email?: string;
    pwd?: string;
    error?: any;
  }>({});

  useEffect(() => {
    // Extract the query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const msg: any = urlParams.get("msg");
    const email: any = urlParams.get("email");
    const pwd: any = urlParams.get("pwd");
    const error: any = urlParams.get("error");

    // Set parameters based on the msg type
    if (msg) {
      setParams({ msg, email, pwd, error });
    }
  }, []);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
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
  
    axios.post(`${BASE_URL}users/v1/checklogin`, params, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
        "Content-Type": "application/json",
      },
    })
      .then(response => {
        const result = response?.data?.access_token;
  
        if (result) {
          dispatch(loginDataDetails(result));
          localStorage.setItem("access_token", result);
  
          return axios.get(`${BASE_URL}users/v1/checkUser?${paramsCheck}`, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });
        } else {
          return axios.get(`${BASE_URL}wp/v2/users/me?${params}`, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }).then(() => {
            throw new Error("Invalid username or password");
          });
        }
      })
      .then(userResponse => {
        const userResult = userResponse?.data;
  
        if (userResult?.username) {
          const loginParamDispatch = Array.from(params.entries());
          dispatch(loginPram(loginParamDispatch));
          dispatch(updateUserDetails(userResult));
          dispatch(loggedIn(true));
          window.location.href = "/";
        } else {
          throw new Error("Invalid username or password");
        }
      })
      .catch(error => {
        console.log(error);
        toast("Failed to login", {
          description: error?.response?.data?.message,
        });
        dispatch(loggedIn(false));
      })
      .finally(() => {
        setLoading(false);
      });
  };
  

  return (
    <div className="bg-background text-foreground flex-grow flex flex-col items-center justify-evenly h-screen p-4">
    <div className="flex ml-auto"> <ModeToggle /></div>
    
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
      <div className="bg-background text-foreground flex-grow flex w-full items-center justify-evenly"> 
      <div className="space-y-4 hidden md:flex flex-col p-4">
       <h2 className="text-8xl mb-4">Etv Bharat</h2>
       <h1 className="text-xl font-semibold w-96 px-2">
         Login to access and enjoy our exclusive articles, tailored to your
         interests.
       </h1>
     </div>

        <div className="space-y-5 p-4 w-80">
          <h2 className="text-xl md:text-3xl text-center font-semibold gap-3">
            <div className="flex justify-center items-center text-2xl md:hidden">
              Etv Bharat
            </div>
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
                      <div style={{ position: "relative", width: "full" }}>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="******"
                          {...field}
                          style={{ paddingRight: "30px" }} // Adjust padding to accommodate icon
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "5px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {!showPassword ? (
                            <Icons.closeEye />
                          ) : (
                            <Icons.openEye />
                          )}
                        </button>
                      </div>
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
    </div>
  );
};

export default Login;
