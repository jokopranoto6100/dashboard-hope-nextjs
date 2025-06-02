// src/app/(dashboard)/monitoring/ksa/ksa-monitoring-client-page.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useYear } from '@/context/YearContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Tambahkan CardDescription
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ArrowUpDown, CheckCircle2 } from "lucide-react"; // Tambahkan CheckCircle2
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Impor Badge
import { ScrollArea } from "@/components/ui/scroll-area"; // Impor ScrollArea
import { getPercentageBadgeVariant } from "@/lib/utils"; // Impor helper untuk Badge

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { useKsaMonitoringData, ProcessedKsaData, } from '@/hooks/useKsaMonitoringData';

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
    totals: ksaTotals, 
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
            className="w-full flex justify-start items-center px-1 text-left"
          >
            Kabupaten/Kota
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-left pl-2">{row.getValue('kabupaten')}</div>,
        footer: () => <div className="text-left pl-2 font-bold">Kalimantan Barat</div>,
        size: 220, 
      },
      {
        accessorKey: 'target',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full flex justify-center items-center" >
            Target <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue<number>('target').toLocaleString('id-ID')}</div>,
        footer: () => <div className="text-center font-bold">{ksaTotals?.target.toLocaleString('id-ID')}</div>,
        size: 100, 
      },
      {
        accessorKey: 'realisasi',
        header: ({ column }) => (
           <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full flex justify-center items-center" >
            Realisasi <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue<number>('realisasi').toLocaleString('id-ID')}</div>,
        footer: () => <div className="text-center font-bold">{ksaTotals?.realisasi.toLocaleString('id-ID')}</div>,
        size: 100, 
      },
      {
        accessorKey: 'persentase',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full flex justify-center items-center" >
            Persentase (%) <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => { // Adaptasi Badge untuk Persentase
          const rawValue = row.getValue<string | number>('persentase');
          const value = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
          if (typeof value !== 'number' || isNaN(value)) return <div className="text-center">-</div>;
          const showCheckmark = value >= 100;
          return (
            <div className="text-center">
              <Badge variant={getPercentageBadgeVariant(value)}>
                {showCheckmark && <CheckCircle2 className="mr-1 h-3 w-3" />} {/* Menyesuaikan ukuran ikon jika perlu */}
                {value.toFixed(2)}%
              </Badge>
            </div>
          );
        },
        footer: () => { // Adaptasi Badge untuk Footer Persentase
          if (!ksaTotals?.persentase) return <div className="text-center font-bold">-</div>;
          const rawValue = ksaTotals.persentase;
          const value = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
          if (typeof value !== 'number' || isNaN(value)) return <div className="text-center font-bold">-</div>;
          const showCheckmark = value >= 100;
          return (
            <div className="text-center font-bold">
              <Badge variant={getPercentageBadgeVariant(value)}>
                {showCheckmark && <CheckCircle2 className="mr-1 h-3 w-3" />}
                {value.toFixed(2)}%
              </Badge>
            </div>
          );
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
    [ksaTotals]
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
  });

  // Skeleton columns definition (bisa disesuaikan lebih lanjut jika diperlukan)
  const skeletonColumns: Partial<ColumnDef<ProcessedKsaData>>[] = useMemo(() => columns.map(col => ({
    id: col.id ?? (col as any).accessorKey, // Menangani jika id tidak eksplisit
    size: (col as any).size,
    minSize: (col as any).minSize,
  })), [columns]);


  if (isLoading && !dataKsa?.length && !hasAttemptedFallback) {
    return (
      <div className="container mx-auto py-4 md:py-6"> {/* Menggunakan container */}
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-2"> {/* Menambah mb-4 */}
          <Skeleton className="h-8 w-full md:w-1/3" />
          <Skeleton className="h-10 w-full md:w-[180px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-3/4 mb-2" /> {/* Skeleton untuk CardTitle */}
            <Skeleton className="h-4 w-1/2" />      {/* Skeleton untuk CardDescription (last updated) */}
          </CardHeader>
          <CardContent>
            {/* Skeleton Table */}
            <div className="rounded-md border p-4">
                <Table>
                <TableHeader>
                    <TableRow>
                    {skeletonColumns.map((column) => (
                        <TableHead key={column.id} style={{ width: column.size ? `${column.size}px` : 'auto', minWidth: column.minSize ? `${column.minSize}px` : 'auto' }}>
                        <Skeleton className="h-5 w-full" />
                        </TableHead>
                    ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                        {skeletonColumns.map((column) => (
                        <TableCell key={column.id} style={{ width: column.size ? `${column.size}px` : 'auto', minWidth: column.minSize ? `${column.minSize}px` : 'auto' }}>
                            <Skeleton className="h-5 w-full" />
                        </TableCell>
                        ))}
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
      <div className="container mx-auto py-4 md:py-6"> {/* Menggunakan container */}
        <Alert variant="destructive" className="m-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    // Menggunakan container mx-auto dan padding vertikal
    <div className="container mx-auto"> 
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-2"> {/* Menambah mb-4 */}
        <h1 className="text-2xl font-semibold"></h1>
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

      {/* Card Utama untuk tabel KSA */}
      <Card>
        <CardHeader>
          <CardTitle>
            Monitoring KSA Padi
          </CardTitle>
          {/* Menampilkan lastUpdated di CardDescription */}
          <CardDescription>
            {!isLoading && lastUpdated && <span className="block text-sm text-gray-500 mt-1">Terakhir diperbarui: {lastUpdated}</span>}
            {isLoading && <Skeleton className="h-4 w-[250px] mt-2" />}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Menggunakan ScrollArea seperti di Ubinan */}
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
                      {selectedMonth !== "Semua" && months.find(m => m.value === selectedMonth) 
                        ? ` untuk bulan ${months.find(m => m.value === selectedMonth)?.label}.` 
                        : '.'}
                      {selectedMonth === getPreviousMonthString() && hasAttemptedFallback && 
                       ` Data bulan ini juga kosong.`}
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
          {/* Menampilkan pesan jika data benar-benar kosong setelah loading selesai */}
          {!isLoading && !error && (!dataKsa || dataKsa.length === 0) && (
            <p className="text-center text-gray-500 py-4">
                Tidak ada data KSA ditemukan untuk Tahun {selectedYear}
                {selectedMonth !== "Semua" && months.find(m => m.value === selectedMonth) 
                    ? ` dan Bulan ${months.find(m => m.value === selectedMonth)?.label}` 
                    : ''}.
            </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}