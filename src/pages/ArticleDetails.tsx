import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BASE_URL } from "@/config/app";
import { useSelector } from "react-redux";
import React from "react";
import {  useParams } from "react-router-dom";
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
    .replace(/&quot;/g, '"')        // Decode straight double quote
    .replace(/&lt;/g, "<")          // Decode '<'
    .replace(/&gt;/g, ">");         // Decode '>'
    
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
    <div className="flex flex-col md:flex-row md:justify-between w-full">
    {article ? (
      <div className="w-full bg-purple-100 shadow-lg rounded-b-xl">
        <div className="flex flex-col items-center justify-center gap-4 w-full max-w-screen-lg mx-auto px-4 py-6">
          {/* Title Section */}
          <h1 className="font-sans text-xl md:text-4xl lg:text-6xl break-words text-center w-full">
            {decodeHtmlEntities(article?.title?.rendered || "Untitled Article")}
          </h1>
  
          {/* Content Section */}
          <div
            className="news-article text-sm md:text-base break-words w-full"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                decodeHtmlEntities(article?.content?.rendered || "No content available")
              ),
            }}
          />
        </div>
      </div>
    ) : (
      <div className="text-center w-full">No article found</div>
    )}
  </div>
  
  );
}
