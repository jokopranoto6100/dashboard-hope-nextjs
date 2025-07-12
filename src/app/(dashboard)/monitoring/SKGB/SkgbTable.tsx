"use client";

import React, { useMemo, useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Eye, EyeOff } from "lucide-react";
import { getPercentageBadgeVariant } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

export interface SkgbDistrictData {
  kabupaten: string;
  kode_kab: string;
  target_utama: number;
  cadangan: number;
  realisasi: number;
  persentase: number;
  jumlah_petugas: number;
}

interface SkgbTableProps {
  title: string;
  description: string;
  data: SkgbDistrictData[];
  totals: {
    target_utama: number;
    cadangan: number;
    realisasi: number;
    persentase: number;
  } | null;
  onRowClick?: (districtData: SkgbDistrictData) => void;
  isLoading: boolean;
  lastUpdated?: string | null;
}

const TableSkeleton = ({ columns }: { columns: ColumnDef<SkgbDistrictData, unknown>[] }) => (
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
        {Array.from({ length: 10 }).map((_, rowIndex) => (
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

export function SkgbTable({ title, description, data, totals, onRowClick, isLoading, lastUpdated }: SkgbTableProps) {
  const isMobile = useIsMobile();
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const mobileHiddenColumns = ['cadangan', 'jumlah_petugas'];

  const columns: ColumnDef<SkgbDistrictData>[] = useMemo(() => [
    {
      accessorKey: 'kabupaten',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="h-8 p-1 font-semibold hover:bg-transparent">
          Kabupaten <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-left pl-2">
          {row.getValue('kabupaten')}
        </div>
      ),
      size: 200,
      enableSorting: true,
    },
    {
      accessorKey: 'target_utama',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="h-8 p-1 font-semibold hover:bg-transparent">
          Target Utama <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue('target_utama')?.toLocaleString() || 0}
        </div>
      ),
      size: 120,
      enableSorting: true,
    },
    {
      accessorKey: 'cadangan',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="h-8 p-1 font-semibold hover:bg-transparent">
          Cadangan <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue('cadangan')?.toLocaleString() || 0}
        </div>
      ),
      size: 100,
      enableSorting: true,
      meta: { className: isMobile && !showAllColumns ? 'hidden' : '' },
    },
    {
      accessorKey: 'realisasi',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="h-8 p-1 font-semibold hover:bg-transparent">
          Realisasi <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium text-green-600">
          {row.getValue('realisasi')?.toLocaleString() || 0}
        </div>
      ),
      size: 100,
      enableSorting: true,
    },
    {
      accessorKey: 'jumlah_petugas',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="h-8 p-1 font-semibold hover:bg-transparent">
          Jumlah Petugas <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium text-blue-600">
          {row.getValue('jumlah_petugas')?.toLocaleString() || 0}
        </div>
      ),
      size: 120,
      enableSorting: true,
      meta: { className: isMobile && !showAllColumns ? 'hidden' : '' },
    },
    {
      accessorKey: 'persentase',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="h-8 p-1 font-semibold hover:bg-transparent">
          Persentase <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const persentase = row.getValue('persentase') as number;
        return (
          <div className="text-center">
            <Badge variant={getPercentageBadgeVariant(persentase)}>
              {persentase?.toFixed(1)}%
            </Badge>
          </div>
        );
      },
      size: 100,
      enableSorting: true,
    },
  ], [isMobile, showAllColumns]);

  const visibleColumns = useMemo(() => {
    if (isMobile && !showAllColumns) {
      return columns.filter(col => {
        const key = 'accessorKey' in col ? col.accessorKey as string : '';
        return !mobileHiddenColumns.includes(key);
      });
    }
    return columns;
  }, [columns, isMobile, showAllColumns]);

  const table = useReactTable({
    data,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {title}
            <Skeleton className="h-4 w-16" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableSkeleton columns={visibleColumns} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {description}
              {lastUpdated && (
                <span className="block text-xs text-muted-foreground/70 mt-1">
                  Last updated: {lastUpdated}
                </span>
              )}
            </CardDescription>
          </div>
          
          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllColumns(!showAllColumns)}
              className="self-start sm:self-auto"
            >
              {showAllColumns ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showAllColumns ? 'Sembunyikan' : 'Tampilkan'} Kolom
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : 'auto' }}
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
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.columnDef.size ? `${cell.column.columnDef.size}px` : 'auto' }}
                        className="p-2"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              )}
              
              {/* Total Row */}
              {totals && (
                <TableRow className="bg-muted/50 font-semibold border-t-2">
                  <TableCell className="p-2 font-bold">TOTAL</TableCell>
                  <TableCell className="p-2 text-center">{totals.target_utama?.toLocaleString() || 0}</TableCell>
                  {(!isMobile || showAllColumns) && (
                    <TableCell className="p-2 text-center">{totals.cadangan?.toLocaleString() || 0}</TableCell>
                  )}
                  <TableCell className="p-2 text-center text-green-600">{totals.realisasi?.toLocaleString() || 0}</TableCell>
                  {(!isMobile || showAllColumns) && (
                    <TableCell className="p-2 text-center text-blue-600">
                      {data.reduce((sum, item) => sum + item.jumlah_petugas, 0).toLocaleString()}
                    </TableCell>
                  )}
                  <TableCell className="p-2 text-center">
                    <Badge variant={getPercentageBadgeVariant(totals.persentase)}>
                      {totals.persentase?.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
