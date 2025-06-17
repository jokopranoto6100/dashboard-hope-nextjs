// src/app/(dashboard)/evaluasi/ubinan/HasilUbinanDetailModalContent.tsx
"use client";

// Sebagian besar isinya mirip dengan DetailKabupatenModalContent.tsx
// Perbedaan utamanya adalah:
// - Memanggil RPC 'get_hasil_ubinan_detail_paginated'
// - Menggunakan 'hasilUbinanDetailColumns' dan tipe 'HasilUbinanDetailRow'
// - Menyesuaikan parameter RPC

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { hasilUbinanDetailColumns, HasilUbinanDetailRow } from './hasil-ubinan-detail-columns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useReactTable, getCoreRowModel, flexRender, SortingState } from "@tanstack/react-table";

const INITIAL_PAGE_SIZE = 15;

interface HasilUbinanDetailModalContentProps {
  kabCode: number;
  selectedYear: number | null;
  selectedSubround: number | 'all';
  selectedKomoditas: string | null;
}

export function HasilUbinanDetailModalContent({
  kabCode,
  selectedYear,
  selectedSubround,
  selectedKomoditas,
}: HasilUbinanDetailModalContentProps) {
  const supabase = createClientComponentSupabaseClient();
  const [data, setData] = useState<HasilUbinanDetailRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'r701', desc: true }]); // Default sort

  const fetchData = useCallback(async (pageToFetch: number, currentSize: number) => {
    if (!selectedYear || !selectedKomoditas) {
      setData([]);
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
      sort_column_key: sorting[0]?.id || 'r701', 
      sort_direction_val: sorting[0]?.desc ? 'DESC' : 'ASC',
      page_limit_val: currentSize,
      page_offset_val: (pageToFetch - 1) * currentSize,
    };

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_hasil_ubinan_detail_paginated', // Panggil RPC yang baru
        params
      );

      if (rpcError) throw rpcError;

      const resultData = rpcData as HasilUbinanDetailRow[] || [];
      setData(resultData);
      if (resultData.length > 0 && resultData[0].total_records !== undefined) {
        setTotalRecords(resultData[0].total_records); 
      } else if (!rpcError) {
        setTotalRecords(0);
      }

    } catch (err: any) {
      setError(err.message || "Gagal memuat data detail hasil ubinan.");
      setData([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [kabCode, selectedYear, selectedSubround, selectedKomoditas, supabase, sorting]);

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [fetchData, currentPage, pageSize]);

  useEffect(() => {
    if (currentPage !== 1) {
        setCurrentPage(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting, pageSize]);

  const pageCount = Math.ceil(totalRecords / pageSize);
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (value: string) => setPageSize(Number(value));

  const columns = useMemo(() => hasilUbinanDetailColumns, []);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  // Tampilan (JSX) di sini bisa di-copy-paste dari DetailKabupatenModalContent
  // karena strukturnya identik (tabel, skeleton, pagination, dll).
  // Pastikan variabel 'processedData' diganti dengan 'data'.
  
 // Skeleton untuk loading awal sebelum ada data sama sekali
   if (isLoading && data.length === 0 && totalRecords === 0 && !error) { 
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
   if (data.length === 0 && !isLoading) { 
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