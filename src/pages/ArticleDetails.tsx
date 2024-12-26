import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BASE_URL } from "@/config/app";
import { useSelector } from "react-redux";
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";

// Define the data types
interface Article {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
}

export default function ArticleDetail() {
  const { paymentId } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.state?.activeTab || "Articles";
  const loginParams = useSelector((state: any) => state.loginParams);

  // Create Basic Auth Header
  const createBasicAuthHeader = () => {
    const credentials = `${loginParams?.email}:${loginParams?.password}`;
    const encodedCredentials = btoa(credentials);
    return `Basic ${encodedCredentials}`;
  };

  // Decode HTML Entities
  function decodeHtmlEntities(html: string): string {
    return html
      .replace(/&amp;/g, "&")         // Decode '&'
      .replace(/&#8211;/g, "–")       // Decode '–' (en dash)
      .replace(/&#8216;/g, "‘")       // Decode left single quote
      .replace(/&#8217;/g, "’")       // Decode right single quote
      .replace(/&#8220;/g, "“")       // Decode left double quote
      .replace(/&#8221;/g, "”")       // Decode right double quote
      .replace(/&#39;/g, "'")         // Decode straight single quote
      .replace(/&quot;/g, '"');       // Decode straight double quote
  }

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
    <div className="flex flex-col md:flex-row md:justify-between">
       
      {article ? (
       <div className=" w-full bg-purple-100 overflow-x-auto rounded-b-lg">
          <Badge
        onClick={() => navigate("/", { state: { activeTab } })}
       className="gap-1 cursor-pointer mt-2 ml-2 shadow-md"
      >
        <Icons.leftArrow />
        Back to Articles
      </Badge>
       <div className="flex flex-col items-center justify-between gap-4">
         {/* Decode and display title */}
         <h1 className="font-sans text-xl md:text-4xl lg:text-6xl break-words text-center w-[18rem] md:w-[40rem] lg:w-[52rem]">
           {decodeHtmlEntities(article?.title?.rendered || "Untitled Article")}
         </h1>
     
         {/* Decode and sanitize content */}
         <div
           className="news-article text-sm md:text-base break-words w-[18rem] md:w-[40rem] lg:w-[52rem]"
           dangerouslySetInnerHTML={{
             __html: DOMPurify.sanitize(
               decodeHtmlEntities(article?.content?.rendered || "No content available")
             ),
           }}
         />
       </div>
     </div>
     
      ) : (
        <div>No article found</div>
      )}
    </div>
  );
}
