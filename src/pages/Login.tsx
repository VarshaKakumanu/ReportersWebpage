import  { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateUserDetails } from "@/Redux/reducers/userDetails";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginDataDetails } from "@/Redux/reducers/logindata";

// Define the schema for form validation
const formSchema = z.object({
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
      username: "",
      password: "",
    },
  });
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      email: data?.username,
      password: data?.password,
    });

    const paramsCheck = new URLSearchParams({
      username: data?.username,
      password: data?.password,
    });

    axios
      .post(
        `http://test.kb.etvbharat.com/wp-json/users/v1/checklogin`,
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((response) => {
        const result = response?.data?.access_token;
        console.log(result,"resukst");
        dispatch(loginDataDetails(result))
        localStorage.setItem("access_token", result);
        if (result) {
          axios
            .get(
              `http://test.kb.etvbharat.com/wp-json/users/v1/checkUser?${paramsCheck}`,
              {
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              }
            )
            .then((response:any) => {
              const result = response?.data;
              if(result?.username){
                dispatch(updateUserDetails(result));
                dispatch(loggedIn(true));
                window.location.href = "/";
              }
              else{
                toast("Failed to login", {
                  description: "Invalid username or password",
                });
                dispatch(loggedIn(false));
              }
             
            })
            .catch((error: any) => {
              toast("Failed to login", {
                description: error?.response?.data?.RespStmsg,
              });
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          axios
            .post(
              `http://test.kb.etvbharat.com/wp-json/wp/v2/users/me?`,
              params,
              {
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              }
            )
            .then((response:any) => {
              const result = response?.data;
              if (result === null) {
                axios.get(
                  `http://test.kb.etvbharat.com/wp-json/users/v1/checkUser?${paramsCheck}`,
                  {
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                    },
                  }
                );
              }
            })
            .catch((error: any) => {
              toast("Failed to login", {
                description: error?.response?.data?.RespStmsg,
              });
            });
          localStorage.removeItem("access_token");
          toast("Failed to login", {
            description: "Invalid username or password",
          });
          dispatch(loggedIn(false));
          // window.location.reload();
        }
      })
      .catch((error: any) => {
        toast("Failed to login", {
          description: error?.response?.data?.RespStmsg,
        });
        dispatch(loggedIn(false));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="bg-background text-foreground flex-grow flex items-center justify-evenly h-screen">
      <div className="space-y-4 hidden md:flex flex-col p-4">
        <h2 className="text-8xl mb-4">Etv Bharat</h2>
        <h1 className="text-xl font-semibold w-96 px-2">
          Login to access and enjoy our exclusive articles, tailored to your
          interests.
        </h1>
      </div>

      <div className="space-y-4 p-4 w-80 divide-y divide-slate-300">
        <h2 className="text-xl md:text-3xl text-center font-semibold gap-3">
          {" "}
          <div className="flex justify-center items-center text-2xl md:hidden">
            Etv Bharat
          </div>{" "}
          <div className="flex md:justify-center">Login</div>
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="enter your email.." {...field} />
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
                    <Link to="/forgotPassword"> Forgot Password?</Link>
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
                <Button type="submit" className="w-full">
                  Submit
                </Button>
              </>
            )}

            {error && <div style={{ color: "red" }}>{error}</div>}
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;


