import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateArticle from "./CreateArticle";

export default function Dashboard() {
  return (
    <>
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="w-full flex justify-evenly">
          <TabsTrigger className="w-full" value="Create">
            Create Article
          </TabsTrigger>
          <TabsTrigger className="w-full" value="password">
            Articles
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Create">
          <CreateArticle />
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
    </>
  );
}
