"use client";

import * as React from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, CheckCircle2, Eye, EyeOff, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPercentageBadgeVariant } from "@/lib/utils";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { PalawijaDataRow, PalawijaTotals } from './types';
import { type Kegiatan } from '@/app/(dashboard)/jadwal/jadwal.config';

// Helper function untuk menghitung selisih hari
const getDiffInDays = (d1: Date, d2: Date): number => {
    const timeDiff = d2.getTime() - d1.getTime();
    return Math.round(timeDiff / (1000 * 60 * 60 * 24));
}

interface PalawijaTableProps {
  data: PalawijaDataRow[];
  totals: PalawijaTotals | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
  selectedYear: number;
  selectedSubround: string;
  jadwal?: Kegiatan; // BARU
}

const PalawijaTableSkeleton = ({ columns }: { columns: ColumnDef<PalawijaDataRow, unknown>[] }) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => ( <TableHead key={index} style={{ width: column.size ? `${column.size}px` : 'auto' }} className="p-2"> <Skeleton className="h-5 w-full" /> </TableHead> ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}> 
              {columns.map((column, cellIndex) => ( <TableCell key={cellIndex} style={{ width: column.size ? `${column.size}px` : 'auto' }} className="p-2"> <Skeleton className="h-5 w-full" /> </TableCell> ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
);

export function PalawijaMonitoringTable({ data, totals, isLoading, error, lastUpdate, jadwal }: PalawijaTableProps) {
  const isMobile = useIsMobile();
  const [showAllColumns, setShowAllColumns] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isRealisasiExpanded, setIsRealisasiExpanded] = React.useState(false);

  const mobileHiddenColumns = ['target', 'clean', 'warning', 'error'];

  const countdownStatus = React.useMemo(() => {
    if (!jadwal) return null;
    const allJadwalItems = [...(jadwal.jadwal || []), ...(jadwal.subKegiatan?.flatMap(sub => sub.jadwal || []) || [])];
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
  }, [jadwal]);

  const allColumns = React.useMemo<ColumnDef<PalawijaDataRow>[]>(() => {
    const persentaseColumn: ColumnDef<PalawijaDataRow> = { 
      accessorKey: "persentase", 
      header: () => <div className="text-center">{isMobile ? "(%)" : "Persentase (%)"}</div>,
      cell: ({ row }) => { 
        const value = parseFloat(String(row.original.persentase)); 
        if (isNaN(value)) return <div className="text-center">-</div>;
        const showCheckmark = value >= 100;
        return ( <div className="text-center"> <Badge variant={getPercentageBadgeVariant(value)}> {showCheckmark && !isMobile && <CheckCircle2 className="mr-1 h-3 w-3"/>} {value.toFixed(2)}% </Badge> </div> ); 
      },
      minSize: isMobile ? 55 : 80,
      size: isMobile ? 60 : 85 
    };
    const baseColumns: ColumnDef<PalawijaDataRow>[] = [ { accessorKey: "nmkab", header: () => <div className="text-left">Kabupaten/Kota</div>, cell: ({ row }) => <div className="text-left truncate" title={row.original.nmkab}>{row.original.nmkab}</div>, minSize: 90, size: 100 }, { accessorKey: "target", header: () => <div className="text-center">Target</div>, cell: ({ row }) => <div className="text-center">{row.original.target}</div>, minSize: 80, size: 100 }, ];
    const realisasiDetailColumns: ColumnDef<PalawijaDataRow>[] = [ { accessorKey: "clean", header: () => <div className="text-center">Clean</div>, cell: ({ row }) => <div className="text-center">{row.original.clean}</div>, minSize: 70, size: 70 }, { accessorKey: "warning", header: () => <div className="text-center">Warning</div>, cell: ({ row }) => <div className="text-center">{row.original.warning}</div>, minSize: 70, size: 70 }, { accessorKey: "error", header: () => <div className="text-center">Error</div>, cell: ({ row }) => <div className="text-center">{row.original.error}</div>, minSize: 70, size: 70 }, ];
    const realisasiSummaryColumn: ColumnDef<PalawijaDataRow>[] = [ { accessorKey: "realisasi", header: () => <div className="text-center">Realisasi</div>, cell: ({ row }) => <div className="text-center">{row.original.realisasi}</div>, minSize: 60, size: 70 }, ];
    return [ ...baseColumns, ...(isRealisasiExpanded ? realisasiDetailColumns : realisasiSummaryColumn), persentaseColumn ];
  }, [isMobile, isRealisasiExpanded]);
  
  const finalColumns = React.useMemo(() => {
    if (isMobile && !showAllColumns) {
      return allColumns.filter(col => { const columnId = 'accessorKey' in col ? col.accessorKey : col.id; return !mobileHiddenColumns.includes(columnId as string); });
    }
    return allColumns;
  }, [isMobile, showAllColumns, allColumns]);

  const table = useReactTable({ 
    data: data || [], columns: finalColumns, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), 
    state: { sorting, columnFilters }, onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters, columnResizeMode: 'onChange', 
  });

  const skeletonColumns = React.useMemo(() => { return finalColumns; }, [finalColumns]);

  return (
    <Card>
      {/* ✅ TATA LETAK HEADER YANG SUDAH DIPERBAIKI */}
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            {/* Bagian Judul dan Countdown */}
            <div className='flex-grow'>
                <CardTitle>Monitoring Ubinan Palawija</CardTitle>
            </div>
            {countdownStatus && !isLoading && (
                <div className={`flex items-center text-xs p-2 rounded-md border bg-gray-50 dark:bg-gray-800 w-full sm:w-auto`}>
                    <Clock className={`h-4 w-4 mr-2 flex-shrink-0 ${countdownStatus.color}`} />
                    <span className={`font-medium whitespace-nowrap ${countdownStatus.color}`}>{countdownStatus.text}</span>
                </div>
            )}
        </div>
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2 pt-2">
            {/* Bagian Deskripsi dan Tombol */}
            <CardDescription className="text-sm text-gray-500">
              {isLoading ? ( <Skeleton className="h-4 w-48" /> ) : ( <span>{lastUpdate ? `Terakhir diperbarui: ${lastUpdate}`: ''}</span> )}
            </CardDescription>

            <div className='flex items-center justify-start md:justify-end gap-2 flex-wrap'>
              {isMobile && (
                <Button variant="outline" size="sm" onClick={() => setShowAllColumns(prev => !prev)}>
                  {showAllColumns ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {showAllColumns ? "Ringkas" : "Lengkap"}
                </Button>
              )}
              
              {(!isMobile || showAllColumns) && (
                <Button variant="outline" size="sm" onClick={() => setIsRealisasiExpanded(!isRealisasiExpanded)}>
                  {isRealisasiExpanded ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4" />}
                  {isRealisasiExpanded ? "Ringkas Realisasi" : "Detail Realisasi"}
                </Button>
              )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <PalawijaTableSkeleton columns={skeletonColumns} />}
        {error && <p className="text-red-500 text-center">Error: {error}</p>}
        {!isLoading && !error && (
          <div className="w-full overflow-x-auto rounded-md border">
            <Table className="w-full table-fixed">
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => ( <TableHead key={header.id} style={{ width: header.getSize() }} className="p-2"> {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())} </TableHead> ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => ( <TableCell key={cell.id} style={{ width: cell.column.getSize() }} className="p-2"> {flexRender(cell.column.columnDef.cell, cell.getContext())} </TableCell> ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={finalColumns.length} className="h-24 text-center">Tidak ada hasil.</TableCell></TableRow>
                )}
              </TableBody>
              {totals && (
                <TableFooter>
                  <TableRow>
                    {table.getFooterGroups()[0].headers.map(header => {
                      const columnId = header.column.id;
                      let displayValue: string | number | undefined;
                      let isPercentage = false;
                      if (columnId === 'nmkab') { displayValue = 'Kalimantan Barat'; } 
                      else if (columnId === 'persentase') {
                        const numericValue = totals.persentase;
                        if (typeof numericValue === 'number' && !isNaN(numericValue)) { displayValue = numericValue.toFixed(2); isPercentage = true; } 
                        else { displayValue = '-'; }
                      } else if (totals[columnId as keyof typeof totals] !== undefined && totals[columnId as keyof typeof totals] !== null) {
                        displayValue = totals[columnId as keyof typeof totals] as string | number;
                      } else { displayValue = '-'; }
                      return (
                        <TableCell key={header.id} style={{ width: header.getSize() }} className={`p-2 ${header.column.id === 'nmkab' ? 'text-left' : 'text-center'} font-bold`}>
                          {isPercentage ? (() => {
                            const numericValue = totals.persentase;
                            if (typeof numericValue !== 'number' || isNaN(numericValue)) { return <Badge variant="secondary">-</Badge>; }
                            const showCheckmark = numericValue >= 100;
                            return (<Badge variant={getPercentageBadgeVariant(numericValue)}> {showCheckmark && !isMobile && <CheckCircle2 className="mr-1 h-3 w-3" />} {numericValue.toFixed(2)}% </Badge>);
                          })() : (displayValue)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}