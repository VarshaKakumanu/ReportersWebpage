"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { ArrowUpDown} from "lucide-react";
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import ArticleDetail from "../ArticleDetails";


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: number;
  title: string;
  status: "Published" | "draft" ;
  email: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
    
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  // {
  //   accessorKey: "email",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       >
  //         Email
       
  //       </Button>
  //     );
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }:any) => {
      const payment = row.original;
     
      return (


<Dialog>
  <DialogTrigger>
    <Button
      variant="default"
      onClick={() => {
        navigator.clipboard.writeText(payment.id.toString());
        console.log(payment.id, "Copied to clipboard");
      }}
    >
      View
    </Button>
  </DialogTrigger>
  <DialogContent className="h-full rounded-md m-1 min-w-full overflow-y-scroll flex justify-center items-center">
    <DialogHeader className="h-[34rem]">
      <DialogDescription className="flex justify-center items-center">
        <ArticleDetail paymentId={payment.id} />
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>


      );
    },
  },
 
];
