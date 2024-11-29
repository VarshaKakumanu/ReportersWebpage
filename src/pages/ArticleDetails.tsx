import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BASE_URL } from "@/config/app";
import React from "react";

// Define the data types
interface Article {
  id: number;
  title: string;
  description: string;
  content: string;
}

export default function ArticleDetail() {
  const { id } = useParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const params = {
    //   page,
    //   per_page: perPage,
    //   author,
    //   status
    // };

    axios.get(`${BASE_URL}/wp/v2/posts`)
      .then((response) => {
        const fetchedArticles: Article[] = response.data.map(({ id, title, content }: any) => ({
          id,
          title: title.rendered,
          description: DOMPurify.sanitize(content.rendered),
          content: DOMPurify.sanitize(content.rendered),
        }));

        setArticles(fetchedArticles);
        const foundArticle = fetchedArticles.find(article => article.id === parseInt(id as string));
        setArticle(foundArticle || null);
        setLoading(false);
      })
      .catch((error) => {
          console.log(error.message,"error.messageArticle")
        toast.error("Error fetching articles:", {
          description: error.message,
        });
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-4xl font-sans font-semibold gap-3">
        Loading... <Loader2 className="animate-spin" />
      </div>
    );
  }

  const handleDescriptionClick = (id: number) => {
    navigate(`/articles/${id}`);
  };

  return (
    <div className="flex flex-col md:flex-row md:justify-between m-2 p-2">
      {article ? (
        <Card className="m-4 p-4 w-full">
          <div className="flex flex-col items-center justify-between gap-4">
            <h1 className="font-sans text-xl md:text-4xl lg:text-6xl" dangerouslySetInnerHTML={{ __html: article.title }}></h1>
            <p className="text-sm md:text-base" dangerouslySetInnerHTML={{ __html: article.content }}></p>
          </div>
        </Card>
      ) : (
        <div>No article found</div>
      )}

      <Card className="m-4 p-4 flex flex-col items-center w-56">
        <div className="flex text-lg font-bold m-2 items-center justify-center text-center">
          Related Articles
        </div>
        <div className="flex flex-col gap-6">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="flex flex-col items-center justify-between gap-1 p-2 hover:shadow-xl hover:cursor-pointer hover:animate-in hover:-translate-y-1"
              onClick={() => {
                setLoading(true);
                handleDescriptionClick(article?.id);
              }}
            >
              <h1 className="font-sans font-bold text-sm"  dangerouslySetInnerHTML={{ __html: article?.title }} />
              <p>tap for more info</p>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}