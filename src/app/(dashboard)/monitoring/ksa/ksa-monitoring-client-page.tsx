// src/app/(dashboard)/monitoring/ksa/ksa-monitoring-client-page.tsx
"use client";

import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useYear } from '@/context/YearContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { useKsaMonitoringData, ProcessedKsaData, KsaTotals } from '@/hooks/useKsaMonitoringData';

export default function KsaMonitoringClientPage() {
  const { selectedYear } = useYear();

  const getCurrentMonthString = () => String(new Date().getMonth() + 1);
  const getPreviousMonthString = () => {
    const currentMonth = new Date().getMonth() + 1;
    return String(currentMonth === 1 ? 12 : currentMonth - 1);
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [hasAttemptedFallback, setHasAttemptedFallback] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { 
    data: dataKsa, 
    totals: totalsKsa, 
    isLoading, 
    error, 
    lastUpdated 
  } = useKsaMonitoringData(selectedMonth === "Semua" ? undefined : selectedMonth);

  useEffect(() => {
    if (!isLoading && !error && dataKsa) {
      const currentMonthStr = getCurrentMonthString();
      const previousMonthStr = getPreviousMonthString();
      if (selectedMonth === currentMonthStr && dataKsa.length === 0 && !hasAttemptedFallback) {
        setSelectedMonth(previousMonthStr);
        setHasAttemptedFallback(true);
      }
    }
  }, [isLoading, dataKsa, error, selectedMonth, hasAttemptedFallback]);

  const handleMonthChange = (newMonthValue: string) => {
    setSelectedMonth(newMonthValue);
    if (newMonthValue === getCurrentMonthString()) {
      setHasAttemptedFallback(false);
    } else {
      setHasAttemptedFallback(true);
    }
  };
  
  const months = [
    { value: "1", label: "Januari" }, { value: "2", label: "Februari" },
    { value: "3", label: "Maret" }, { value: "4", label: "April" },
    { value: "5", label: "Mei" }, { value: "6", label: "Juni" },
    { value: "7", label: "Juli" }, { value: "8", label: "Agustus" },
    { value: "9", label: "September" }, { value: "10", label: "Oktober" },
    { value: "11", label: "November" }, { value: "12", label: "Desember" },
  ];

  const columns = useMemo<ColumnDef<ProcessedKsaData, any>[]>(
    () => [
      {
        accessorKey: 'kabupaten',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full flex justify-start items-center" // Rata tengah header
          >
            Kabupaten/Kota
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-left">{row.getValue('kabupaten')}</div>, // Data rata tengah
        footer: () => <div className="text-left font-bold">Kalimantan Barat</div>, // Footer rata tengah
        size: 220, // Ukuran lebih besar untuk nama kabupaten
      },
      {
        accessorKey: 'target',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full flex justify-center items-center" // Rata tengah header
          >
            Target
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue<number>('target').toLocaleString('id-ID')}</div>, // Data rata tengah
        footer: () => <div className="text-center font-bold">{totalsKsa?.target.toLocaleString('id-ID')}</div>, // Footer rata tengah
        size: 100, // Ukuran proporsional
      },
      {
        accessorKey: 'realisasi',
        header: ({ column }) => (
           <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full flex justify-center items-center" // Rata tengah header
          >
            Realisasi
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue<number>('realisasi').toLocaleString('id-ID')}</div>, // Data rata tengah
        footer: () => <div className="text-center font-bold">{totalsKsa?.realisasi.toLocaleString('id-ID')}</div>, // Footer rata tengah
        size: 100, // Ukuran proporsional
      },
      {
        accessorKey: 'persentase',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full flex justify-center items-center" // Rata tengah header
          >
            Persentase (%)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue<number>('persentase').toFixed(2)}</div>, // Data rata tengah
        footer: () => <div className="text-center font-bold">{totalsKsa?.persentase.toFixed(2)}</div>, // Footer rata tengah
        size: 130, // Ukuran proporsional, sedikit lebih lebar untuk (%)
      },
      {
        accessorKey: 'inkonsisten',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full flex justify-center items-center" // Rata tengah header
          >
            Inkonsisten
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue<number>('inkonsisten').toLocaleString('id-ID')}</div>, // Data rata tengah
        footer: () => <div className="text-center font-bold">{totalsKsa?.inkonsisten.toLocaleString('id-ID')}</div>, // Footer rata tengah
        size: 110, // Ukuran proporsional
      },
      {
        accessorKey: 'kode_12',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full flex justify-center items-center" // Rata tengah header
          >
            Kode 12
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue<number>('kode_12').toLocaleString('id-ID')}</div>, // Data rata tengah
        footer: () => <div className="text-center font-bold">{totalsKsa?.kode_12.toLocaleString('id-ID')}</div>, // Footer rata tengah
        size: 100, // Ukuran proporsional
      },
    ],
    [totalsKsa]
  );

  const table = useReactTable({
    data: dataKsa || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // enableColumnResizing: true, // Jika ingin mengaktifkan resize kolom manual (opsional)
  });

  // ----- Bagian Skeleton Loading & Error Handling (Tetap Sama) -----
  if (isLoading && !dataKsa?.length && !hasAttemptedFallback) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <Skeleton className="h-8 w-full md:w-1/3" />
          <Skeleton className="h-10 w-full md:w-[180px]" />
        </div>
        <Skeleton className="h-6 w-1/2 md:w-1/4 mb-2" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between p-2 border-b">
                  <Skeleton className="h-5 w-[60px]" /> {/* Sesuaikan dengan size kolom No */}
                  <Skeleton className="h-5 flex-1 mx-1" /> {/* Kolom Kabupaten */}
                  <Skeleton className="h-5 w-[100px] mx-1" />
                  <Skeleton className="h-5 w-[100px] mx-1" />
                  <Skeleton className="h-5 w-[130px] mx-1" />
                  <Skeleton className="h-5 w-[110px] mx-1" />
                  <Skeleton className="h-5 w-[100px]" />
              </div>
              {[...Array(5)].map((_, i) => (
                 <div key={i} className="flex justify-between p-3 border-b">
                    <Skeleton className="h-5 w-[60px]" />
                    <Skeleton className="h-5 flex-1 mx-1" />
                    <Skeleton className="h-5 w-[100px] mx-1" />
                    <Skeleton className="h-5 w-[100px] mx-1" />
                    <Skeleton className="h-5 w-[130px] mx-1" />
                    <Skeleton className="h-5 w-[110px] mx-1" />
                    <Skeleton className="h-5 w-[100px]" />
                </div>
              ))}
              <div className="flex justify-between p-3 border-b bg-muted/50">
                    <Skeleton className="h-5 w-[60px]" />
                    <Skeleton className="h-5 flex-1 mx-1 font-bold" />
                    <Skeleton className="h-5 w-[100px] mx-1" />
                    <Skeleton className="h-5 w-[100px] mx-1" />
                    <Skeleton className="h-5 w-[130px] mx-1" />
                    <Skeleton className="h-5 w-[110px] mx-1" />
                    <Skeleton className="h-5 w-[100px]" />
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // ----- Bagian Tampilan Utama dengan TanStack Table -----
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="text-2xl font-semibold">Monitoring KSA (Kerangka Sampel Area)</h1>
        <Select onValueChange={handleMonthChange} value={selectedMonth}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Pilih Bulan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Bulan</SelectItem>
            {months.map(month => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {lastUpdated && (
        <p className="text-sm text-muted-foreground">
          Terakhir diperbarui: {lastUpdated}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Data KSA per Kabupaten (Tahun: {selectedYear}
            {selectedMonth !== "Semua" && months.find(m => m.value === selectedMonth) 
              ? `, Bulan: ${months.find(m => m.value === selectedMonth)?.label}` 
              : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tambahkan overflow-x-auto untuk scrolling horizontal pada layar kecil */}
          <div className="rounded-md border overflow-x-auto"> 
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        // Menggunakan style untuk mengatur lebar kolom berdasarkan `size`
                        <TableHead key={header.id} style={{ width: header.getSize() }}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map(cell => (
                        // Menggunakan style untuk mengatur lebar kolom berdasarkan `size`
                        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Tidak ada data untuk ditampilkan
                      {selectedMonth !== "Semua" && months.find(m => m.value === selectedMonth) 
                        ? ` untuk bulan ${months.find(m => m.value === selectedMonth)?.label}.` 
                        : '.'}
                      {selectedMonth === getPreviousMonthString() && hasAttemptedFallback && 
                       ` Data bulan ini juga kosong.`}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {totalsKsa && dataKsa && dataKsa.length > 0 && (
                <tfoot className="bg-muted/50 font-semibold">
                  {table.getFooterGroups().map(footerGroup => (
                    <TableRow key={footerGroup.id}>
                      {footerGroup.headers.map(header => (
                        // Menggunakan style untuk mengatur lebar kolom berdasarkan `size`
                        <TableCell key={header.id} className="p-2" style={{ width: header.column.getSize() }}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.footer,
                                header.getContext()
                              )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </tfoot>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}