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
import { Download, ArrowUpDown, AlertTriangle, MapPin, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import * as XLSX from 'xlsx';

import { PhaseTimelineVisual } from "./PhaseTimelineVisual";

// Helper untuk memetakan kode anomali ke deskripsi singkat
const ANOMALY_TYPE_MAP: Record<string, string> = {
  'S-1': 'Stagnansi',
  'T-1': 'Lompatan Ekstrem',
  'T-2': 'Fase Mundur',
  'T-3': 'Illogical Harvest',
  'T-4': 'Alih Fungsi ke Non-Pertanian',
  'T-5': 'Alih Fungsi ke Pertanian',
};

// Nama bulan lengkap untuk filter
const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Removed the unused NoDataDisplay function to resolve the error.

const columns: ColumnDef<AnomalyData>[] = [
  { 
    accessorKey: "id_subsegmen", 
    header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs md:text-sm">ID Subsegmen<ArrowUpDown className="ml-2 h-3 w-3 md:h-4 md:w-4" /></Button>), 
    cell: ({ row }) => <div className="font-mono pl-2 md:pl-4 text-xs md:text-sm">{row.getValue("id_subsegmen")}</div>,
  },
  { 
    accessorKey: "kabupaten", 
    header: ({ column }) => (<div className="text-center w-full"><Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs md:text-sm">Kabupaten<ArrowUpDown className="ml-2 h-3 w-3 md:h-4 md:w-4" /></Button></div>),
    cell: ({ row }) => <div className="text-center text-xs md:text-sm">{row.getValue("kabupaten")}</div>, 
  },
  { 
    accessorKey: "bulan_anomali", 
    header: ({ column }) => (<div className="text-center w-full"><Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs md:text-sm">Bulan<ArrowUpDown className="ml-2 h-3 w-3 md:h-4 md:w-4" /></Button></div>),
    cell: ({ row }) => <div className="text-center text-xs md:text-sm">{NAMA_BULAN[(row.getValue("bulan_anomali") as number) - 1]}</div>,
  },
  { 
    accessorKey: "kode_anomali", 
    header: () => <div className="text-center text-xs md:text-sm">Kode</div>,
    cell: ({ row }) => (<div className="text-center"><TooltipProvider><Tooltip><TooltipTrigger><Badge variant="destructive" className="text-xs">{row.getValue("kode_anomali")}</Badge></TooltipTrigger><TooltipContent><p className="text-sm">{row.original.deskripsi}</p></TooltipContent></Tooltip></TooltipProvider></div>),
    enableSorting: false,
  },
  { 
    accessorKey: "urutan_fase", 
    header: () => <div className="text-center text-xs md:text-sm">Konteks Fase</div>,
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
    const defaultRegion = { name: '-', count: 0 };
    const defaultAnomaly = { type: '-', count: 0, topDistrict: '-' };

    if (!filteredAnomalies || filteredAnomalies.length === 0) {
      return { total: 0, topAnomaly: defaultAnomaly, topRegion: defaultRegion, bottomRegion: defaultRegion };
    }

    // 1. Cari Jenis Anomali Terbanyak secara Keseluruhan
    const anomalyTypeCounts = filteredAnomalies.reduce((acc, anomaly) => {
      acc[anomaly.kode_anomali] = (acc[anomaly.kode_anomali] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topAnomalyEntry = Object.entries(anomalyTypeCounts).sort(([, a], [, b]) => b - a)[0];
    const topAnomalyType = topAnomalyEntry ? topAnomalyEntry[0] : null;

    let topDistrictForTopAnomaly = '-';
    if (topAnomalyType) {
      // 2. Filter anomali hanya untuk jenis yang teratas
      const anomaliesOfTopType = filteredAnomalies.filter(a => a.kode_anomali === topAnomalyType);
      
      // 3. Cari kabupaten dengan anomali jenis itu yang terbanyak
      const districtCountsForTopAnomaly = anomaliesOfTopType.reduce((acc, anomaly) => {
        acc[anomaly.kabupaten] = (acc[anomaly.kabupaten] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topDistrictEntry = Object.entries(districtCountsForTopAnomaly).sort(([, a], [, b]) => b - a)[0];
      topDistrictForTopAnomaly = topDistrictEntry ? topDistrictEntry[0] : '-';
    }
    
    const regionCounts = filteredAnomalies.reduce((acc, anomaly) => { acc[anomaly.kabupaten] = (acc[anomaly.kabupaten] || 0) + 1; return acc; }, {} as Record<string, number>);
    const sortedRegions = Object.entries(regionCounts).sort(([, a], [, b]) => b - a);
    const topRegion = sortedRegions.length > 0 ? { name: sortedRegions[0][0], count: sortedRegions[0][1] } : defaultRegion;
    const bottomRegion = sortedRegions.length > 0 ? { name: sortedRegions[sortedRegions.length - 1][0], count: sortedRegions[sortedRegions.length - 1][1] } : defaultRegion;

    return {
      total: filteredAnomalies.length,
      topAnomaly: topAnomalyEntry ? { type: topAnomalyType, count: topAnomalyEntry[1], topDistrict: topDistrictForTopAnomaly } : defaultAnomaly,
      topRegion,
      bottomRegion,
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
              <CardTitle className="text-sm font-medium">Total Anomali</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                  <div className="text-2xl md:text-3xl font-bold">{kpiData.total}</div>
                  <p className="text-xs text-muted-foreground">kasus ditemukan sesuai filter</p>
              </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Jenis Anomali Terbanyak</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
                <div className="space-y-1">
                    <Badge variant="destructive" className="text-xs">{kpiData.topAnomaly.type}</Badge>
                    <div className="text-xl md:text-2xl font-bold">{kpiData.topAnomaly.count} kasus</div>
                </div>
                <div className="text-xs text-muted-foreground text-right space-y-1">
                    <p className="text-[10px] md:text-xs">{kpiData.topAnomaly.type ? ANOMALY_TYPE_MAP[kpiData.topAnomaly.type] || 'Tidak ada' : 'Tidak ada'}</p>
                    <p className="flex items-center justify-end gap-1 text-[10px] md:text-xs"><MapPin className="h-3 w-3" /> Terbanyak di {kpiData.topAnomaly.topDistrict}</p>
                </div>
            </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Sebaran Anomali Wilayah
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><ArrowUpCircle className="h-4 w-4 text-green-500"/> Terbanyak</p>
                    <p className="text-base md:text-lg font-bold truncate" title={kpiData.topRegion.name}>{kpiData.topRegion.name}</p>
                    <p className="text-xs font-semibold">{kpiData.topRegion.count} anomali</p>
                </div>
                <div className="border-l pl-4">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><ArrowDownCircle className="h-4 w-4 text-orange-500"/> Terendah</p>
                    <p className="text-base md:text-lg font-bold truncate" title={kpiData.bottomRegion.name}>{kpiData.bottomRegion.name}</p>
                    <p className="text-xs font-semibold">{kpiData.bottomRegion.count} anomali</p>
                </div>
            </CardContent>
        </Card>
      </div>
        
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 gap-4">
        <div className="flex items-center gap-2">
            <label htmlFor="month-filter" className="text-sm font-medium whitespace-nowrap">Filter Bulan:</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="month-filter" className="w-[160px] md:w-[180px]">
                    <SelectValue placeholder="Pilih bulan..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="semua">Semua Bulan</SelectItem>
                    {availableMonths.map(month => (
                        <SelectItem key={month} value={String(month)}>
                            {NAMA_BULAN[month - 1]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <Button onClick={handleExport} disabled={table.getRowModel().rows.length === 0} className="text-sm">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Ekspor ke Excel</span>
            <span className="sm:hidden">Ekspor</span>
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (<TableRow key={headerGroup.id}>{headerGroup.headers.map(header => (<TableHead key={header.id} className="whitespace-nowrap">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map(row => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                        {row.getVisibleCells().map(cell => (<TableCell key={cell.id} className="whitespace-nowrap">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}
                      </TableRow>
                  ))
              ) : (
                  <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center text-sm">
                          Tidak ada data anomali yang sesuai dengan filter.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {table.getPageCount() > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
            <div className="text-sm text-muted-foreground">Total {table.getFilteredRowModel().rows.length} baris anomali.</div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}</span>
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="text-xs">
                <span className="hidden sm:inline">Sebelumnya</span>
                <span className="sm:hidden">‹</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="text-xs">
                <span className="hidden sm:inline">Berikutnya</span>
                <span className="sm:hidden">›</span>
              </Button>
            </div>
        </div>
      )}
    </div>
  );
}