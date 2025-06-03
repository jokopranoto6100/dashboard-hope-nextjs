// src/app/(dashboard)/monitoring/ksa/ksa-monitoring-client-page.tsx
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useYear } from '@/context/YearContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ArrowUpDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

import { useKsaMonitoringData, ProcessedKsaData, KsaTotals, StatusValue } from '@/hooks/useKsaMonitoringData';

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
    effectiveDisplayMonth,
    uniqueStatusNames
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

  // Move fixedStartColumns and fixedEndColumns outside so they are accessible everywhere
  const fixedStartColumns: ColumnDef<ProcessedKsaData, any>[] = [
    {
      accessorKey: 'kabupaten',
      header: () => <div className="text-left pl-2">Kabupaten/Kota</div>, 
      cell: ({ row }) => <div className="text-left pl-2">{row.original.kabupaten}</div>,
      footer: () => <div className="text-left pl-2 font-bold">Kalimantan Barat</div>,
      size: 180, // Lebar disesuaikan
      minSize: 150,
      enableSorting: false,
    },
    {
      accessorKey: 'target',
      header: () => <div className="text-center">Target</div>,
      cell: ({ row }) => <div className="text-center">{row.original.target.toLocaleString('id-ID')}</div>,
      footer: () => <div className="text-center font-bold">{ksaTotals?.target?.toLocaleString('id-ID') ?? '-'}</div>,
      size: 70, 
      minSize: 60,
      enableSorting: false,
    },
    {
      accessorKey: 'realisasi',
      header: () => <div className="text-center">Realisasi</div>,
      cell: ({ row }) => <div className="text-center">{row.original.realisasi.toLocaleString('id-ID')}</div>,
      footer: () => <div className="text-center font-bold">{ksaTotals?.realisasi?.toLocaleString('id-ID') ?? '-'}</div>,
      size: 70, 
      minSize: 60,
      enableSorting: false,
    },
    {
      accessorKey: 'persentase',
      header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > Persentase (%) <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ),
      cell: ({ row }) => { 
        const rawValue = row.original.persentase;
        const value = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
        if (typeof value !== 'number' || isNaN(value)) return <div className="text-center">-</div>;
        const showCheckmark = value >= 100;
        return ( <div className="text-center"> <Badge variant={getPercentageBadgeVariant(value)} className="text-xs px-1.5 py-0.5"> {showCheckmark && <CheckCircle2 className="mr-0.5 h-3 w-3" />} {value.toFixed(2)}% </Badge> </div> );
      },
      footer: () => { 
        if (!ksaTotals?.persentase) return <div className="text-center font-bold">-</div>;
        const rawValue = ksaTotals.persentase;
        const value = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
        if (typeof value !== 'number' || isNaN(value)) return <div className="text-center font-bold">-</div>;
        const showCheckmark = value >= 100;
        return ( <div className="text-center font-bold"> <Badge variant={getPercentageBadgeVariant(value)} className="text-xs px-1.5 py-0.5"> {showCheckmark && <CheckCircle2 className="mr-0.5 h-3 w-3" />} {value.toFixed(2)}% </Badge> </div> );
      },
      size: 110, 
      minSize: 100,
    },
  ];
  
  const fixedEndColumns: ColumnDef<ProcessedKsaData, any>[] = [
    {
      accessorKey: 'Inkonsisten',
      header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > Inkonsisten <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ),
      cell: ({ row }) => <div className="text-center">{row.original.inkonsisten.toLocaleString('id-ID')}</div>,
      footer: () => <div className="text-center font-bold">{ksaTotals?.inkonsisten?.toLocaleString('id-ID') ?? '-'}</div>,
      size: 90,
      minSize: 80,
    },
    {
      accessorKey: 'kode_12',
      header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > Kode 12 <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ),
      cell: ({ row }) => <div className="text-center">{row.original.kode_12.toLocaleString('id-ID')}</div>,
      footer: () => <div className="text-center font-bold">{ksaTotals?.kode_12?.toLocaleString('id-ID') ?? '-'}</div>,
      size: 80, 
      minSize: 70,
    },
  ];
  
    const columns = useMemo<ColumnDef<ProcessedKsaData, any>[]>(() => {
      const dynamicStatusColumns: ColumnDef<ProcessedKsaData, any>[] = (uniqueStatusNames || []).map(statusName => ({
        id: `status_${statusName.replace(/\s+/g, '_')}`,
        header: ({column}) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0">
            {statusName}
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        // Mengubah accessorFn untuk sorting berdasarkan persentase status
        accessorFn: row => row.statuses?.[statusName]?.percentage ?? 0, 
        cell: ({ row }) => {
          const statusData = row.original.statuses?.[statusName];
          // Tetap menampilkan count dan percentage
          if (!statusData || statusData.count === 0) return <div className="text-center text-xs">-</div>;
          return (
            <div className="text-center text-xs tabular-nums"> {/* tabular-nums untuk angka */}
              {statusData.count} ({statusData.percentage.toFixed(1)}%)
            </div>
          );
        },
        footer: () => {
          const totalStatusData = ksaTotals?.statuses?.[statusName];
          if (!totalStatusData || totalStatusData.count === 0) return <div className="text-center font-bold text-xs">-</div>;
          return (
            <div className="text-center font-bold text-xs tabular-nums">
              {totalStatusData.count} ({totalStatusData.percentage.toFixed(1)}%)
            </div>
          );
        },
        size: 120, // Lebar untuk setiap kolom status
        minSize: 100, // Lebar minimum
        enableSorting: true,
      }));
      return [...fixedStartColumns, ...dynamicStatusColumns, ...fixedEndColumns];
    }, [ksaTotals, getPercentageBadgeVariant, uniqueStatusNames]);

  const table = useReactTable({
    data: dataKsa || [],
    columns,
    state: { sorting, },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: 'onChange', // Memungkinkan penyesuaian lebar kolom jika diperlukan di masa mendatang
  });

  // Konfigurasi untuk skeleton kolom
  const skeletonColumnsConfig = useMemo(() => {
    // Mengambil konfigurasi dari kolom yang sudah ada (termasuk kolom status dinamis jika sudah termuat)
    // atau membuat placeholder jika kolom status belum ada
    if (isLoading && (!uniqueStatusNames || uniqueStatusNames.length === 0)) {
        const baseFixedStart = fixedStartColumns.map(c => ({ id: c.id ?? (c as any).accessorKey, size: (c as any).size, minSize: (c as any).minSize}));
        const baseFixedEnd = fixedEndColumns.map(c => ({ id: c.id ?? (c as any).accessorKey, size: (c as any).size, minSize: (c as any).minSize}));
        const statusPlaceholders = Array.from({ length: 2 }).map((_, i) => ({ 
            id: `status_skeleton_${i}`, size: 120, minSize: 100 
        }));
        return [...baseFixedStart, ...statusPlaceholders, ...baseFixedEnd];
    }
    // Jika sudah ada uniqueStatusNames, gunakan struktur kolom aktual untuk skeleton
    return columns.map(c => ({ id: c.id ?? (c as any).accessorKey, size: (c as any).size, minSize: (c as any).minSize}));
  }, [isLoading, columns, uniqueStatusNames, fixedStartColumns, fixedEndColumns]); // Tambahkan fixedStart/EndColumns


  if (isLoading) { 
    return (
      <div className="container mx-auto py-4 md:py-6">
        <div className="mb-4 flex flex-col md:flex-row justify-end items-center gap-2">
          <Skeleton className="h-10 w-full md:w-[180px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-3/4 mb-2" /> 
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border"> {/* Tidak perlu p-4 jika tabel langsung */}
                <Table>
                <TableHeader>
                    <TableRow>
                    {skeletonColumnsConfig.map((column) => {
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
                        {skeletonColumnsConfig.map((column) => {
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
         <div className="mb-4 flex flex-col md:flex-row justify-end items-center gap-2">
             <Select onValueChange={handleMonthChange} value={displayMonth || ''} disabled={isLoading}>
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
      <div className="mb-4 flex flex-col md:flex-row justify-end items-center gap-2">
        <Select onValueChange={handleMonthChange} value={displayMonth || ''} disabled={isLoading}>
          <SelectTrigger className="w-full md:w-[180px]"> <SelectValue placeholder="Pilih Bulan" /> </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Bulan</SelectItem>
            {months.map(month => ( <SelectItem key={month.value} value={month.value}> {month.label} </SelectItem> ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader>
          <CardTitle> Monitoring KSA Padi </CardTitle>
          <CardDescription>
            {!isLoading && lastUpdated && <span className="block text-sm text-gray-500 mt-1">Terakhir diperbarui: {lastUpdated}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full rounded-md border"> 
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => ( <TableHead key={header.id} style={{ width: header.getSize(), minWidth: header.column.columnDef.minSize ? `${header.column.columnDef.minSize}px` : undefined }}> {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())} </TableHead> ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map(cell => ( <TableCell key={cell.id} style={{ width: cell.column.getSize(), minWidth: cell.column.columnDef.minSize ? `${cell.column.columnDef.minSize}px` : undefined }} className="p-2"> {/* Mengurangi padding sel */} {flexRender(cell.column.columnDef.cell, cell.getContext())} </TableCell> ))}
                    </TableRow>
                  ))
                ) : ( <TableRow> <TableCell colSpan={columns.length} className="h-24 text-center"> Tidak ada data untuk ditampilkan {displayMonth !== "Semua" && months.find(m => m.value === displayMonth) ? ` untuk bulan ${months.find(m => m.value === displayMonth)?.label}.` : '.'} </TableCell> </TableRow> )}
              </TableBody>
              {ksaTotals && dataKsa && dataKsa.length > 0 && (
                <tfoot className="bg-muted/50 font-semibold">
                  {table.getFooterGroups().map(footerGroup => (
                    <TableRow key={footerGroup.id}>
                      {footerGroup.headers.map(header => ( <TableCell key={header.id} className="p-2" style={{ width: header.column.getSize(), minWidth: header.column.columnDef.minSize ? `${header.column.columnDef.minSize}px` : undefined }}> {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())} </TableCell> ))}
                    </TableRow>
                  ))}
                </tfoot>
              )}
            </Table>
          </ScrollArea>
          {!isLoading && !error && (!dataKsa || dataKsa.length === 0) && ( <p className="text-center text-gray-500 py-4"> Tidak ada data KSA Padi ditemukan untuk Tahun {selectedYear} {displayMonth !== "Semua" && months.find(m => m.value === displayMonth) ? ` dan Bulan ${months.find(m => m.value === displayMonth)?.label}` : ''}. </p> )}
        </CardContent>
      </Card>
    </div>
  );
}