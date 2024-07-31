import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateArticle from "./CreateArticle";
import { DataTable } from "./articles/data-table";
import {  columns } from "./articles/column";
import axios from 'axios';
import { toast } from 'sonner';

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

  useEffect(() => {
    axios.get("https://test.kb.etvbharat.com/wp-json/wp/v2/posts")
      .then((response: any) => {
        const formattedData = response?.data?.map((item: any) => ({
          id: item?.id,
          title: item?.title?.rendered,
          status: "Published", // Assuming all fetched articles are published
          email: item?.author_email || "unknown@example.com", // Replace with actual email field if available
        }));
        setArticles(formattedData);
        setLoading(false);  // Set loading to false after data is fetched
      })
      .catch((error) => {
        setError("Error fetching articles");
        toast("Error fetching articles:", {
          description: error.message
        });
        setLoading(false);  // Set loading to false even if there's an error
      });
  }, []);





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
