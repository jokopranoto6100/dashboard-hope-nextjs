// Lokasi: src/app/(dashboard)/evaluasi/ksa/AnomalyValidatorTab.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Download, ArrowUpDown, AlertTriangle, Tags, MapPin, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import * as XLSX from 'xlsx';

import { PhaseTimelineVisual } from "./PhaseTimelineVisual";

// Helper untuk memetakan kode anomali ke deskripsi singkat
const ANOMALY_TYPE_MAP: Record<string, string> = {
  'S-1': 'Stagnansi',
  'T-1': 'Lompatan Ekstrem',
  'T-2': 'Fase Mundur',
  'T-3': 'Panen Tdk Logis',
  'T-4': 'Alih Fungsi',
  'T-5': 'Re-aktivasi',
};

function NoDataDisplay({ message }: { message: string }) {
    return (
        <div className="flex h-[200px] w-full items-center justify-center rounded-md border-2 border-dashed bg-muted/50 mt-4">
            <div className="text-center text-muted-foreground"><Info className="mx-auto h-8 w-8" /><p className="mt-2 text-sm font-medium">{message}</p></div>
        </div>
    );
}

const columns: ColumnDef<AnomalyData>[] = [
  { 
    accessorKey: "id_subsegmen", 
    header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>ID Subsegmen<ArrowUpDown className="ml-2 h-4 w-4" /></Button>), 
    cell: ({ row }) => <div className="font-mono pl-4">{row.getValue("id_subsegmen")}</div>,
  },
  { 
    accessorKey: "kabupaten", 
    header: ({ column }) => (<div className="text-center w-full"><Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Kabupaten<ArrowUpDown className="ml-2 h-4 w-4" /></Button></div>),
    cell: ({ row }) => <div className="text-center">{row.getValue("kabupaten")}</div>, 
  },
  { 
    accessorKey: "bulan_anomali", 
    header: ({ column }) => (<div className="text-center w-full"><Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Bulan<ArrowUpDown className="ml-2 h-4 w-4" /></Button></div>),
    cell: ({ row }) => <div className="text-center">{row.getValue("bulan_anomali")}</div>,
  },
  { 
    accessorKey: "kode_anomali", 
    header: () => <div className="text-center">Kode</div>,
    cell: ({ row }) => (<div className="text-center"><TooltipProvider><Tooltip><TooltipTrigger><Badge variant="destructive">{row.getValue("kode_anomali")}</Badge></TooltipTrigger><TooltipContent><p>{row.original.deskripsi}</p></TooltipContent></Tooltip></TooltipProvider></div>),
    enableSorting: false,
  },
  { 
    accessorKey: "urutan_fase", 
    header: () => <div className="text-center">Konteks Fase</div>,
    cell: ({ row }) => <PhaseTimelineVisual urutan_fase={row.getValue("urutan_fase")} />,
    enableSorting: false,
  },
];

export function AnomalyValidatorTab() {
  const { anomalies, isLoading, error } = useKsaAnomalyData();
  
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('semua');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'id_subsegmen', desc: false }]);
  
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

  const kpiData = useMemo(() => {
    if (!filteredAnomalies || filteredAnomalies.length === 0) {
      return { total: 0, anomalyCounts: [], topRegion: { name: '-', count: 0 } };
    }

    const anomalyTypeCounts = filteredAnomalies.reduce((acc, anomaly) => {
      acc[anomaly.kode_anomali] = (acc[anomaly.kode_anomali] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sortedAnomalyCounts = Object.entries(anomalyTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // --- PERUBAHAN UTAMA DI SINI ---
    const regionCounts = filteredAnomalies.reduce((acc, anomaly) => {
      acc[anomaly.kabupaten] = (acc[anomaly.kabupaten] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedRegions = Object.entries(regionCounts).sort(([, a], [, b]) => b - a);

    const topRegion = sortedRegions.length > 0 ? { name: sortedRegions[0][0], count: sortedRegions[0][1] } : defaultRegion;
    const bottomRegion = sortedRegions.length > 0 ? { name: sortedRegions[sortedRegions.length - 1][0], count: sortedRegions[sortedRegions.length - 1][1] } : defaultRegion;
    // --- AKHIR PERUBAHAN ---
    
    return {
      total: filteredAnomalies.length,
      anomalyCounts: sortedAnomalyCounts,
      topRegion: topRegion,
      bottomRegion: bottomRegion,
    };
  }, [filteredAnomalies]);

  const handleExport = () => {
    const dataToExport = table.getSortedRowModel().rows.map(row => {
        const { id_subsegmen, kabupaten, bulan_anomali, kode_anomali, deskripsi, urutan_fase } = row.original;
        return { ID_Subsegmen: id_subsegmen, Kabupaten: kabupaten, Bulan_Anomali: bulan_anomali, Kode_Anomali: kode_anomali, Deskripsi: deskripsi, Konteks_Fase: urutan_fase };
    });
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
    state: { sorting },
  });

  if (isLoading) return <Skeleton className="h-96 w-full mt-4" />;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="pt-4 space-y-4">
      {/* --- GANTI BLOK KODE INI --- */}
      <div className="grid gap-4 md:grid-cols-3">

        {/* Card 1: Total Anomali - Desain Ikon Besar */}
        <Card>
          <CardHeader>
              <CardTitle className="text-sm font-medium">Total Anomali</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                  <div className="text-3xl font-bold">{kpiData.total}</div>
                  <p className="text-xs text-muted-foreground">kasus ditemukan sesuai filter</p>
              </div>
          </CardContent>
        </Card>

        {/* Card 2: Ringkasan Jenis Anomali - Desain Daftar Detail */}
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Tags className="h-4 w-4 text-muted-foreground" />
                    Ringkasan Jenis Anomali
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {kpiData.anomalyCounts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {kpiData.anomalyCounts.map(item => {
                    // Logika untuk menentukan warna badge berdasarkan jenis anomali
                    let variant: "destructive" | "secondary" | "default" = "default";
                    if (['T-2', 'T-3'].includes(item.type)) {
                      variant = "secondary"; // Merah untuk error kritis
                    } else if (['S-1', 'T-1'].includes(item.type)) {
                      variant = "secondary"; // Abu-abu untuk peringatan
                    }
                    // Biru (default) untuk anomali informasional

                    return (
                      <Badge key={item.type} variant={variant} className="text-base py-1">
                        {item.type}: <span className="font-bold ml-1.5">{item.count}</span>
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <p className="pt-4 text-sm text-muted-foreground text-center">Tidak ada data.</p>
              )}
            </CardContent>
        </Card>

        {/* Card 3: Sebaran Wilayah - Desain Terbanyak vs Terendah */}
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Sebaran Anomali Wilayah
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><ArrowUpCircle className="h-4 w-4 text-green-500"/> Terbanyak</p>
                    <p className="text-lg font-bold">{kpiData.topRegion.name}</p>
                    <p className="text-xs font-semibold">{kpiData.topRegion.count} anomali</p>
                </div>
                <div className="border-l pl-4">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><ArrowDownCircle className="h-4 w-4 text-orange-500"/> Terendah</p>
                    <p className="text-lg font-bold">{kpiData.bottomRegion.name}</p>
                    <p className="text-xs font-semibold">{kpiData.bottomRegion.count} anomali</p>
                </div>
            </CardContent>
        </Card>

      </div>
      {/* --- AKHIR BLOK KODE --- */}
        
      <div className="flex justify-between items-center pt-4">
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (<TableRow key={headerGroup.id}>{headerGroup.headers.map(header => (<TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map(cell => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                        Tidak ada data anomali yang sesuai dengan filter.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">Total {table.getFilteredRowModel().rows.length} baris anomali.</div>
            <span className="text-sm">Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}</span>
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Berikutnya</Button>
        </div>
      )}
    </div>
  );
}