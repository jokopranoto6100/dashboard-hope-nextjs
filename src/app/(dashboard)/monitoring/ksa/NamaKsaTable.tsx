/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/monitoring/ksa/NamaKsaTable.tsx
"use client";

import React, { useMemo, useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { getPercentageBadgeVariant } from "@/lib/utils";
import { ProcessedKsaNamaData } from '@/hooks/useKsaMonitoringData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

interface NamaKsaTableProps {
  title: string;
  description: string;
  data: ProcessedKsaNamaData[];
  totals: any;
  uniqueStatusNames: string[];
  kabupatenName: string;
  isLoading: boolean;
}

const TableSkeleton = ({ columns }: { columns: ColumnDef<ProcessedKsaNamaData, unknown>[] }) => (
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

export function NamaKsaTable({ title, description, data, totals, uniqueStatusNames, kabupatenName, isLoading }: NamaKsaTableProps) {
  const isMobile = useIsMobile();
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const mobileHiddenColumns = ['target', 'inkonsisten', 'kode_12', ...uniqueStatusNames.map(s => `status_nama_${s.replace(/\s+/g, '_')}`)];

  const allColumns = useMemo<ColumnDef<ProcessedKsaNamaData, any>[]>(() => {
    const fixedStartCols: ColumnDef<ProcessedKsaNamaData, any>[] = [ { accessorKey: 'nama', header: () => <div className="text-left">Nama Petugas</div>, cell: ({ row }) => <div className="truncate text-left font-medium" title={row.original.nama}>{row.original.nama}</div>, footer: () => `Total ${kabupatenName}`, size: isMobile ? 90 : 200, minSize: 90, }, { accessorKey: 'target', header: () => <div className="text-center">Target</div>, cell: ({ row }) => <div className="text-center">{row.original.target.toLocaleString('id-ID')}</div>, footer: () => totals?.target?.toLocaleString('id-ID') ?? '-', size: 70, minSize: 60, }, { accessorKey: 'realisasi', header: () => <div className="text-center">Realisasi</div>, cell: ({ row }) => <div className="text-center">{row.original.realisasi.toLocaleString('id-ID')}</div>, footer: () => totals?.realisasi?.toLocaleString('id-ID') ?? '-', size: 70, minSize: 60, }, { accessorKey: 'persentase', header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > {isMobile ? "(%)" : "Persentase (%)"} <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ), cell: ({ row }) => { const value = row.original.persentase; if (typeof value !== 'number' || isNaN(value)) return <div className="text-center">-</div>; return ( <div className="text-center"> <Badge variant={getPercentageBadgeVariant(value)} className="text-xs px-1 py-0.5"> {!isMobile && value >= 100 && <CheckCircle2 className="mr-0.5 h-3 w-3" />} {value.toFixed(2)}% </Badge> </div> ); }, footer: () => { if (!totals?.persentase) return <>-</>; const value = totals.persentase; return ( <Badge variant={getPercentageBadgeVariant(value)} className="text-xs px-1 py-0.5"> {!isMobile && value >= 100 && <CheckCircle2 className="mr-0.5 h-3 w-3" />} {value.toFixed(2)}% </Badge> ); }, size: isMobile ? 85 : 110, minSize: 85, }, ];
    const dynamicStatusCols: ColumnDef<ProcessedKsaNamaData, any>[] = (uniqueStatusNames || []).map(statusName => ({ id: `status_nama_${statusName.replace(/\s+/g, '_')}`, header: ({column}) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0"> {statusName} <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ), accessorFn: row => row.statuses?.[statusName]?.percentage ?? 0, cell: ({ row }) => { const statusData = row.original.statuses?.[statusName]; if (!statusData || statusData.count === 0) return <div className="text-center text-xs">-</div>; return ( <div className="text-center text-xs tabular-nums"> {statusData.count} ({statusData.percentage.toFixed(1)}%) </div> ); }, footer: () => { const totalStatusData = totals?.statuses?.[statusName]; if (!totalStatusData || totalStatusData.count === 0) return <div className="font-bold text-xs">-</div>; return ( <div className="font-bold text-xs tabular-nums"> {totalStatusData.count} ({totalStatusData.percentage.toFixed(1)}%) </div> ); }, size: 120, minSize: 100, enableSorting: true, }));
    const fixedEndCols: ColumnDef<ProcessedKsaNamaData, any>[] = [ { accessorKey: 'inkonsisten', header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > Inkonsisten <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ), cell: ({ row }) => <div className="text-center">{row.original.inkonsisten.toLocaleString('id-ID')}</div>, footer: () => totals?.inkonsisten?.toLocaleString('id-ID') ?? '-', size: 90, minSize: 80, }, { accessorKey: 'kode_12', header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > Kode 12 <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ), cell: ({ row }) => <div className="text-center">{row.original.kode_12.toLocaleString('id-ID')}</div>, footer: () => totals?.kode_12?.toLocaleString('id-ID') ?? '-', size: 80, minSize: 70, }, ];
    return [...fixedStartCols, ...dynamicStatusCols, ...fixedEndCols];
  }, [totals, uniqueStatusNames, kabupatenName, isMobile]);
  
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
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-2 text-sm text-gray-500 h-5">
            <span>{description}</span>
          </CardDescription>
        </div>
        <div className='flex justify-end items-center gap-2 pt-2'>
          {isMobile && (
            <Button variant="outline" size="sm" onClick={() => setShowAllColumns(prev => !prev)}>
              {showAllColumns ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showAllColumns ? "Ringkas" : "Lengkap"}
            </Button>
          )}
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
                          : flexRender(header.column.columnDef.header, header.getContext())}
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
                            header.column.id === 'nama' ? 'text-left' : 'text-center'
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