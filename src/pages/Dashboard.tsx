import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateArticle from "./CreateArticle";
import { DataTable } from "./articles/data-table";
import {  columns } from "./articles/column";
import axios from 'axios';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { BASE_URL } from '@/config/app';

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
  const loginParams = useSelector((state:any) => state.loginParams);
  const createBasicAuthHeader = () => {
    const credentials = `${loginParams?.email}:${loginParams?.password}`;
    const encodedCredentials = btoa(credentials); // Encode credentials to Base64
    return `Basic ${encodedCredentials}`;
  };
  const ArticlesFalg = useSelector((state:any)=>state.articleFlag)


  useEffect(() => {
    const authHeader = createBasicAuthHeader();
    const params = new URLSearchParams({
      page: "1",
      per_page: "30",
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
    axios.get(`${BASE_URL}wp/v2/posts?${params}`,
      { headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },})
      .then((response: any) => {
       
        const formattedData = response?.data?.map((item: any) => ({
          id: item?.id,
          title: item?.title?.rendered,
          status: item?.status, // Assuming all fetched articles are published
          email: item?.author_email || userDetails?.email, // Replace with actual email field if available
          content:item?.content?.rendered
        }));
        setArticles(formattedData);
        setLoading(false);  // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.log(error,"error.messageDashboard")
        setError("Error fetching articles");
        toast("Error fetching articles:", {
          description: error.message
        });
        setLoading(false);  // Set loading to false even if there's an error
      });
  }, [ArticlesFalg]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <><div className='p-3'> 
    <Tabs defaultValue="Create" className="w-full">
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
      {loading ? ( <div>Loading...</div>):( <DataTable columns={columns} data={articles} />)}   
        </TabsContent>
      </Tabs></div>
     
    </>
  );
};

export default Dashboard;
