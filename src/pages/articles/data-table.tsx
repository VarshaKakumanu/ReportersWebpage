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
                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
          const totalPageCount = table.getPageCount();

          if (currentPageIndex > 0) {
            table.previousPage();
            setPage(currentPageIndex);
          } else {
            // Wrap back to the last page
            table.setPageIndex(totalPageCount - 1);
            setPage(totalPageCount);
          }
        }}
      >
        Previous
      </PaginationPrevious>
    </PaginationItem>

    {/* Visible Pages: Show 2 Pages + Ellipsis */}
    {Array.from({ length: table.getPageCount() }, (_, index) => {
      const totalPageCount = table.getPageCount();
      const currentPage = table.getState().pagination.pageIndex;

      // Show only two pages + ellipsis
      const showPage =
        index === currentPage || // Current page
        index === (currentPage + 1) % totalPageCount || // Next page
        index === totalPageCount - 1; // Last page when cycling back

      const isEllipsis =
        index === currentPage + 2 && currentPage + 2 < totalPageCount; // Add ellipsis after 2 pages

      if (showPage) {
        return (
          <PaginationItem key={index}>
            <PaginationLink
              href="#"
              onClick={() => {
                table.setPageIndex(index); // Update table state
                setPage(index + 1); // Update current page
              }}
              isActive={table.getState().pagination.pageIndex === index}
              aria-current={
                table.getState().pagination.pageIndex === index ? "page" : undefined
              }
            >
              {index + 1}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (isEllipsis) {
        return (
          <PaginationItem key={`ellipsis-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      return null; // Hide pages outside the sliding range
    })}

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
            // Wrap back to the first page
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
