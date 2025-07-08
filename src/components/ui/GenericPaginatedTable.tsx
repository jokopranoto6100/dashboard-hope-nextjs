// src/components/ui/GenericPaginatedTable.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useReactTable, getCoreRowModel, flexRender, SortingState, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

// --- Helper untuk Debouncing ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- Helper untuk Paginasi ---
const generatePaginationRange = (currentPage: number, pageCount: number, siblingCount = 1) => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= pageCount) {
        return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, pageCount);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < pageCount - 1;

    const firstPageIndex = 1;
    const lastPageIndex = pageCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = 3 + 2 * siblingCount;
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        return [...leftRange, '...', pageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
        const rightItemCount = 3 + 2 * siblingCount;
        const rightRange = Array.from({ length: rightItemCount }, (_, i) => pageCount - rightItemCount + 1 + i);
        return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
        const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
        return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
    return []; // fallback
};


interface GenericPaginatedTableProps<TData extends { total_records?: number }> {
  columns: ColumnDef<TData>[];
  rpcName: string;
  baseRpcParams: Record<string, any>;
  initialSorting: SortingState;
  noDataMessage?: string;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  searchPlaceholder?: string;
}

export function GenericPaginatedTable<TData extends { total_records?: number }>({
  columns,
  rpcName,
  baseRpcParams,
  initialSorting,
  noDataMessage = "Tidak ada data untuk ditampilkan.",
  pageSizeOptions = [10, 15, 20, 50, 100],
  initialPageSize = 15,
  searchPlaceholder = "Cari data...",
}: GenericPaginatedTableProps<TData>) {
  const supabase = createClientComponentSupabaseClient();
  const [data, setData] = useState<TData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchData = useCallback(async (pageToFetch: number, currentSize: number, searchVal: string) => {
    if (Object.values(baseRpcParams).some(p => p === null || p === undefined)) {
        setData([]);
        setTotalRecords(0);
        setIsLoading(false);
        return;
    }
    
    setIsLoading(true);
    if(searchVal) setIsSearching(true);
    setError(null);

    const params: any = {
      ...baseRpcParams,
      search_term: searchVal,
      sort_column_key: sorting[0]?.id || initialSorting[0]?.id,
      sort_direction_val: sorting[0]?.desc ? 'DESC' : 'ASC',
      page_limit_val: currentSize,
      page_offset_val: (pageToFetch - 1) * currentSize,
    };

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(rpcName, params);
      if (rpcError) throw rpcError;

      const resultData = (rpcData as TData[]) || [];
      setData(resultData);
      if (resultData.length > 0 && resultData[0].total_records !== undefined) {
        setTotalRecords(resultData[0].total_records);
      } else {
        setTotalRecords(0);
      }
    } catch (err: any) {
      setError(err.message || `Gagal memuat data dari ${rpcName}.`);
      setData([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [baseRpcParams, supabase, sorting, initialSorting, rpcName]);

  useEffect(() => {
    fetchData(currentPage, pageSize, debouncedSearchTerm);
  }, [fetchData, currentPage, pageSize, debouncedSearchTerm]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting, pageSize, debouncedSearchTerm, JSON.stringify(baseRpcParams)]);

  const memoizedColumns = useMemo(() => columns, [columns]);
  const pageCount = Math.ceil(totalRecords / pageSize);
  const paginationRange = useMemo(() => generatePaginationRange(currentPage, pageCount), [currentPage, pageCount]);
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (value: string) => setPageSize(Number(value));

  const table = useReactTable({
    data,
    columns: memoizedColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  if (isLoading && data.length === 0 && !error) {
    return (
      <div className="p-0 md:p-2 space-y-4">
        <div className="flex justify-between items-center gap-2 mb-2">
            <Skeleton className="h-10 w-full sm:max-w-xs" />
            <div className="flex items-center space-x-2">
                <Label className="mr-2 text-sm">Baris per halaman:</Label>
                <Skeleton className="h-10 w-[80px]" />
            </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {memoizedColumns.map((column: any) => (
                  <TableHead key={column.id || Math.random().toString()}>
                    <Skeleton className="h-5 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(initialPageSize)].map((_, i) => (
                <TableRow key={`skeleton-initial-${i}`}>
                  {memoizedColumns.map((column: any) => (
                    <TableCell key={column.id || Math.random().toString()} className="whitespace-nowrap py-2 px-3">
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  
  if (error) { return <p className="text-red-500 text-center p-4">Error: {error}</p>; }

  return (
     <div className="p-0 md:p-2 space-y-4">
       <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-2">
            <div className="relative w-full sm:max-w-xs">
                <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-8"
                />
                {isSearching && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Label htmlFor="pageSizeSelect" className="mr-2 text-sm flex-shrink-0">Baris per halaman:</Label>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                    <SelectTrigger id="pageSizeSelect" className="w-full sm:w-[80px]"><SelectValue placeholder={pageSize} /></SelectTrigger>
                    <SelectContent>{pageSizeOptions.map(size => (<SelectItem key={size} value={String(size)}>{size}</SelectItem>))}</SelectContent>
                </Select>
            </div>
       </div>

       <div className="rounded-md border overflow-x-auto">
         <Table>
           <TableHeader>
             {table.getHeaderGroups().map(headerGroup => (
               <TableRow key={headerGroup.id}>
                 {headerGroup.headers.map(header => (
                   <TableHead
                     key={header.id}
                     onClick={header.column.getToggleSortingHandler()}
                     className={`whitespace-nowrap ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                     style={{ textAlign: (header.column.columnDef as any).meta?.align === 'left' ? 'left' : 'center' }}
                   >
                    <div className="flex items-center justify-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                            header.column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> :
                            header.column.getIsSorted() === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> :
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />
                        )}
                    </div>
                   </TableHead>
                 ))}
               </TableRow>
             ))}
           </TableHeader>
           <TableBody>
            {isLoading ? (
               [...Array(pageSize)].map((_, i) => (
                 <TableRow key={`skeleton-refresh-${i}`}>
                   {memoizedColumns.map((column: any) => (
                       <TableCell key={column.id || `sk-cell-${i}-${Math.random()}`} className="whitespace-nowrap py-2 px-3">
                         <Skeleton className="h-5 w-full" />
                       </TableCell>
                   ))}
                 </TableRow>
               ))
             ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={memoizedColumns.length} className="h-24 text-center">{noDataMessage}</TableCell>
                </TableRow>
             ) : (
               table.getRowModel().rows.map(row => (
                 <TableRow key={row.id}>
                   {row.getVisibleCells().map(cell => (
                     <TableCell key={cell.id} className="whitespace-nowrap py-2 px-3" style={{ textAlign: (cell.column.columnDef as any).meta?.align === 'left' ? 'left' : 'center' }}>
                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
                     </TableCell>
                   ))}
                 </TableRow>
               ))
             )}
           </TableBody>
         </Table>
       </div>
       {pageCount > 1 && !isLoading && (
         <Pagination>
           <PaginationContent>
             <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }} aria-disabled={currentPage <= 1} tabIndex={currentPage <= 1 ? -1 : undefined} className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}/></PaginationItem>
             {paginationRange.map((pageNumber, index) => {
                if (pageNumber === '...') {
                    return <PaginationEllipsis key={`ellipsis-${index}`} />;
                }
                return (
                    <PaginationItem key={pageNumber}>
                        <PaginationLink href="#" onClick={(e) => {e.preventDefault(); handlePageChange(pageNumber as number)}} isActive={currentPage === pageNumber}>{pageNumber}</PaginationLink>
                    </PaginationItem>
                );
             })}
             <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < pageCount) handlePageChange(currentPage + 1); }} aria-disabled={currentPage >= pageCount} tabIndex={currentPage >= pageCount ? -1 : undefined} className={currentPage >= pageCount ? "pointer-events-none opacity-50" : undefined}/></PaginationItem>
           </PaginationContent>
         </Pagination>
       )}
     </div>
  );
}