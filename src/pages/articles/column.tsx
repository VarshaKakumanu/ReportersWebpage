"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { BASE_URL } from "@/config/app";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { ArticleFlag } from "@/Redux/reducers/ArticlesFlag";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: number;
  title: string;
  status: "Published" | "draft";
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
    cell: ({ row }: any) => {
      const payment = row.original;

      // Access Redux state here
      const loginParams = useSelector((state: any) => state.loginParams);
      const dispatch = useDispatch();
      // Function to create Basic Auth header
      const createBasicAuthHeader = () => {
        const credentials = `${loginParams?.email}:${loginParams?.password}`;
        const encodedCredentials = btoa(credentials);
        return `Basic ${encodedCredentials}`;
      };

      const handleDelete = () => {
        const authHeader = createBasicAuthHeader();
        const paymentId = payment.id;

        axios
          .delete(`${BASE_URL}wp/v2/posts/${paymentId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
          })
          .then((response) => {
            dispatch(ArticleFlag(true));
            console.log(response.data, "Server Response");
            toast.success("Post deleted successfully!");
          })
          .catch((error) => {
            toast.warning(
              error?.response?.data?.message || "An error occurred"
            );
          });
      };
      return (
        <div className="flex gap-1">
          <Link
            to={`/article/${payment.id}`}
            className="bg-green-500 text-white px-4 py-2 rounded shadow-lg hover:-translate-y-0.5 hover:bg-green-600"
            target="_blank"
            onClick={() => {
              navigator.clipboard.writeText(payment.id.toString());
              console.log(payment.id, "Copied to clipboard");
            }}
          >
            View
          </Link>
          <Link
            to={`edit/${payment.id}`}
            className="bg-yellow-500 text-white px-4 py-2 rounded shadow-lg hover:-translate-y-0.5 hover:bg-yellow-600"
            target="_blank"
          >
            Edit
          </Link>
          <AlertDialog>
            <AlertDialogTrigger>
              <Button className="bg-red-500 hidden text-white px-4 py-2 rounded shadow-lg hover:-translate-y-0.5 hover:bg-red-600">
               delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure to Delete this "title"?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your article and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                onClick={handleDelete}
                >
                  Yes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> 
        </div>
      );
    },
  },
];
