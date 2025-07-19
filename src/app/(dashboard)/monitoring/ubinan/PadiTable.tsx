"use client";

import * as React from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle2, Eye, EyeOff, Clock } from "lucide-react";
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
import { PadiDataRow, PadiTotals } from './types';
import { type Kegiatan } from '@/app/(dashboard)/jadwal/jadwal.config';

// Helper function untuk menghitung selisih hari
const getDiffInDays = (d1: Date, d2: Date): number => {
    const timeDiff = d2.getTime() - d1.getTime();
    return Math.round(timeDiff / (1000 * 60 * 60 * 24));
}

interface PadiTableProps {
  data: PadiDataRow[];
  totals: PadiTotals | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
  selectedYear: number;
  selectedSubround: string;
  jadwal?: Kegiatan;
}

const PadiTableSkeleton = ({ columns }: { columns: ColumnDef<PadiDataRow, unknown>[] }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index} style={{ width: column.size ? `${column.size}px` : 'auto' }} className="p-2">
              <Skeleton className="h-5 w-full" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column, cellIndex) => (
              <TableCell key={cellIndex} style={{ width: column.size ? `${column.size}px` : 'auto' }} className="p-2">
                <Skeleton className="h-5 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export function PadiMonitoringTable({ data, totals, isLoading, error, lastUpdate, jadwal }: PadiTableProps) {
  const isMobile = useIsMobile();
  const [showAllColumns, setShowAllColumns] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isGeneratifExpanded, setIsGeneratifExpanded] = React.useState(false);

  const mobileHiddenColumns = ['targetUtama', 'cadangan', 'lewatPanen', 'faseGeneratif', 'faseGeneratif_G1', 'faseGeneratif_G2', 'faseGeneratif_G3', 'anomali'];

  const lastMonthName = React.useMemo(() => 
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('id-ID', { month: 'long' })
  , []);
  
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
  
  const allColumns = React.useMemo<ColumnDef<PadiDataRow>[]>(() => {
    const persentaseColumn: ColumnDef<PadiDataRow> = {
      accessorKey: "persentase",
      header: () => <div className="text-center w-full">{isMobile ? "(%)" : "Persentase (%)"}</div>,
      cell: ({ row }) => {
        const value = parseFloat(String(row.original.persentase));
        if (isNaN(value)) return <div className="text-center">-</div>;
        const showCheckmark = value >= 100;
        return ( <div className="text-center w-full"><Badge variant={getPercentageBadgeVariant(value)}>{showCheckmark && !isMobile && <CheckCircle2 className="mr-1 h-3 w-3" />}{value.toFixed(2)}%</Badge></div>);
      },
      minSize: isMobile ? 65 : 90,
      size: isMobile ? 70 : 100,
    };
    const baseColumns: ColumnDef<PadiDataRow>[] = [
      { accessorKey: "nmkab", header: () => <div className="text-left w-full">Kabupaten/Kota</div>, cell: ({ row }) => (<div className="text-left truncate w-full" title={row.original.nmkab}>{row.original.nmkab}</div>), minSize: 100, size: 120 },
      { accessorKey: "targetUtama", header: () => <div className="text-center w-full">Target Utama</div>, cell: ({ row }) => <div className="text-center w-full">{row.original.targetUtama}</div>, minSize: 90, size: 100 },
      { accessorKey: "cadangan", header: () => <div className="text-center w-full">Cadangan</div>, cell: ({ row }) => <div className="text-center w-full">{row.original.cadangan}</div>, minSize: 90, size: 100 },
      { accessorKey: "realisasi", header: () => <div className="text-center w-full">Realisasi</div>, cell: ({ row }) => <div className="text-center w-full">{row.original.realisasi}</div>, minSize: 90, size: 100 },
      { accessorKey: "lewatPanen", header: () => <div className="text-center w-full">Lewat Panen</div>, cell: ({ row }) => <div className="text-center w-full">{row.original.lewatPanen}</div>, minSize: 90, size: 100 },
    ];
    const generatifDetailColumns: ColumnDef<PadiDataRow>[] = [
      { id: "faseGeneratif_G1", accessorKey: "faseGeneratif_G1", header: () => <div className="text-center w-full">G1</div>, cell: ({ row }) => <div className="text-center w-full">{row.original.faseGeneratif_G1 ?? '-'}</div>, minSize: 60, size: 60 },
      { id: "faseGeneratif_G2", accessorKey: "faseGeneratif_G2", header: () => <div className="text-center w-full">G2</div>, cell: ({ row }) => <div className="text-center w-full">{row.original.faseGeneratif_G2 ?? '-'}</div>, minSize: 60, size: 60 },
      { id: "faseGeneratif_G3", accessorKey: "faseGeneratif_G3", header: () => <div className="text-center w-full">G3</div>, cell: ({ row }) => <div className="text-center w-full">{row.original.faseGeneratif_G3 ?? '-'}</div>, minSize: 60, size: 60 },
    ];
    const generatifSummaryColumn: ColumnDef<PadiDataRow>[] = [
      { id: "faseGeneratif", accessorKey: "faseGeneratif", header: () => <div className="text-center w-full">Generatif ({lastMonthName})</div>, cell: ({ row }) => <div className="text-center w-full">{row.original.faseGeneratif ?? '-'}</div>, minSize: 130, size: 130 },
    ];
    const trailingColumns: ColumnDef<PadiDataRow>[] = [
      { accessorKey: "anomali", header: () => <div className="text-center w-full">Anomali</div>, cell: ({ row }) => <div className="text-center w-full">{row.original.anomali}</div>, minSize: 90, size: 100 },
    ];
    return [ ...baseColumns.slice(0, 4), persentaseColumn, baseColumns[4], ...(isGeneratifExpanded ? generatifDetailColumns : generatifSummaryColumn), ...trailingColumns ];
  }, [isMobile, lastMonthName, isGeneratifExpanded]);

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
      {/* ====================================================================== */}
      {/* ✅ PERUBAHAN TATA LETAK FINAL DI SINI                                   */}
      {/* ====================================================================== */}
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          {/* Bagian Judul dan Countdown */}
          <div className='flex-grow'>
            <CardTitle>Monitoring Ubinan Padi</CardTitle>
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
              <Button variant="outline" size="sm" onClick={() => setIsGeneratifExpanded(!isGeneratifExpanded)}>
                <ChevronRight className={`mr-2 h-4 w-4 transition-transform duration-200 ease-in-out ${isGeneratifExpanded ? 'rotate-90' : ''}`} />
                {isGeneratifExpanded ? "Ringkas Generatif" : "Detail Generatif"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading && <PadiTableSkeleton columns={skeletonColumns} />}
        {error && <p className="text-red-500 dark:text-red-400 text-center">Error: {error}</p>}
        {!isLoading && !error && (
          <div className="w-full overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (<TableHead key={header.id} style={{ width: header.getSize() }} className="p-2">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (<TableCell key={cell.id} style={{ width: cell.column.getSize() }} className="p-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}
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
                      } else if (totals[columnId as keyof PadiTotals] !== undefined && totals[columnId as keyof PadiTotals] !== null) {
                        displayValue = totals[columnId as keyof PadiTotals] as string | number;
                      } else { displayValue = '-'; }
                      return (
                        <TableCell key={header.id} style={{ width: header.getSize() }} className={`p-2 ${header.column.id === 'nmkab' ? 'text-left' : 'text-center'} font-bold`}>
                          {isPercentage ? (() => {
                            const numericValue = totals.persentase;
                            if (typeof numericValue !== 'number' || isNaN(numericValue)) { return <Badge variant="secondary">-</Badge>; }
                            const showCheckmark = numericValue >= 100;
                            return (<Badge variant={getPercentageBadgeVariant(numericValue)}>{showCheckmark && !isMobile && <CheckCircle2 className="mr-1 h-3 w-3" />}{numericValue.toFixed(2)}%</Badge>);
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