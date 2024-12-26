"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  VisibilityState,
  ColumnFiltersState,
  getFilteredRowModel,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import he from "he";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";
import { useEffect } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setPage,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility,
    },
  });

  function decodeHtmlEntities(str: string): string {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  }

  useEffect(() => {
    setPage(table.getState().pagination.pageIndex + 1);
  }, [table.getState().pagination.pageIndex]);

  return (
    <div>
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
     
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter titles..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-white"
        />
      
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="bg-slate-50">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                   <TableCell key={cell.id}>
                   {(() => {
                     const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                     return typeof content === "string" ? decodeHtmlEntities(content) : content;
                   })()}
                 </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
      <Pagination>
  <PaginationContent>
    {/* Previous Button */}
    <PaginationItem>
      <PaginationPrevious
        onClick={() => {
          const currentPageIndex = table.getState().pagination.pageIndex;
          if (currentPageIndex > 0) {
            table.previousPage();
            setPage(currentPageIndex);
          } else {
            // Optional: Wrap around to the last page
            table.setPageIndex(table.getPageCount() - 1);
            setPage(table.getPageCount());
          }
        }}
      >
        Previous
      </PaginationPrevious>
    </PaginationItem>

    {/* Page Numbers */}
    {Array.from({ length: table.getPageCount() }, (_, index) => (
      <PaginationItem key={index}>
        <PaginationLink
          href="#"
          onClick={() => {
            table.setPageIndex(index); // Update table state
            setPage(index + 1);       // Update parent state
          }}
          isActive={table.getState().pagination.pageIndex === index}
          aria-current={
            table.getState().pagination.pageIndex === index ? "page" : undefined
          }
        >
          {index + 1}
        </PaginationLink>
      </PaginationItem>
    ))}

    {/* Optional Ellipsis (for large page counts) */}
    {/* {table.getPageCount() > 5 && (
      <PaginationItem>
        <PaginationEllipsis />
      </PaginationItem>
    )} */}

    {/* Next Button */}
    <PaginationItem>
      <PaginationNext
        onClick={() => {
          const currentPageIndex = table.getState().pagination.pageIndex;
          const totalPageCount = table.getPageCount();
          if (currentPageIndex + 1 < totalPageCount) {
            table.nextPage();
            setPage(currentPageIndex + 2);
          } else {
            // Optional: Wrap around to the first page
            table.setPageIndex(0);
            setPage(1);
          }
        }}
      >
        Next
      </PaginationNext>
    </PaginationItem>
  </PaginationContent>
</Pagination>



      </div>
    </div>
  );
}
