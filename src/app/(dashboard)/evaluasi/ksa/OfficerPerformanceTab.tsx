// Lokasi: src/app/(dashboard)/evaluasi/ksa/OfficerPerformanceTab.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useYear } from "@/context/YearContext";
import { useKsaEvaluasiFilter } from "@/context/KsaEvaluasiFilterContext";
import { useOfficerPerformanceData, OfficerPerformanceData } from "@/hooks/useOfficerPerformanceData";
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Clock, AlertCircle, ArrowUpDown } from "lucide-react";

const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function NoDataDisplay({ message }: { message: string }) {
    return (
        <TableRow>
            <TableCell colSpan={100} className="h-24 text-center">{message}</TableCell>
        </TableRow>
    );
}

const columns: ColumnDef<OfficerPerformanceData>[] = [
    { accessorKey: "nama_petugas", header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nama Petugas<ArrowUpDown className="ml-2 h-4 w-4" /></Button>), cell: ({ row }) => <div className="font-medium">{row.getValue("nama_petugas")}</div> },
    { accessorKey: "kabupaten", header: () => <div className="text-center">Kabupaten</div>, cell: ({ row }) => <div className="text-center">{row.getValue("kabupaten")}</div> },
    { accessorKey: "bulan", header: ({ column }) => (<div className="text-center w-full"><Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Bulan<ArrowUpDown className="ml-2 h-4 w-4" /></Button></div>), cell: ({ row }) => <div className="text-center font-mono">{NAMA_BULAN[row.getValue<number>("bulan") - 1]}</div> },
    { accessorKey: "total_entri", header: () => <div className="text-center">Total Subsegmen</div>, cell: ({ row }) => <div className="text-center font-mono">{row.getValue("total_entri")}</div> },
    { accessorKey: "tingkat_anomali", header: ({ column }) => (<div className="text-center w-full"><Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Tingkat Anomali (%)<ArrowUpDown className="ml-2 h-4 w-4" /></Button></div>), cell: ({ row }) => <div className="text-center font-semibold">{row.getValue("tingkat_anomali")}%</div> },
    { accessorKey: "durasi_hari", header: ({ column }) => (<div className="text-center w-full"><Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Durasi (hari)<ArrowUpDown className="ml-2 h-4 w-4" /></Button></div>), cell: ({ row }) => <div className="text-center">{row.getValue("durasi_hari")}</div> },
    { accessorKey: "rincian_anomali", header: () => <div className="text-center">Rincian Anomali</div>, cell: ({ row }) => ( <div className="text-xs text-center space-x-2">{Object.entries(row.getValue("rincian_anomali") as Record<string, number>).map(([key, value]) => (<span key={key}>{key}:<b>{value}</b></span>))}</div>), enableSorting: false },
];

export function OfficerPerformanceTab() {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const { selectedKabupaten } = useKsaEvaluasiFilter();
  
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('0'); 
  const [isMonthLoading, setIsMonthLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'nama_petugas', desc: false }, { id: 'bulan', desc: false }]);

  useEffect(() => {
    async function fetchAvailableMonths() {
      if (!selectedYear || !selectedKabupaten) return;
      setIsMonthLoading(true);
      
      const { data, error } = await supabase.rpc('get_available_ksa_months', {
        p_year: selectedYear,
        p_kabupaten: selectedKabupaten,
      });

      if (error) {
        console.error("Error fetching available months:", error);
        setAvailableMonths([]);
      } else {
        const months = data.map((item: { bulan: number }) => item.bulan);
        setAvailableMonths(months);
        if (months.length > 0) {
          const maxMonth = Math.max(...months);
          setSelectedMonth(String(maxMonth));
        } else {
          setSelectedMonth('0');
        }
      }
      setIsMonthLoading(false);
    }
    fetchAvailableMonths();
  }, [selectedYear, selectedKabupaten, supabase]);

  const { performanceData, isLoading: isPerformanceDataLoading, error } = useOfficerPerformanceData(selectedMonth);

  const kpiData = useMemo(() => {
    const data = performanceData; 
    if (!data || data.length === 0) {
      return { totalPetugas: 0, petugasTerlama: { name: '-', durasi: 0 }, petugasTeratas: { name: '-', tingkat: 0 } };
    }
    const totalPetugas = new Set(data.map(p => p.nama_petugas)).size;
    const petugasTerlama = [...data].sort((a, b) => (b.durasi_hari || 0) - (a.durasi_hari || 0))[0];
    const petugasTeratas = [...data].sort((a, b) => (b.tingkat_anomali || 0) - (a.tingkat_anomali || 0))[0];
    return {
      totalPetugas,
      petugasTerlama: { name: petugasTerlama.nama_petugas, durasi: petugasTerlama.durasi_hari || 0 },
      petugasTeratas: { name: petugasTeratas.nama_petugas, tingkat: petugasTeratas.tingkat_anomali || 0 },
    };
  }, [performanceData]);

  const table = useReactTable({
    data: performanceData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  if (isMonthLoading) return <Skeleton className="h-96 w-full mt-4" />;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="pt-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Petugas Aktif</CardTitle><User className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpiData.totalPetugas}</div><p className="text-xs text-muted-foreground">petugas pada periode ini</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pengerjaan Terlama</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpiData.petugasTerlama.durasi} hari</div><p className="text-xs text-muted-foreground">oleh {kpiData.petugasTerlama.name}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Tingkat Anomali Tertinggi</CardTitle><AlertCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpiData.petugasTeratas.tingkat}%</div><p className="text-xs text-muted-foreground">oleh {kpiData.petugasTeratas.name}</p></CardContent></Card>
      </div>
      
      <div className="flex justify-end items-center pt-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="month-filter-kinerja" className="text-sm">Filter Bulan:</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={availableMonths.length === 0}>
              <SelectTrigger id="month-filter-kinerja" className="w-[180px]">
                  <SelectValue placeholder="Pilih bulan..." />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="0">Semua Bulan</SelectItem>
                  {availableMonths.map(month => (
                      <SelectItem key={month} value={String(month)}>
                        {NAMA_BULAN[month - 1]}
                      </SelectItem>
                  ))}
              </SelectContent>
          </Select>
        </div>
      </div>

      {isPerformanceDataLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>{table.getHeaderGroups().map(headerGroup => (<TableRow key={headerGroup.id}>{headerGroup.headers.map(header => (<TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map(row => (<TableRow key={row.id}>{row.getVisibleCells().map(cell => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))
                ) : (
                  <NoDataDisplay message="Tidak ada data kinerja petugas untuk filter ini." />
                )}
              </TableBody>
            </Table>
          </div>
          
          {table.getPageCount() > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">Total {table.getFilteredRowModel().rows.length} baris data ditemukan.</div>
                <span className="text-sm">Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}</span>
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Berikutnya</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}