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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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

const INITIAL_PAGE_SIZE = 15; // Konstanta untuk ukuran halaman awal

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
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE); // State untuk ukuran halaman
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const fetchData = useCallback(async (pageToFetch: number, currentSize: number) => {
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
      page_limit_val: currentSize, // Menggunakan currentSize dari argumen
      page_offset_val: (pageToFetch - 1) * currentSize, // Menggunakan pageToFetch dan currentSize
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
      } else if (!rpcError) { // Hanya set 0 jika tidak ada error tapi data kosong
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
  }, [kabCode, selectedYear, selectedSubround, selectedKomoditas, supabase, sorting]); // Hapus currentPage & pageSize dari sini

  useEffect(() => {
    // Fetch data ketika filter utama berubah, atau sorting, atau pageSize, atau currentPage
    fetchData(currentPage, pageSize);
  }, [fetchData, currentPage, pageSize]); // Tambahkan currentPage & pageSize sebagai trigger fetch


  // Reset currentPage ke 1 jika sorting atau pageSize berubah
  useEffect(() => {
    // Jangan reset jika hanya currentPage yang berubah (itu akan dihandle oleh fetchData di atas)
    // Atau jika ini adalah render awal dengan initial sorting/pageSize
    if (currentPage !== 1) { // Hanya reset jika bukan sudah di halaman 1
        setCurrentPage(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting, pageSize]); // Jangan tambahkan currentPage di sini untuk menghindari loop


  const pageCount = Math.ceil(totalRecords / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    // setCurrentPage(1); // Sudah dihandle oleh useEffect di atas
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

  // Skeleton untuk loading awal sebelum ada data sama sekali
  if (isLoading && processedData.length === 0 && totalRecords === 0 && !error) { 
    return ( 
      <div className="p-0 md:p-2 space-y-4">
        <div className="flex justify-end items-center mb-2">
          <Label htmlFor="pageSizeSelect" className="mr-2 text-sm">Baris per halaman:</Label>
          <Skeleton className="h-10 w-[80px]" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHead key={column.id || Math.random().toString()} style={{ textAlign: column.id === 'r111' ? 'left' : 'center' }}>
                    <Skeleton className="h-5 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(INITIAL_PAGE_SIZE)].map((_, i) => (
                <TableRow key={`skeleton-initial-${i}`}>
                  {columns.map(column => (
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
  
  // Kondisi untuk "tidak ada data" setelah fetch selesai dan tidak loading
  if (processedData.length === 0 && !isLoading) { 
    return (
      <div className="p-0 md:p-2 space-y-4">
         <div className="flex justify-end items-center mb-2">
            <Label htmlFor="pageSizeSelect" className="mr-2 text-sm">Baris per halaman:</Label>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange} >
              <SelectTrigger id="pageSizeSelect" className="w-[80px]"><SelectValue placeholder={pageSize} /></SelectTrigger>
              <SelectContent>{[10, 15, 20, 50, 100].map(size => (<SelectItem key={size} value={String(size)}>{size}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        <p className="text-center p-4">Tidak ada data detail untuk ditampilkan (Nama responden tidak kosong).</p>
      </div>
    ); 
  }

  return (
    <div className="p-0 md:p-2 space-y-4">
      <div className="flex justify-end items-center mb-2">
        <Label htmlFor="pageSizeSelect" className="mr-2 text-sm">Baris per halaman:</Label>
        <Select
          value={String(pageSize)}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger id="pageSizeSelect" className="w-[80px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent>
            {[10, 15, 20, 50, 100].map(size => (
              <SelectItem key={size} value={String(size)}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            {isLoading ? (
              [...Array(pageSize)].map((_, i) => (
                <TableRow key={`skeleton-refresh-${i}`}>
                  {columns.map(column => (
                      <TableCell 
                          key={column.id || `sk-cell-${i}-${Math.random()}`} 
                          className="whitespace-nowrap py-2 px-3"
                          style={{ textAlign: column.id === 'r111' ? 'left' : 'center' }}
                      >
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="whitespace-nowrap py-2 px-3" style={{ textAlign: cell.column.id === 'r111' ? 'left' : 'center' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pageCount > 1 && !isLoading && ( // Sembunyikan pagination saat loading data baru untuk menghindari klik ganda
        <Pagination>
          {/* ... (Komponen Pagination tetap sama, pastikan isActive dan onClick tidak error saat pageCount 0) ... */}
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }} aria-disabled={currentPage <= 1} tabIndex={currentPage <= 1 ? -1 : undefined} className={currentPage <=1 ? "pointer-events-none opacity-50" : undefined}/>
            </PaginationItem>
            {(() => {
                const pageNumbers = [];
                const MAX_VISIBLE_PAGES = 5;

                if (pageCount <= MAX_VISIBLE_PAGES + 2) {
                    for (let i = 1; i <= pageCount; i++) {
                        pageNumbers.push(
                            <PaginationItem key={i}>
                                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i); }} isActive={currentPage === i}>{i}</PaginationLink>
                            </PaginationItem>
                        );
                    }
                } else {
                    pageNumbers.push( <PaginationItem key={1}> <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(1); }} isActive={currentPage === 1}>1</PaginationLink> </PaginationItem> );
                    let startPage = Math.max(2, currentPage - Math.floor((MAX_VISIBLE_PAGES - 3) / 2));
                    let endPage = Math.min(pageCount - 1, currentPage + Math.floor((MAX_VISIBLE_PAGES - 3) / 2));
                    
                    if (currentPage < MAX_VISIBLE_PAGES -1 ) endPage = MAX_VISIBLE_PAGES-1;
                    if (currentPage > pageCount - (MAX_VISIBLE_PAGES-2)) startPage = pageCount - (MAX_VISIBLE_PAGES-2)

                    if (startPage > 2) pageNumbers.push(<PaginationEllipsis key="start-ellipsis" />);
                    for (let i = startPage; i <= endPage; i++) {
                        if (i > 1 && i < pageCount) {
                           pageNumbers.push( <PaginationItem key={i}> <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i); }} isActive={currentPage === i}>{i}</PaginationLink> </PaginationItem> );
                        }
                    }
                    if (endPage < pageCount - 1) pageNumbers.push(<PaginationEllipsis key="end-ellipsis" />);
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