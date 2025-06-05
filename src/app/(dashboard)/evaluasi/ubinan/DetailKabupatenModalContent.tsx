// src/app/(dashboard)/evaluasi/ubinan/DetailKabupatenModalContent.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { detailRecordColumns, DetailRecordRowProcessed } from './detail-record-columns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton"; // Impor Skeleton
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";

const ITEMS_PER_PAGE = 20;

interface DetailKabupatenModalContentProps {
  kabCode: number;
  selectedYear: number | null;
  selectedSubround: number | 'all';
  selectedKomoditas: string | null;
}

export function DetailKabupatenModalContent({
  kabCode,
  selectedYear,
  selectedSubround,
  selectedKomoditas,
}: DetailKabupatenModalContentProps) {
  const supabase = createClientComponentSupabaseClient();
  const [processedData, setProcessedData] = useState<DetailRecordRowProcessed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const fetchData = useCallback(async () => {
    if (!selectedYear || !selectedKomoditas) {
      setProcessedData([]);
      setTotalRecords(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    const params: any = {
      kab_kode: kabCode,
      tahun_val: selectedYear,
      komoditas_val: selectedKomoditas,
      subround_filter: selectedSubround === 'all' ? 'all' : String(selectedSubround),
      sort_column_key: 'r111', 
      sort_direction_val: 'ASC',
      page_limit_val: ITEMS_PER_PAGE,
      page_offset_val: (currentPage - 1) * ITEMS_PER_PAGE,
    };

    if (sorting.length > 0) {
      params.sort_column_key = sorting[0].id;
      params.sort_direction_val = sorting[0].desc ? 'DESC' : 'ASC';
    }

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_ubinan_detail_sorted_paginated',
        params
      );

      if (rpcError) throw rpcError;

      const resultData = rpcData as DetailRecordRowProcessed[] || [];
      setProcessedData(resultData);
      if (resultData.length > 0 && resultData[0].total_records !== undefined) {
        setTotalRecords(resultData[0].total_records); 
      } else {
        setTotalRecords(0);
      }

    } catch (err: any) {
      console.error("Error fetching detail data via RPC:", err);
      setError(err.message || "Gagal memuat data detail.");
      setProcessedData([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [kabCode, selectedYear, selectedSubround, selectedKomoditas, currentPage, supabase, sorting]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (sorting.length > 0) { 
        setCurrentPage(1);
    }
  }, [sorting]);


  const pageCount = Math.ceil(totalRecords / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns = useMemo(() => detailRecordColumns, []);

  const table = useReactTable({
    data: processedData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  if (isLoading && processedData.length === 0) { 
    return ( <div className="space-y-2 p-4">{[...Array(Math.floor(ITEMS_PER_PAGE / 4))].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div> );
  }
  if (error) { return <p className="text-red-500 text-center p-4">Error: {error}</p>; }
  if (processedData.length === 0 && !isLoading) { return <p className="text-center p-4">Tidak ada data detail untuk ditampilkan (Nama responden tidak kosong).</p>; }

  return (
    <div className="p-0 md:p-2 space-y-4">
      {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-50"><p>Memuat...</p></div>}
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
                    style={{ textAlign: header.column.id === 'r111' ? 'left' : 'center' }}
                    title={`Urutkan berdasarkan ${typeof header.column.columnDef.header === 'function' ? (header.column.columnDef.header as Function)(header.getContext())?.props?.children[0]?.props?.children : header.column.id }`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && 
                     { asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted() as string] !== undefined 
                     ? ({ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted() as string]) 
                     : ''}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="whitespace-nowrap py-2 px-3" style={{ textAlign: cell.column.id === 'r111' ? 'left' : 'center' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pageCount > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }} aria-disabled={currentPage <= 1} tabIndex={currentPage <= 1 ? -1 : undefined} className={currentPage <=1 ? "pointer-events-none opacity-50" : undefined}/>
            </PaginationItem>
            {(() => {
                const pageNumbers = [];
                const MAX_VISIBLE_PAGES = 5;

                if (pageCount <= MAX_VISIBLE_PAGES + 2) { // Jika total halaman sedikit, tampilkan semua
                    for (let i = 1; i <= pageCount; i++) {
                        pageNumbers.push(
                            <PaginationItem key={i}>
                                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i); }} isActive={currentPage === i}>{i}</PaginationLink>
                            </PaginationItem>
                        );
                    }
                } else {
                    // Tampilkan halaman pertama
                    pageNumbers.push( <PaginationItem key={1}> <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(1); }} isActive={currentPage === 1}>1</PaginationLink> </PaginationItem> );
                    
                    // Hitung rentang halaman tengah
                    let rangeStart = Math.max(2, currentPage - Math.floor((MAX_VISIBLE_PAGES - 3) / 2));
                    let rangeEnd = Math.min(pageCount - 1, currentPage + Math.floor((MAX_VISIBLE_PAGES - 3) / 2));

                    // Koreksi jika rentang terlalu dekat ke awal atau akhir
                    if (rangeEnd - rangeStart + 1 < MAX_VISIBLE_PAGES - 2) {
                        if (currentPage < pageCount / 2) {
                            rangeEnd = Math.min(pageCount - 1, rangeStart + MAX_VISIBLE_PAGES - 3);
                        } else {
                            rangeStart = Math.max(2, rangeEnd - MAX_VISIBLE_PAGES + 3);
                        }
                    }
                    
                    if (rangeStart > 2) pageNumbers.push(<PaginationEllipsis key="start-ellipsis" />);
                    
                    for (let i = rangeStart; i <= rangeEnd; i++) {
                        if (i > 1 && i < pageCount) { // Pastikan tidak duplikat dengan hal 1 atau terakhir jika rentangnya menyentuh
                           pageNumbers.push( <PaginationItem key={i}> <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i); }} isActive={currentPage === i}>{i}</PaginationLink> </PaginationItem> );
                        }
                    }
                    
                    if (rangeEnd < pageCount - 1) pageNumbers.push(<PaginationEllipsis key="end-ellipsis" />);
                    
                    // Tampilkan halaman terakhir
                    pageNumbers.push( <PaginationItem key={pageCount}> <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(pageCount); }} isActive={currentPage === pageCount}>{pageCount}</PaginationLink> </PaginationItem> );
                }
                return pageNumbers;
            })()}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < pageCount) handlePageChange(currentPage + 1); }} aria-disabled={currentPage >= pageCount} tabIndex={currentPage >= pageCount ? -1 : undefined} className={currentPage >= pageCount ? "pointer-events-none opacity-50" : undefined}/>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}