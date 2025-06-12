// Lokasi: src/app/(dashboard)/evaluasi/ksa/AnomalyValidatorTab.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useKsaAnomalyData, AnomalyData } from "@/hooks/useKsaAnomalyData";
import { 
  ColumnDef, 
  flexRender, 
  getCoreRowModel, 
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable 
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Download, ArrowUpDown } from "lucide-react";
import * as XLSX from 'xlsx';

// Komponen untuk menampilkan pesan jika tidak ada data
function NoDataDisplay({ message }: { message: string }) {
    return (
        <div className="flex h-[200px] w-full items-center justify-center rounded-md border-2 border-dashed bg-muted/50 mt-4">
            <div className="text-center text-muted-foreground">
                <Info className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm font-medium">{message}</p>
            </div>
        </div>
    );
}

// Definisikan kolom tabel di luar komponen agar tidak dire-render terus-menerus
const columns: ColumnDef<AnomalyData>[] = [
  { 
    accessorKey: "id_subsegmen", 
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        ID Subsegmen
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-mono pl-4">{row.getValue("id_subsegmen")}</div>,
  },
  { 
    accessorKey: "kabupaten", 
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Kabupaten
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
  },
  { 
    accessorKey: "bulan_anomali", 
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Bulan
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("bulan_anomali")}</div> 
  },
  { 
    accessorKey: "kode_anomali", 
    header: "Kode",
    cell: ({ row }) => <div className="text-center"><Badge variant="destructive">{row.getValue("kode_anomali")}</Badge></div>,
    enableSorting: false,
  },
  { 
    accessorKey: "deskripsi", 
    header: "Deskripsi",
    enableSorting: false,
  },
  { 
    accessorKey: "urutan_fase", 
    header: "Konteks Fase",
    cell: ({ row }) => <div className="font-mono text-center">{row.getValue("urutan_fase")}</div>,
    enableSorting: false,
  },
];

export function AnomalyValidatorTab() {
  const { anomalies, isLoading, error } = useKsaAnomalyData();
  
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('semua');
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    if (anomalies.length > 0) {
      const uniqueMonths = [...new Set(anomalies.map(a => a.bulan_anomali))].sort((a, b) => a - b);
      setAvailableMonths(uniqueMonths);
      if (selectedMonth === 'semua' && uniqueMonths.length > 0) {
          const maxMonth = Math.max(...uniqueMonths);
          setSelectedMonth(String(maxMonth));
      }
    } else {
      setAvailableMonths([]);
      setSelectedMonth('semua');
    }
  }, [anomalies]);

  const filteredAnomalies = useMemo(() => {
    if (selectedMonth === 'semua') return anomalies;
    return anomalies.filter(a => a.bulan_anomali === Number(selectedMonth));
  }, [anomalies, selectedMonth]);

  const handleExport = () => {
    const dataToExport = table.getSortedRowModel().rows.map(row => row.original);
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Anomali");
    const year = new Date().getFullYear(); 
    const fileName = `Anomali KSA - Bulan ${selectedMonth === 'semua' ? 'Semua' : selectedMonth} - ${year}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  
  const table = useReactTable({
    data: filteredAnomalies,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full mt-4" />;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="pt-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <label htmlFor="month-filter" className="text-sm font-medium">Filter Bulan:</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="month-filter" className="w-[180px]"><SelectValue placeholder="Pilih bulan..." /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="semua">Semua Bulan</SelectItem>
                    {availableMonths.map(month => (<SelectItem key={month} value={String(month)}>{month}</SelectItem>))}
                </SelectContent>
            </Select>
        </div>
        <Button onClick={handleExport} disabled={table.getRowModel().rows.length === 0}><Download className="mr-2 h-4 w-4" />Ekspor ke Excel</Button>
      </div>

      {/* --- REVISI DI SINI --- */}
      {/* Tampilkan komponen NoDataDisplay jika tabel tidak memiliki baris data */}
      {table.getRowModel().rows.length === 0 ? (
        <NoDataDisplay message="Tidak ditemukan anomali untuk filter yang dipilih." />
      ) : (
        // Jika ada data, tampilkan tabel
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                    ))}
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Total {table.getFilteredRowModel().rows.length} baris anomali.
            </div>
            <span className="text-sm">Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}</span>
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Berikutnya</Button>
        </div>
      )}
    </div>
  );
}