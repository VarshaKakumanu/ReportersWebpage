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
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
       
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }:any) => {
      const payment = row.original;
     
      return (
        // <DropdownMenu>
        //   <DropdownMenuTrigger asChild>
        //     <Button variant="ghost" className="h-8 w-8 p-0">
        //       <span className="sr-only">Open menu</span>
        //       <MoreHorizontal className="h-4 w-4" />
        //     </Button>
        //   </DropdownMenuTrigger>
        //   <DropdownMenuContent align="end">
        //   <DropdownMenuItem>

<Dialog>
  
  <DialogTrigger > <Button variant="outline" onClick={() => { 
    navigator.clipboard.writeText(payment.id.toString())}}>view</Button></DialogTrigger>
  
  <DialogContent className="h-full rounded-md m-1 min-w-full overflow-y-scroll">
    <DialogHeader className="grid" >
      <DialogTitle dangerouslySetInnerHTML={{ __html:payment?.title}}></DialogTitle>
      <DialogDescription>
      <p className="grid"  dangerouslySetInnerHTML={{ __html:payment?.content}}></p>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>

        //     </DropdownMenuItem>
        //   </DropdownMenuContent>
        // </DropdownMenu>
      );
    },
  },
 
];
