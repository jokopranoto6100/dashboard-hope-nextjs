/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/monitoring/ksa/ksa-monitoring-client-page.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useYear } from '@/context/YearContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ArrowUpDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button"; // Pastikan Button diimpor jika digunakan untuk sorting kolom lain
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPercentageBadgeVariant } from "@/lib/utils";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { useKsaMonitoringData, ProcessedKsaData } from '@/hooks/useKsaMonitoringData';

export default function KsaMonitoringClientPage() {
  const { selectedYear } = useYear();

  const initialMonth = useMemo(() => String(new Date().getMonth() + 1), []);
  
  const [displayMonth, setDisplayMonth] = useState<string>(initialMonth);
  const [fetchBehavior, setFetchBehavior] = useState<'autoFallback' | 'directFetch'>('autoFallback');
  
  const [sorting, setSorting] = useState<SortingState>([]);

  const { 
    data: dataKsa, 
    ksaTotals, 
    isLoading, 
    error, 
    lastUpdated,
    effectiveDisplayMonth 
  } = useKsaMonitoringData(displayMonth, fetchBehavior);

  useEffect(() => {
    if (fetchBehavior === 'autoFallback' && !isLoading && effectiveDisplayMonth) {
      if (effectiveDisplayMonth !== displayMonth) {
        setDisplayMonth(effectiveDisplayMonth);
      }
      setFetchBehavior('directFetch'); 
    }
  }, [isLoading, effectiveDisplayMonth, fetchBehavior, displayMonth]);

  const handleMonthChange = (newMonthValue: string) => {
    setDisplayMonth(newMonthValue);
    setFetchBehavior('directFetch'); 
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
        // Menghapus Button untuk sorting, header menjadi teks biasa
        header: () => <div className="text-left pl-2">Kabupaten/Kota</div>, 
        cell: ({ row }) => <div className="text-left pl-2">{row.getValue('kabupaten')}</div>,
        footer: () => <div className="text-left pl-2 font-bold">Kalimantan Barat</div>,
        size: 220, 
        enableSorting: false, // Menonaktifkan sorting untuk kolom ini
      },
      {
        accessorKey: 'target',
        // Menghapus Button untuk sorting, header menjadi teks biasa
        header: () => <div className="text-center">Target</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue<number>('target').toLocaleString('id-ID')}</div>,
        footer: () => <div className="text-center font-bold">{ksaTotals?.target.toLocaleString('id-ID')}</div>,
        size: 100, 
        enableSorting: false, // Menonaktifkan sorting untuk kolom ini
      },
      {
        accessorKey: 'realisasi',
        // Menghapus Button untuk sorting, header menjadi teks biasa
        header: () => <div className="text-center">Realisasi</div>,
        cell: ({ row }) => <div className="text-center">{row.getValue<number>('realisasi').toLocaleString('id-ID')}</div>,
        footer: () => <div className="text-center font-bold">{ksaTotals?.realisasi.toLocaleString('id-ID')}</div>,
        size: 100, 
        enableSorting: false, // Menonaktifkan sorting untuk kolom ini
      },
      {
        accessorKey: 'persentase',
        header: ({ column }) => ( 
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full flex justify-center items-center" >
            Persentase (%) <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const rawValue = row.getValue<string | number>('persentase');
          const value = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
          if (typeof value !== 'number' || isNaN(value)) return <div className="text-center">-</div>;
          const showCheckmark = value >= 100;
          return ( <div className="text-center"> <Badge variant={getPercentageBadgeVariant(value)}> {showCheckmark && <CheckCircle2 className="mr-1 h-3 w-3" />} {value.toFixed(2)}% </Badge> </div> );
        },
        footer: () => {
          if (!ksaTotals?.persentase) return <div className="text-center font-bold">-</div>;
          const rawValue = ksaTotals.persentase;
          const value = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
          if (typeof value !== 'number' || isNaN(value)) return <div className="text-center font-bold">-</div>;
          const showCheckmark = value >= 100;
          return ( <div className="text-center font-bold"> <Badge variant={getPercentageBadgeVariant(value)}> {showCheckmark && <CheckCircle2 className="mr-1 h-3 w-3" />} {value.toFixed(2)}% </Badge> </div> );
        },
        size: 130, 
      },
      {
        accessorKey: 'inkonsisten',
        header: ({ column }) => ( 
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full flex justify-center items-center" >
            Inkonsisten <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue<number>('inkonsisten').toLocaleString('id-ID')}</div>,
        footer: () => <div className="text-center font-bold">{ksaTotals?.inkonsisten.toLocaleString('id-ID')}</div>,
        size: 110, 
      },
      {
        accessorKey: 'kode_12',
        header: ({ column }) => ( 
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full flex justify-center items-center" >
            Kode 12 <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue<number>('kode_12').toLocaleString('id-ID')}</div>,
        footer: () => <div className="text-center font-bold">{ksaTotals?.kode_12.toLocaleString('id-ID')}</div>,
        size: 100, 
      },
    ],
    [ksaTotals, getPercentageBadgeVariant] // Tambahkan getPercentageBadgeVariant ke dependencies jika ia adalah fungsi dari luar scope
  );

  const table = useReactTable({
    data: dataKsa || [],
    columns,
    state: { sorting, },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) { 
    return (
      <div className="container mx-auto py-4">
        {/* Judul halaman tidak ditampilkan saat loading, atau bisa diganti skeleton */}
        <div className="mb-4 flex flex-col md:flex-row justify-end items-center gap-2">
          <Skeleton className="h-10 w-full md:w-[180px]" /> {/* Hanya skeleton untuk filter bulan */}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-3/4 mb-2" /> 
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-4">
                <Table>
                <TableHeader>
                    <TableRow>
                    {columns.map((column) => {
                        const colDef = column as ColumnDef<ProcessedKsaData, any>;
                        return (
                            <TableHead key={colDef.id ?? (colDef as any).accessorKey} style={{ width: colDef.size ? `${colDef.size}px` : 'auto', minWidth: colDef.minSize ? `${colDef.minSize}px` : 'auto' }}>
                            <Skeleton className="h-5 w-full" />
                            </TableHead>
                        );
                    })}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                        {columns.map((column) => {
                            const colDef = column as ColumnDef<ProcessedKsaData, any>;
                            return(
                                <TableCell key={colDef.id ?? (colDef as any).accessorKey} style={{ width: colDef.size ? `${colDef.size}px` : 'auto', minWidth: colDef.minSize ? `${colDef.minSize}px` : 'auto' }}>
                                <Skeleton className="h-5 w-full" />
                                </TableCell>
                            );
                        })}
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) { 
    return (
      <div className="container mx-auto py-4 md:py-6">
        {/* Judul halaman tidak ditampilkan saat error, atau bisa diganti */}
         <div className="mb-4 flex flex-col md:flex-row justify-end items-center gap-2">
             <Select onValueChange={handleMonthChange} value={displayMonth || ''}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Semua">Semua Bulan</SelectItem>
                    {months.map(month => ( <SelectItem key={month.value} value={month.value}> {month.label} </SelectItem> ))}
                </SelectContent>
            </Select>
        </div>
        <Alert variant="destructive" className="m-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Memuat Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return ( 
    <div className="container mx-auto py-4 md:py-6"> 
      {/* Menghapus judul utama "Monitoring KSA (Kerangka Sampel Area)" */}
      <div className="mb-4 flex flex-col md:flex-row justify-end items-center gap-2"> {/* Filter bulan di kanan atas */}
        <Select onValueChange={handleMonthChange} value={displayMonth || ''}> 
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

      <Card>
        <CardHeader>
          {/* Mengubah CardTitle */}
          <CardTitle>
            Monitoring KSA Padi
          </CardTitle>
          <CardDescription>
            {!isLoading && lastUpdated && <span className="block text-sm text-gray-500 mt-1">Terakhir diperbarui: {lastUpdated}</span>}
            {/* Skeleton untuk lastUpdated tidak perlu lagi di sini karena isLoading sudah menangani tampilan loading utama */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full rounded-md border"> 
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id} style={{ width: header.getSize() }}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map(cell => (
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
                      {displayMonth !== "Semua" && months.find(m => m.value === displayMonth) 
                        ? ` untuk bulan ${months.find(m => m.value === displayMonth)?.label}.` 
                        : '.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {ksaTotals && dataKsa && dataKsa.length > 0 && (
                <tfoot className="bg-muted/50 font-semibold">
                  {table.getFooterGroups().map(footerGroup => (
                    <TableRow key={footerGroup.id}>
                      {footerGroup.headers.map(header => (
                        <TableCell key={header.id} className="p-2" style={{ width: header.column.getSize() }}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </tfoot>
              )}
            </Table>
          </ScrollArea>
          {!isLoading && !error && (!dataKsa || dataKsa.length === 0) && (
            <p className="text-center text-gray-500 py-4">
                Tidak ada data KSA Padi ditemukan untuk Tahun {selectedYear}
                {displayMonth !== "Semua" && months.find(m => m.value === displayMonth) 
                    ? ` dan Bulan ${months.find(m => m.value === displayMonth)?.label}` 
                    : ''}.
            </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}