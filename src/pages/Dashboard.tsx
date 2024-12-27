import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./articles/data-table";
import { columns } from "./articles/column";
import axios from 'axios';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { BASE_URL } from '@/config/app';
import { useNavigate } from 'react-router-dom';
import CreateArticle from './CreateArticle';

// Define the data type for articles
export type Payment = {
  id: number;
  title: string;
  status: "Published" | "draft";
  email: string;
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Payment[]>([]);
  const userDetails = useSelector((state: any) => state?.userDetails);
  const loginParams = useSelector((state: any) => state.loginParams);
  const [pageNum, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState(10);
  const [activeTab, setActiveTab] = useState<string>("Create"); // Track active tab
  const createBasicAuthHeader = () => {
    const credentials = `${loginParams?.email}:${loginParams?.password}`;
    const encodedCredentials = btoa(credentials); // Encode credentials to Base64
    return `Basic ${encodedCredentials}`;
  };
  const ArticlesFlag = useSelector((state: any) => state.articleFlag);
  const navigate = useNavigate();

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
    if (activeTab !== "Articles") return;

    const authHeader = createBasicAuthHeader();

    const fetchCount = () => {
      const paramsCount = new URLSearchParams({
        status: [
          "draft",
          "publish",
          "future",
          "pending",
          "private",
          "trash",
          "auto-draft",
          "request-pending",
          "request-confirmed",
          "request-failed",
          "request-completed",
          "any",
        ].join(","),
        author: userDetails?.id?.toString(),
      });

      axios
        .get(`${BASE_URL}post/v1/count?${paramsCount}`)
        .then((response: any) => {
          console.log("Count response:", response?.data);
          setPageCount(response?.data?.count);
        })
        .catch((error) => {
          console.error("Error fetching count:", error);

          if (error.response?.status === 401) {
            localStorage.clear();
            navigate("/"); // Redirect to login
          } else {
            setError(error.response?.data?.message || "Unknown error occurred");
            toast("Error fetching count:", {
              description: error.response?.data?.message || error.message,
            });
          }
        });
    };

    const fetchArticles = () => {
      const params = new URLSearchParams({
        per_page: "100"|| pageCount,
        page: pageNum.toString(),
        author: userDetails?.id?.toString() || null,
        status: [
          "draft",
          "publish",
          "future",
          "pending",
          "private",
          "trash",
          "auto-draft",
          "request-pending",
          "request-confirmed",
          "request-failed",
          "request-completed",
          "any",
        ].join(","),
      });

      axios
        .get(`${BASE_URL}wp/v2/posts?${params}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
        })
        .then((response: any) => {
          const formattedData = response?.data?.map((item: any) => ({
            id: item?.id,
            title: decodeHtmlEntities(item?.title?.rendered),
            status: item?.status,
            email: item?.author_email || userDetails?.email,
            content: decodeHtmlEntities(item?.content?.rendered),
          }));

          setArticles(formattedData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching articles:", error);

          if (error.response?.status === 401) {
            localStorage.clear();
            navigate("/"); // Redirect to login
          } else {
            setError(error.response?.data?.message || "Unknown error occurred");
            toast("Error fetching articles:", {
              description: error.response?.data?.message || error.message,
            });
          }
          setLoading(false);
        });
    };

    fetchArticles();
    fetchCount();
  }, [ArticlesFlag, pageNum, activeTab,pageCount]); // Add activeTab as dependency

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="p-3 bg-purple-100 shadow-lg rounded-b-xl">
        <Tabs defaultValue="Create" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full flex justify-evenly">
            <TabsTrigger className="w-full" value="Create">
              Create Article
            </TabsTrigger>

            <TabsTrigger className="w-full" value="Articles">
              Articles
            </TabsTrigger>
          </TabsList>
          <TabsContent value="Create">
            <CreateArticle />
          </TabsContent>
          <TabsContent value="Articles">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <DataTable columns={columns} data={articles} setPage={setPage} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Dashboard;
