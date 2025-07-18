// Lokasi: src/app/(dashboard)/evaluasi/ksa/OfficerPerformanceTab.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useYear } from "@/context/YearContext";
import { useKsaEvaluasiFilter } from "@/context/KsaEvaluasiFilterContext";
import { useOfficerPerformanceData, OfficerPerformanceData } from "@/hooks/useOfficerPerformanceData";
import { useDailySubmissions } from "@/hooks/useDailySubmissions";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Clock, AlertCircle, ArrowUpDown, TrendingDown, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function toProperCase(str: string | null | undefined): string {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

function NoDataDisplay({ message }: { message: string }) {
    return (
        <TableRow>
            <TableCell colSpan={100} className="h-24 text-center">{message}</TableCell>
        </TableRow>
    );
}

const columns: ColumnDef<OfficerPerformanceData>[] = [
    { accessorKey: "nama_petugas", header: ({ column }) => (<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nama Petugas<ArrowUpDown className="ml-2 h-4 w-4" /></Button>), cell: ({ row }) => <div className="font-medium">{toProperCase(row.getValue("nama_petugas"))}</div> },
    { accessorKey: "kabupaten", header: () => <div className="text-center">Kabupaten</div>, cell: ({ row }) => <div className="text-center">{row.getValue("kabupaten")}</div> },
    { 
      accessorKey: "total_entri", 
      // --- PERUBAHAN DI SINI ---
      header: ({ column }) => (
        <div className="flex justify-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Subsegmen
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      ),
      // --- AKHIR PERUBAHAN ---
      cell: ({ row }) => <div className="text-center font-mono">{row.getValue("total_entri")}</div> 
    },
    { id: "rentang_kerja", header: () => <div className="text-center">Rentang Kerja</div>, cell: ({ row }) => {
        const tglMulai = new Date(row.original.tanggal_mulai);
        const tglSelesai = new Date(row.original.tanggal_selesai);
        const hariMulai = tglMulai.getDate();
        const hariSelesai = tglSelesai.getDate();
        const namaBulan = tglMulai.toLocaleDateString('id-ID', { month: 'short' });
        if (hariMulai === hariSelesai) {
          return <div className="text-center">{`${hariMulai} ${namaBulan}`}</div>;
        }
        return <div className="text-center">{`${hariMulai} - ${hariSelesai} ${namaBulan}`}</div>;
      },
    },
    { accessorKey: "durasi_hari", header: ({ column }) => (<div className="text-center w-full"><Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Durasi (hari)<ArrowUpDown className="ml-2 h-4 w-4" /></Button></div>), cell: ({ row }) => <div className="text-center">{row.getValue("durasi_hari")}</div> },
    { accessorKey: "tingkat_anomali", header: ({ column }) => (<div className="text-center w-full"><Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Tingkat Anomali (%)<ArrowUpDown className="ml-2 h-4 w-4" /></Button></div>), cell: ({ row }) => <div className="text-center font-semibold">{row.getValue("tingkat_anomali")}%</div> },
];

export function OfficerPerformanceTab() {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const { selectedKabupaten } = useKsaEvaluasiFilter();
  
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('0'); 
  const [isMonthLoading, setIsMonthLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'total_entri', desc: true }
]);

  useEffect(() => {
    async function fetchAvailableMonths() {
      if (!selectedYear || !selectedKabupaten) return;
      setIsMonthLoading(true);
      const { data, error } = await supabase.rpc('get_available_ksa_months', { p_year: selectedYear, p_kabupaten: selectedKabupaten });
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

  const { performanceData, error } = useOfficerPerformanceData(selectedMonth);
  const { dailyData, isLoading: isChartLoading, error: chartError } = useDailySubmissions(selectedMonth);

  // Filter data berdasarkan bulan yang dipilih untuk KPI dan tabel
  const filteredPerformanceData = useMemo(() => {
    if (selectedMonth === '0') return performanceData;
    return performanceData.filter(p => p.bulan === Number(selectedMonth));
  }, [performanceData, selectedMonth]);

  const kpiData = useMemo(() => {
    const dataForKpi = filteredPerformanceData;
    if (!dataForKpi || dataForKpi.length === 0) {
      return { totalPetugas: 0, petugasTerlama: { name: '-', durasi: 0 }, petugasTercepat: { name: '-' }, petugasTeratas: { name: '-', tingkat: 0 } };
    }
    const totalPetugas = new Set(dataForKpi.map(p => p.nama_petugas)).size;
    const petugasTerlama = [...dataForKpi].sort((a, b) => (b.durasi_hari || 0) - (a.durasi_hari || 0))[0];
    const petugasTercepat = [...dataForKpi].filter(p => p.tanggal_selesai).sort((a, b) => new Date(a.tanggal_selesai).getTime() - new Date(b.tanggal_selesai).getTime())[0];
    const petugasTeratas = [...dataForKpi].sort((a, b) => (b.tingkat_anomali || 0) - (a.tingkat_anomali || 0))[0];
    return {
      totalPetugas,
      petugasTerlama: { name: petugasTerlama.nama_petugas, durasi: petugasTerlama.durasi_hari || 0 },
      petugasTercepat: petugasTercepat ? { name: petugasTercepat.nama_petugas } : { name: '-' },
      petugasTeratas: { name: petugasTeratas.nama_petugas, tingkat: petugasTeratas.tingkat_anomali || 0 },
    };
  }, [filteredPerformanceData]);

  const table = useReactTable({
    data: filteredPerformanceData, // Gunakan data yang sudah difilter
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  if (isMonthLoading) return (
    <div className="pt-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-1 flex flex-col justify-between space-y-4">
          <Skeleton className="h-24"/>
          <Skeleton className="h-24"/>
          <Skeleton className="h-24"/>
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-[360px]"/>
        </div>
      </div>
      <Skeleton className="h-96 w-full"/>
    </div>
  );
  if (error) return <div className="text-red-500 dark:text-red-400 text-center py-8">{error}</div>;

  return (
    <div className="pt-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* --- GANTI BLOK KODE KPI ANDA DENGAN INI --- */}
        <div className="lg:col-span-1 flex flex-col justify-between space-y-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Petugas Aktif</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.totalPetugas}</div>
              <p className="text-xs text-muted-foreground">petugas pada periode ini</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Kinerja Waktu Pengerjaan
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <TrendingDown className="h-4 w-4 text-orange-500"/> Terlama
                    </p>
                    {/* --- PERUBAHAN DI SINI: Tooltip & Truncate --- */}
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <p className="text-sm md:text-lg font-bold truncate" title={toProperCase(kpiData.petugasTerlama.name)}>
                            {toProperCase(kpiData.petugasTerlama.name)}
                            </p>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{toProperCase(kpiData.petugasTerlama.name)}</p>
                        </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <p className="text-xs text-muted-foreground">{kpiData.petugasTerlama.durasi} hari</p>
                </div>
                <div className="border-l pl-4">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500"/> Tercepat
                    </p>
                    {/* --- PERUBAHAN DI SINI: Tooltip & Truncate --- */}
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <p className="text-sm md:text-lg font-bold truncate" title={toProperCase(kpiData.petugasTercepat.name)}>
                            {toProperCase(kpiData.petugasTercepat.name)}
                            </p>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{toProperCase(kpiData.petugasTercepat.name)}</p>
                        </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tingkat Anomali Tertinggi</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{kpiData.petugasTeratas.tingkat}%</div>
                {/* --- PERUBAHAN DI SINI: Tooltip & Truncate --- */}
                <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground truncate" title={`oleh ${toProperCase(kpiData.petugasTeratas.name)}`}>
                        oleh {toProperCase(kpiData.petugasTeratas.name)}
                    </p>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>oleh {toProperCase(kpiData.petugasTeratas.name)}</p>
                    </TooltipContent>
                </Tooltip>
                </TooltipProvider>
            </CardContent>
        </Card>
        </div>
        {/* --- AKHIR BLOK KODE --- */}

        <div className="lg:col-span-2">
          <Card className="h-full">
              <CardHeader className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-start md:space-y-0">
                  <div>
                    <CardTitle className="text-lg">Jumlah Submit Harian</CardTitle>
                    <CardDescription className="text-sm">Grafik jumlah amatan subsegmen yang dikirim per tanggal.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="month-filter-kinerja" className="text-sm flex-shrink-0">Bulan:</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={availableMonths.length === 0}>
                        <SelectTrigger id="month-filter-kinerja" className="w-[140px] md:w-[180px]">
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
              </CardHeader>
              <CardContent className="pl-2">
                  {isChartLoading ? (
                      <Skeleton className="h-[360px] w-full" />
                  ) : chartError ? (
                      <p className="text-red-500 text-center py-8">{chartError}</p>
                  ) : (
                      <ResponsiveContainer width="100%" height={360}>
                          <BarChart data={dailyData} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="tanggal_amatan" 
                                tickFormatter={(dateStr) => {
                                  const date = new Date(dateStr);
                                  return window.innerWidth < 768 
                                    ? date.getDate().toString() 
                                    : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                                }}
                                fontSize={11}
                                angle={-45}
                                textAnchor="end"
                                height={50}
                                interval={0}
                              />
                              <YAxis fontSize={11} width={35} />
                              <RechartsTooltip 
                                  labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} 
                                  formatter={(value) => [`${value} entri`, "Jumlah"]}
                              />
                              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '10px' }} />
                              <Bar dataKey="jumlah_entri" name="Jumlah Submit" fill="#8884d8" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  )}
              </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="rounded-md border mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="whitespace-nowrap text-xs md:text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <NoDataDisplay message="Tidak ada data kinerja petugas untuk filter ini." />
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {table.getPageCount() > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
            <div className="text-sm text-muted-foreground">Total {table.getFilteredRowModel().rows.length} baris data ditemukan.</div>
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