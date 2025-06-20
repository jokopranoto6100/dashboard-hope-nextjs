// src/app/(dashboard)/monitoring/ubinan/PadiTable.tsx
"use client";

import * as React from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
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

interface PadiTableProps {
  data: PadiDataRow[];
  totals: PadiTotals | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
  selectedYear: number;
  selectedSubround: string;
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

export function PadiMonitoringTable({ data, totals, isLoading, error, lastUpdate, selectedYear, selectedSubround }: PadiTableProps) {
  const isMobile = useIsMobile();
  const [showAllColumns, setShowAllColumns] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isGeneratifExpanded, setIsGeneratifExpanded] = React.useState(false);

  const mobileHiddenColumns = ['targetUtama', 'cadangan', 'lewatPanen', 'faseGeneratif', 'faseGeneratif_G1', 'faseGeneratif_G2', 'faseGeneratif_G3', 'anomali'];

  const lastMonthName = React.useMemo(() => 
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('id-ID', { month: 'long' })
  , []);
  
  const allColumns = React.useMemo<ColumnDef<PadiDataRow>[]>(() => {
    const persentaseColumn: ColumnDef<PadiDataRow> = { 
      accessorKey: "persentase", 
      // ✅ 1. Header kolom dibuat dinamis
      header: () => <div className="text-center">{isMobile ? "(%)" : "Persentase (%)"}</div>, 
      cell: ({ row }) => { 
        const rawValue = row.original.persentase; 
        const value = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue; 
        if (typeof value !== 'number' || isNaN(value)) return <div className="text-center">-</div>; 
        const showCheckmark = value >= 100; 
        return ( <div className="text-center"> <Badge variant={getPercentageBadgeVariant(value)}> {showCheckmark && !isMobile && <CheckCircle2 className="mr-1 h-3 w-3" />} {value.toFixed(2)}% </Badge> </div> ); 
      }, 
      // ✅ 2. Lebar kolom dibuat dinamis dan lebih ramping di mobile
      minSize: isMobile ? 55 : 80, 
      size: isMobile ? 60 : 85 
    };
    const baseColumns: ColumnDef<PadiDataRow>[] = [ { accessorKey: "nmkab", header: () => <div className="text-left">Kabupaten/Kota</div>, cell: ({ row }) => <div className="text-left truncate" title={row.original.nmkab}>{row.original.nmkab}</div>, minSize: 90, size: 100 }, { accessorKey: "targetUtama", header: () => <div className="text-center">Target Utama</div>, cell: ({ row }) => <div className="text-center">{row.original.targetUtama}</div>, minSize: 80, size: 110 }, { accessorKey: "cadangan", header: () => <div className="text-center">Cadangan</div>, cell: ({ row }) => <div className="text-center">{row.original.cadangan}</div>, minSize: 80, size: 110 }, { accessorKey: "realisasi", header: () => <div className="text-center">Realisasi</div>, cell: ({ row }) => <div className="text-center">{row.original.realisasi}</div>, minSize: 60, size: 70 }, { accessorKey: "lewatPanen", header: () => <div className="text-center">Lewat Panen</div>, cell: ({ row }) => <div className="text-center">{row.original.lewatPanen}</div>, minSize: 100, size: 100 }, ];
    const generatifDetailColumns: ColumnDef<PadiDataRow>[] = [ { id: "faseGeneratif_G1", accessorKey: "faseGeneratif_G1", header: () => <div className="text-center">G1</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif_G1 ?? '-'}</div>, minSize: 50, size: 50 }, { id: "faseGeneratif_G2", accessorKey: "faseGeneratif_G2", header: () => <div className="text-center">G2</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif_G2 ?? '-'}</div>, minSize: 50, size: 50 }, { id: "faseGeneratif_G3", accessorKey: "faseGeneratif_G3", header: () => <div className="text-center">G3</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif_G3 ?? '-'}</div>, minSize: 50, size: 50 }, ];
    const generatifSummaryColumn: ColumnDef<PadiDataRow>[] = [ { id: "faseGeneratif", accessorKey: "faseGeneratif", header: () => <div className="text-center">Generatif ({lastMonthName})</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif ?? '-'}</div>, minSize: 130, size: 100 }, ];
    const trailingColumns: ColumnDef<PadiDataRow>[] = [ { accessorKey: "anomali", header: () => <div className="text-center">Anomali</div>, cell: ({ row }) => <div className="text-center">{row.original.anomali}</div>, minSize: 80, size: 100 }, ];
    return [ ...baseColumns.slice(0, 4), persentaseColumn, baseColumns[4], ...(isGeneratifExpanded ? generatifDetailColumns : generatifSummaryColumn), ...trailingColumns ];
  }, [isMobile, lastMonthName, isGeneratifExpanded]);

  const finalColumns = React.useMemo(() => {
    if (isMobile && !showAllColumns) {
      return allColumns.filter(col => {
        const columnId = 'accessorKey' in col ? col.accessorKey : col.id;
        return !mobileHiddenColumns.includes(columnId as string);
      });
    }
    return allColumns;
  }, [isMobile, showAllColumns, allColumns]);
  
  const table = useReactTable({ 
    data: data || [], 
    columns: finalColumns, 
    getCoreRowModel: getCoreRowModel(), 
    getSortedRowModel: getSortedRowModel(), 
    getFilteredRowModel: getFilteredRowModel(), 
    state: { sorting, columnFilters }, 
    onSortingChange: setSorting, 
    onColumnFiltersChange: setColumnFilters, 
    columnResizeMode: 'onChange', 
  });

  const skeletonColumns = React.useMemo(() => {
    return finalColumns;
  }, [finalColumns]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Monitoring Ubinan Padi</CardTitle>
          <CardDescription className="mt-2 text-sm text-gray-500 h-5">
            {isLoading ? ( <Skeleton className="h-4 w-64" /> ) : ( <span>{lastUpdate ? `Terakhir diperbarui: ${lastUpdate}`: ''}</span> )}
          </CardDescription>
        </div>
        <div className='flex justify-end items-center gap-2 pt-2'>
          {isMobile && (
            <Button variant="outline" size="sm" onClick={() => setShowAllColumns(prev => !prev)}>
              {showAllColumns ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showAllColumns ? "Ringkas" : "Lengkap"}
            </Button>
          )}
          {(!isMobile || showAllColumns) && (
            <Button variant="outline" size="sm" onClick={() => setIsGeneratifExpanded(!isGeneratifExpanded)}>
              {isGeneratifExpanded ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
              {isGeneratifExpanded ? "Ringkas Generatif" : "Detail Generatif"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <PadiTableSkeleton columns={skeletonColumns} />}
        {error && <p className="text-red-500 text-center">Error: {error}</p>}
        {!isLoading && !error && (
          <ScrollArea className="w-full rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() }}
                        className="p-2"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
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
                      Tidak ada hasil.
                    </TableCell>
                  </TableRow>
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
                         <TableCell
                           key={header.id}
                           style={{ width: header.getSize() }}
                           className={`p-2 ${header.column.id === 'nmkab' ? 'text-left' : 'text-center'} font-bold`}
                         >
                            {isPercentage ? (() => {
                               const numericValue = totals.persentase;
                               if (typeof numericValue !== 'number' || isNaN(numericValue)) { return <Badge variant="secondary">-</Badge>; }
                               const showCheckmark = numericValue >= 100;
                               return ( <Badge variant={getPercentageBadgeVariant(numericValue)}> {showCheckmark && !isMobile && <CheckCircle2 className="mr-1 h-3 w-3" />} {numericValue.toFixed(2)}% </Badge> );
                             })() : (displayValue)}
                         </TableCell>
                       );
                     })}
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}