import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BASE_URL } from "@/config/app";
import { useSelector } from "react-redux";
import React from "react";

// Define the data types
interface Article {
  id: number;
  title: string;
  description?: string;
  content: string;
  rendered?:string;
}

export default function ArticleDetail({ paymentId }: { paymentId: number }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loginParams = useSelector((state: any) => state.loginParams);

  const createBasicAuthHeader = () => {
    const credentials = `${loginParams?.email}:${loginParams?.password}`;
    const encodedCredentials = btoa(credentials);
    return `Basic ${encodedCredentials}`;
  };

  useEffect(() => {
    const authHeader = createBasicAuthHeader();

    const fetchArticle = async () => {
      try {
        const response = await axios.get(`${BASE_URL}wp/v2/posts/${paymentId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
        });

        const data = response?.data;

        if (data) {
          setArticle(data);
        } else {
          setError("No article found.");
        }
      } catch (error: any) {
        setError(error.message || "API call failed.");
        toast.error(`API call failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-4xl font-sans font-semibold gap-3">
        Loading... <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-sans text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:justify-between m-2 p-2">
      {article ? (
        <Card className="m-4 p-4 w-full bg-purple-100">
          <div className="flex flex-col items-center justify-between gap-4">
            <h1 className="font-sans text-xl md:text-4xl lg:text-6xl">{article?.title.rendered}</h1>
            <div
              className="news-article  text-sm md:text-base"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article?.content.rendered) }}
            />
          </div>
        </Card>
      ) : (
        <div>No article found</div>
      )}
    </div>
  );
}
