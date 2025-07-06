/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/monitoring/ksa/jagung/NamaKsaJagungTable.tsx
"use client";

import React, { useMemo, useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, CheckCircle2, Eye, EyeOff, FileDown } from "lucide-react";
import { getPercentageBadgeVariant } from "@/lib/utils";
import { ProcessedKsaJagungNamaData } from '@/hooks/useKsaJagungMonitoringData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { type Kegiatan } from '@/app/(dashboard)/jadwal/jadwal.config';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

interface NamaKsaJagungTableProps {
  title: string;
  description: string;
  data: ProcessedKsaJagungNamaData[];
  totals: any;
  uniqueStatusNames: string[];
  kabupatenName: string;
  isLoading: boolean;
  onGenerateBaClick: (petugasData: ProcessedKsaJagungNamaData) => void;
  jadwal?: Kegiatan;
  displayMonth: string | undefined;
}

const getDiffInDays = (d1: Date, d2: Date): number => {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

const TableSkeleton = ({ columns }: { columns: ColumnDef<ProcessedKsaJagungNamaData, unknown>[] }) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => ( <TableHead key={index} style={{ width: column.size ? `${column.size}px` : 'auto' }} className="p-2"><Skeleton className="h-5 w-full" /></TableHead> ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, cellIndex) => ( <TableCell key={cellIndex} style={{ width: column.size ? `${column.size}px` : 'auto' }} className="p-2"><Skeleton className="h-5 w-full" /></TableCell> ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
);

export function NamaKsaJagungTable({ title, description, data, totals, uniqueStatusNames, kabupatenName, isLoading, onGenerateBaClick, jadwal, displayMonth }: NamaKsaJagungTableProps) {
  const isMobile = useIsMobile();
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const countdownStatus = React.useMemo(() => {
    if (!jadwal || !displayMonth) return null;
    const currentMonth = parseInt(displayMonth, 10) - 1; // Bulan di Date object 0-indexed

    const allJadwalItems = [...(jadwal.jadwal || []), ...(jadwal.subKegiatan?.flatMap(sub => sub.jadwal || []) || [])]
      .filter(item => new Date(item.startDate).getMonth() === currentMonth);

    if (allJadwalItems.length === 0) return null;

    const allStartDates = allJadwalItems.map(j => new Date(j.startDate));
    const allEndDates = allJadwalItems.map(j => new Date(j.endDate));

    const earliestStart = new Date(Math.min(...allStartDates.map(d => d.getTime())));
    const latestEnd = new Date(Math.max(...allEndDates.map(d => d.getTime())));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today > latestEnd) return { text: "Jadwal Telah Berakhir", color: "text-gray-500" };
    if (today >= earliestStart && today <= latestEnd) {
      const daysLeft = getDiffInDays(today, latestEnd);
      if (daysLeft === 0) return { text: "Berakhir Hari Ini", color: "text-red-600 font-bold" };
      return { text: `Berakhir dalam ${daysLeft} hari`, color: "text-green-600" };
    }
    if (today < earliestStart) {
      const daysUntil = getDiffInDays(today, earliestStart);
       if (daysUntil === 1) return { text: "Dimulai Besok", color: "text-blue-600" };
      return { text: `Dimulai dalam ${daysUntil} hari`, color: "text-blue-600" };
    }
    return null;
  }, [jadwal, displayMonth]);

  // PERBEDAAN: Update untuk kode_98 instead of kode_12
  const mobileHiddenColumns = ['target', 'inkonsisten', 'kode_98', ...uniqueStatusNames.map(s => `status_nama_${s.replace(/\s+/g, '_')}`)];

  const allColumns = useMemo<ColumnDef<ProcessedKsaJagungNamaData, any>[]>(() => {
    const fixedStartCols: ColumnDef<ProcessedKsaJagungNamaData, any>[] = [
      { 
        accessorKey: 'nama', 
        header: () => <div className="text-left">Nama Petugas</div>, 
        cell: ({ row }) => <div className="truncate text-left font-medium" title={row.original.nama}>{row.original.nama}</div>, 
        footer: () => kabupatenName, 
        size: isMobile ? 140 : 200, 
        minSize: 140
      },
      { 
        accessorKey: 'target', 
        header: () => <div className="text-center">Target</div>, 
        cell: ({ row }) => <div className="text-center">{row.original.target.toLocaleString('id-ID')}</div>, 
        footer: () => totals?.target?.toLocaleString('id-ID') ?? '-', 
        size: 70, 
        minSize: 60
      },
      { 
        accessorKey: 'realisasi', 
        header: () => <div className="text-center">Realisasi</div>, 
        cell: ({ row }) => <div className="text-center">{row.original.realisasi.toLocaleString('id-ID')}</div>, 
        footer: () => totals?.realisasi?.toLocaleString('id-ID') ?? '-', 
        size: 70, 
        minSize: 60
      },
      { 
        accessorKey: 'persentase', 
        header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0"> {isMobile ? "(%)" : "Persentase (%)"} <ArrowUpDown className="ml-1 h-3 w-3" /> </Button>, 
        cell: ({ row }) => { 
          const value = row.original.persentase; 
          if (typeof value !== 'number' || isNaN(value)) return <div className="text-center">-</div>; 
          return ( 
            <div className="text-center"> 
              <Badge variant={getPercentageBadgeVariant(value)} className="text-xs px-1 py-0.5"> 
                {!isMobile && value >= 100 && <CheckCircle2 className="mr-0.5 h-3 w-3" />} 
                {value.toFixed(2)}% 
              </Badge> 
            </div> 
          ); 
        }, 
        footer: () => { 
          if (!totals?.persentase) return <>-</>; 
          const value = totals.persentase; 
          return ( 
            <Badge variant={getPercentageBadgeVariant(value)} className="text-xs px-1 py-0.5"> 
              {!isMobile && value >= 100 && <CheckCircle2 className="mr-0.5 h-3 w-3" />} 
              {value.toFixed(2)}% 
            </Badge> 
          ); 
        }, 
        size: isMobile ? 85 : 110, 
        minSize: 85
      },
    ];
    
    const dynamicStatusCols: ColumnDef<ProcessedKsaJagungNamaData, any>[] = (uniqueStatusNames || []).map(statusName => ({ 
      id: `status_nama_${statusName.replace(/\s+/g, '_')}`, 
      header: ({column}) => ( 
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0"> 
          {statusName} 
          <ArrowUpDown className="ml-1 h-3 w-3" /> 
        </Button> 
      ), 
      accessorFn: row => row.statuses?.[statusName]?.percentage ?? 0, 
      cell: ({ row }) => { 
        const statusData = row.original.statuses?.[statusName]; 
        if (!statusData || statusData.count === 0) return <div className="text-center text-xs">-</div>; 
        return ( 
          <div className="text-center text-xs tabular-nums"> 
            {statusData.count} ({statusData.percentage.toFixed(1)}%) 
          </div> 
        ); 
      }, 
      footer: () => { 
        const totalStatusData = totals?.statuses?.[statusName]; 
        if (!totalStatusData || totalStatusData.count === 0) return <div className="font-bold text-xs">-</div>; 
        return ( 
          <div className="font-bold text-xs tabular-nums"> 
            {totalStatusData.count} ({totalStatusData.percentage.toFixed(1)}%) 
          </div> 
        ); 
      }, 
      size: 120, 
      minSize: 100, 
      enableSorting: true, 
    }));
    
    const fixedEndCols: ColumnDef<ProcessedKsaJagungNamaData, any>[] = [ 
      { 
        accessorKey: 'inkonsisten', 
        header: ({ column }) => ( 
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > 
            Inkonsisten 
            <ArrowUpDown className="ml-1 h-3 w-3" /> 
          </Button> 
        ), 
        cell: ({ row }) => <div className="text-center">{row.original.inkonsisten.toLocaleString('id-ID')}</div>, 
        footer: () => totals?.inkonsisten?.toLocaleString('id-ID') ?? '-', 
        size: 90, 
        minSize: 80
      }, 
      // PERBEDAAN: Kolom kode_98 instead of kode_12
      { 
        accessorKey: 'kode_98', 
        header: ({ column }) => ( 
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > 
            Kode 98 
            <ArrowUpDown className="ml-1 h-3 w-3" /> 
          </Button> 
        ), 
        cell: ({ row }) => <div className="text-center">{row.original.kode_98.toLocaleString('id-ID')}</div>, 
        footer: () => totals?.kode_98?.toLocaleString('id-ID') ?? '-', 
        size: 80, 
        minSize: 70
      },
      { 
        id: 'generateBa', 
        header: () => <div className="text-center">Berita Acara</div>, 
        cell: ({ row }) => { 
          // PERBEDAAN: Check kode_98 instead of kode_12 untuk enable/disable tombol
          const hasKode98 = row.original.kode_98 > 0; 
          return ( 
            <div className="text-center"> 
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onGenerateBaClick(row.original); }} disabled={!hasKode98} className="text-xs px-2 py-1 h-7" title={hasKode98 ? "Generate Berita Acara untuk segmen dengan kode 98" : "Tidak ada segmen dengan kode 98"} > 
                <FileDown className="h-3 w-3 mr-1" /> BA 
              </Button> 
            </div> 
          ); 
        }, 
        footer: () => "", 
        size: 100, 
        minSize: 90, 
        enableSorting: false, 
      },
    ];
    
    return [...fixedStartCols, ...dynamicStatusCols, ...fixedEndCols];
  }, [totals, uniqueStatusNames, isMobile, kabupatenName, onGenerateBaClick]);

  const finalColumns = useMemo(() => {
    if (isMobile && !showAllColumns) {
      return allColumns.filter(col => {
        const columnId = 'accessorKey' in col ? col.accessorKey : col.id;
        return !mobileHiddenColumns.includes(columnId as string);
      });
    }
    return allColumns;
  }, [isMobile, showAllColumns, allColumns]);

  const table = useReactTable({
    data: data || [], columns: finalColumns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), columnResizeMode: 'onChange',
  });

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-3/4 mb-2" /> 
                <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
                <TableSkeleton columns={finalColumns} />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className='flex-grow'>
            <CardTitle>{title}</CardTitle>
          </div>
          {countdownStatus && !isLoading && (
            <div className={`flex items-center text-xs p-2 rounded-md border bg-gray-50 dark:bg-gray-800 w-full sm:w-auto`}>
                <Clock className={`h-4 w-4 mr-2 flex-shrink-0 ${countdownStatus.color}`} />
                <span className={`font-medium whitespace-nowrap ${countdownStatus.color}`}>{countdownStatus.text}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2 pt-2">
          <CardDescription className="text-sm text-gray-500">
            {isLoading ? ( <Skeleton className="h-4 w-48" /> ) : ( <span>{description}</span> )}
          </CardDescription>
          <div className='flex justify-end items-center gap-2 pt-2'>
            {isMobile && (
              <Button variant="outline" size="sm" onClick={() => setShowAllColumns(prev => !prev)}>
                {showAllColumns ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {showAllColumns ? "Ringkas" : "Lengkap"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto rounded-md border">
          <div
            className="inline-block align-middle"
            style={{
              minWidth: showAllColumns ? `${finalColumns.length * 120}px` : "100%",
            }}
          >
            <Table className="w-full table-fixed">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{
                          width: header.getSize(),
                          minWidth: header.column.columnDef.minSize
                            ? `${header.column.columnDef.minSize}px`
                            : undefined,
                        }}
                        className="p-2"
                      >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())
                      }
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.columnDef.minSize
                            ? `${cell.column.columnDef.minSize}px`
                            : undefined,
                        }}
                        className="p-2"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={finalColumns.length} className="h-24 text-center">
                    Tidak ada data untuk ditampilkan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {totals && data && data.length > 0 && (
              <tfoot className="bg-muted/50">
                {table.getFooterGroups().map((footerGroup) => (
                  <TableRow key={footerGroup.id}>
                    {footerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        className={`p-2 font-bold ${
                          header.column.id === "nama" ? "text-left" : "text-center"
                        }`}
                        style={{
                          width: header.column.getSize(),
                          minWidth: header.column.columnDef.minSize
                            ? `${header.column.columnDef.minSize}px`
                            : undefined,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.footer, header.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </tfoot>
            )}
          </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
