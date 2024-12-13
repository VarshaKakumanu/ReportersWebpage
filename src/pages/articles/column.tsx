"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { ArrowUpDown} from "lucide-react";
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
    }}
  >
    View
  </Button>
</DialogTrigger>
<DialogContent className="h-full rounded-md m-1 min-w-full overflow-y-scroll flex justify-center items-center">
  <DialogHeader className="h-[34rem]">
    <DialogTitle
      className="flex justify-center items-center text-2xl font-bold leading-tight"
      dangerouslySetInnerHTML={{ __html: payment?.title }}
    ></DialogTitle>
    <DialogDescription className="flex justify-center items-center">
      <article
        className="w-full max-w-4xl p-4 text-gray-800"
        dangerouslySetInnerHTML={{ __html: payment?.content }}
      ></article>
    </DialogDescription>
  </DialogHeader>
</DialogContent>

</Dialog>
      );
    },
  },
 
];
