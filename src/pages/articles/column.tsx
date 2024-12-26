"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { ArrowUpDown} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";


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


        <Link
        to={`/article/${payment.id}`}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
         target="_blank"
        onClick={() => {
          navigator.clipboard.writeText(payment.id.toString());
          console.log(payment.id, "Copied to clipboard");
        }}
      >
        View
      </Link>



      );
    },
  },
 
];
