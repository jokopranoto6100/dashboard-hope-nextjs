// src/app/(dashboard)/evaluasi/ubinan/DetailKabupatenModalContent.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
// import { Tables } from '@/lib/database.types'; // Tidak langsung digunakan, DetailRecordRawData sudah spesifik
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { detailRecordColumns, DetailRecordRowProcessed, DetailRecordRawData } from './detail-record-columns';
import {
  useReactTable,
  getCoreRowModel,
  // getSortedRowModel, // Tidak utama untuk server-side sorting
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

// Map accessorKey dari kolom tabel (DetailRecordRowProcessed) ke nama kolom di database (DetailRecordRawData) untuk sorting
// Ini penting karena sorting server-side harus menggunakan nama kolom DB
const columnAccessorToDbFieldMap: Record<keyof Partial<DetailRecordRowProcessed>, keyof DetailRecordRawData | null> = {
  r111: 'r111',
  r604: 'r604',
  // Untuk kolom per hektar, kita sort berdasarkan nilai mentahnya di DB.
  benih_kg_ha: 'r608',
  urea_kg_ha: 'r610_1',
  tsp_kg_ha: 'r610_2',
  kcl_kg_ha: 'r610_3',
  npk_kg_ha: 'r610_4',
  kompos_kg_ha: 'r610_5',
  organik_cair_liter_ha: 'r610_6',
  za_kg_ha: 'r610_7',
  // Field mentah di DetailRecordRowProcessed tidak perlu di-map karena namanya sudah sesuai
  r608_bibit_kg_mentah: 'r608',
  r610_1_urea_kg_mentah: 'r610_1',
  // ... dan seterusnya jika Anda menambahkan kolom mentah lain ke tabel detail
};


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
  const [sorting, setSorting] = React.useState<SortingState>([
    // Order default: benih mentah (r608) descending. Ini akan mencerminkan benih_kg_ha desc jika luas tanam mirip.
    { id: 'benih_kg_ha', desc: true }
  ]);

  const fetchData = useCallback(async () => {
    if (!selectedYear || !selectedKomoditas) {
      setProcessedData([]);
      setTotalRecords(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setCurrentPage(1); // Reset ke halaman 1 setiap kali filter utama atau sorting berubah

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      let query = supabase
        .from('ubinan_raw')
        .select('r111, r604, r608, r610_1, r610_2, r610_3, r610_4, r610_5, r610_6, r610_7', { count: 'exact' })
        .eq('kab', kabCode)
        .eq('tahun', selectedYear)
        .eq('komoditas', selectedKomoditas)
        .not('r111', 'is', null);

      if (selectedSubround !== 'all') {
        query = query.eq('subround', selectedSubround);
      }
      
      if (sorting.length > 0) {
        const sortConfig = sorting[0];
        const dbFieldToSort = columnAccessorToDbFieldMap[sortConfig.id as keyof Partial<DetailRecordRowProcessed>];
        
        if (dbFieldToSort) {
             query = query.order(dbFieldToSort as string, { ascending: !sortConfig.desc, nullsFirst: false });
        } else {
            // Fallback atau default order jika mapping tidak ditemukan (seharusnya tidak terjadi jika map lengkap)
            console.warn(`No DB field mapping for sorting key: ${sortConfig.id}. Defaulting to r111.`);
            query = query.order('r111', { ascending: true, nullsFirst: false });
        }
      } else {
        // Ini seharusnya tidak tercapai karena sorting memiliki initial state
        query = query.order('r111', { ascending: true, nullsFirst: false }); 
      }

      const { data: pageData, error: pageError, count } = await query.range(from, to);

      if (pageError) throw pageError;

      const rawData = pageData as DetailRecordRawData[] || [];
      const transformedData = rawData.map(item => {
        const luasHa = item.r604 && item.r604 > 0 ? item.r604 / 10000 : null;
        const calculatePerHa = (value: number | null) => (luasHa !== null && value !== null ? value / luasHa : null);
        
        return {
          r111: item.r111,
          r604: item.r604,
          // Simpan nilai mentah
          r608_bibit_kg_mentah: item.r608,
          r610_1_urea_kg_mentah: item.r610_1,
          r610_2_tsp_kg_mentah: item.r610_2,
          r610_3_kcl_kg_mentah: item.r610_3,
          r610_4_npk_kg_mentah: item.r610_4,
          r610_5_kompos_kg_mentah: item.r610_5,
          r610_6_organik_cair_liter_mentah: item.r610_6,
          r610_7_za_kg_mentah: item.r610_7,
          // Hitung nilai per hektar
          benih_kg_ha: calculatePerHa(item.r608),
          urea_kg_ha: calculatePerHa(item.r610_1),
          tsp_kg_ha: calculatePerHa(item.r610_2),
          kcl_kg_ha: calculatePerHa(item.r610_3),
          npk_kg_ha: calculatePerHa(item.r610_4),
          kompos_kg_ha: calculatePerHa(item.r610_5),
          organik_cair_liter_ha: calculatePerHa(item.r610_6),
          za_kg_ha: calculatePerHa(item.r610_7),
        };
      });

      setProcessedData(transformedData);
      setTotalRecords(count || 0);
    } catch (err: any) {
      console.error("Error fetching detail data:", err);
      setError(err.message || "Gagal memuat data detail.");
      setProcessedData([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [kabCode, selectedYear, selectedSubround, selectedKomoditas, currentPage, supabase, sorting]);

  useEffect(() => {
    // Reset halaman ke 1 jika filter utama berubah, tapi jangan jika hanya sorting yang berubah
    // Logika ini dipindahkan ke dalam useCallback fetchData, di mana currentPage direset
    // saat filter utama (selain currentPage dan sorting) berubah.
    // Jika ingin reset currentPage saat sorting berubah juga, pindahkan setCurrentPage(1)
    // ke dalam useEffect yang bergantung pada sorting.
    // Untuk saat ini, sorting akan me-fetch halaman yang sama dengan urutan baru.
    fetchData();
  }, [fetchData]); 

  // Reset currentPage ke 1 jika sorting berubah, agar user melihat awal dari data yang baru diurutkan
   useEffect(() => {
    if (sorting.length > 0) { // Hanya reset jika ada interaksi sorting
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

  if (isLoading && processedData.length === 0) { // Tampilkan skeleton hanya jika belum ada data sama sekali
    return ( <div className="space-y-2 p-4">{[...Array(Math.floor(ITEMS_PER_PAGE / 4))].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div> );
  }
  if (error) { return <p className="text-red-500 text-center p-4">Error: {error}</p>; }
  if (processedData.length === 0 && !isLoading) { return <p className="text-center p-4">Tidak ada data detail untuk ditampilkan (Nama responden tidak kosong).</p>; }

  return (
    <div className="p-0 md:p-2 space-y-4">
      {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center"><p>Memuat...</p></div>} {/* Indikator loading overlay */}
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
                    title={`Urutkan berdasarkan ${typeof header.column.columnDef.header === 'function' ? (header.column.columnDef.header as Function)(header.getContext())?.props?.children[0]?.props?.children : header.column.id }`} // Tooltip sederhana
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
                    let startPage = Math.max(2, currentPage - Math.floor((MAX_VISIBLE_PAGES - 3) / 2)); // -3 karena 1, ..., N
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