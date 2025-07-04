// Lokasi: src/app/(dashboard)/evaluasi/ksa/evaluasi-ksa-client.tsx

"use client";

import React, { useMemo, useState } from 'react';
import { useKsaEvaluasiFilter } from "@/context/KsaEvaluasiFilterContext";
import { useYear } from "@/context/YearContext";
import { useKsaEvaluationData } from "@/hooks/useKsaEvaluationData";
import { useKsaCompletionData } from '@/hooks/useKsaCompletionData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Tractor, Scissors, Info, Table as TableIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { DetailKsaModal } from './DetailKsaModal';
import { OfficerPerformanceTab } from './OfficerPerformanceTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnomalyValidatorTab } from './AnomalyValidatorTab';

// Tipe data untuk tabel pivot
type PivotTableData = {
    kabupaten: string;
    [key: string]: string | number;
}

// Komponen untuk menampilkan pesan "Tidak Ada Data"
export function NoDataDisplay({ message = "Coba ubah filter tahun atau wilayah Anda." }: {message?: string}) {
    return (
        <div className="flex h-[300px] w-full items-center justify-center rounded-md border-2 border-dashed bg-muted/50">
            <div className="text-center text-muted-foreground">
                <Info className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm font-medium">Tidak Ada Data</p>
                <p className="mt-1 text-xs">{message}</p>
            </div>
        </div>
    );
}

// Helper untuk format angka dan nama bulan
const formatNumber = (num: number, decimals = 1) => (num === null || num === undefined) ? 'N/A' : new Intl.NumberFormat('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(num);
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function EvaluasiKsaClient() {
    const { selectedYear } = useYear();
    const {
        selectedKsaType, setSelectedKsaType,
        selectedKabupaten, setSelectedKabupaten,
        availableKabupaten,
        isLoadingFilters,
    } = useKsaEvaluasiFilter();

    const { isLoading, error, kpiData, areaChartData, lineChartData, tableData: pivotTableData, harvestColumns } = useKsaEvaluationData();
    const { data: completionData, availableMonths: completionMonths, isLoading: isCompletionLoading, error: completionError } = useKsaCompletionData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedKabForModal, setSelectedKabForModal] = useState<string | null>(null);

    const handleRowClick = (kabupaten: string) => {
        setSelectedKabForModal(kabupaten);
        setIsModalOpen(true);
    };

    // Definisi untuk Tabel 1: Distribusi Frekuensi Panen
    const tableColumns = useMemo<ColumnDef<PivotTableData>[]>(() => {
        if (harvestColumns.length === 0) return [];
        
        const dynamicColumns: ColumnDef<PivotTableData>[] = harvestColumns.map(col => ({
            accessorKey: `${col}x`,
            header: () => <div className="text-center">{col}x Panen</div>,
            cell: ({ row }) => <div className="text-center font-mono">{formatNumber(row.getValue(`${col}x`) as number ?? 0, 0)}</div>
        }));

        return [
            {
                accessorKey: 'kabupaten',
                header: 'Kabupaten/Kota',
                cell: ({ row }) => (
                    <div 
                        className="font-medium text-primary underline-offset-4 hover:underline cursor-pointer"
                        onClick={() => handleRowClick(row.getValue('kabupaten'))}
                    >
                        {row.getValue('kabupaten')}
                    </div>
                ),
            },
            ...dynamicColumns
        ];
    }, [harvestColumns]);

    const table = useReactTable({
        data: pivotTableData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    // --- PATCH DIMULAI DI SINI ---
    // Kalkulasi total untuk footer tabel Distribusi Frekuensi Panen
    const harvestTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        if (pivotTableData.length === 0 || harvestColumns.length === 0) {
            return totals;
        }

        // Inisialisasi objek total
        harvestColumns.forEach(col => {
            totals[`${col}x`] = 0;
        });

        // Jumlahkan nilai dari setiap baris
        pivotTableData.forEach(row => {
            harvestColumns.forEach(col => {
                const key = `${col}x`;
                totals[key] += Number(row[key] || 0);
            });
        });

        return totals;
    }, [pivotTableData, harvestColumns]);
    // --- PATCH SELESAI DI SINI ---


    // Definisi untuk Tabel 2: Kelengkapan Amatan (n=12)
    const completionTableData = useMemo(() => {
        if (!completionData) return [];
        // Flatten data untuk tanstack table: { kabupaten: 'A', monthly_counts: {1: 5} } -> { kabupaten: 'A', '1': 5 }
        return completionData.map(row => ({
            kabupaten: row.kabupaten,
            ...row.monthly_counts
        }));
    }, [completionData]);

    const completionTableColumns = useMemo<ColumnDef<any>[]>(() => {
        if (completionMonths.length === 0) return [];
        
        const dynamicColumns: ColumnDef<any>[] = completionMonths.map(month => ({
            accessorKey: String(month),
            header: () => <div className="text-center">{MONTH_NAMES[month - 1]}</div>,
            cell: ({ row }) => <div className="text-center font-mono">{row.getValue(String(month)) || 0}</div>
        }));
        
        return [
            { 
                accessorKey: 'kabupaten', 
                header: 'Kabupaten/Kota',
                cell: ({ row }) => <div className="font-medium">{row.getValue('kabupaten')}</div>
            }, 
            ...dynamicColumns
        ];
    }, [completionMonths]);
    
    const completionFooterTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        completionMonths.forEach(month => {
            totals[month] = completionData.reduce((sum, row) => sum + (row.monthly_counts[month] || 0), 0);
        });
        return totals;
    }, [completionData, completionMonths]);

    const completionTable = useReactTable({
        data: completionTableData,
        columns: completionTableColumns,
        getCoreRowModel: getCoreRowModel(),
    });
    
    const areaChartKeys = useMemo(() => {
        if (areaChartData.length === 0) return [];

        return Object.keys(areaChartData[0])
            .filter(k => k !== 'bulan')
            .sort((a, b) => {
                const numA = parseInt(a.replace('Fase ', ''), 10);
                const numB = parseInt(b.replace('Fase ', ''), 10);
                return numA - numB;
            });
    }, [areaChartData]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#dd4b39', '#4285F4', '#FBBC05'];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-4">
                <div>
                    <Label htmlFor="filter-ksa-type" className="text-xs font-medium">Jenis Survei</Label>
                    <Select value={selectedKsaType} onValueChange={(v) => setSelectedKsaType(v as 'Padi' | 'Jagung')}>
                        <SelectTrigger id="filter-ksa-type" className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Padi">KSA Padi</SelectItem>
                            <SelectItem value="Jagung" disabled>KSA Jagung (Segera)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="filter-kabupaten" className="text-xs font-medium">Wilayah</Label>
                    {isLoadingFilters ? <Skeleton className="h-10 w-48 mt-1" /> : (
                        <Select value={selectedKabupaten} onValueChange={setSelectedKabupaten} disabled={isLoadingFilters}>
                            <SelectTrigger id="filter-kabupaten" className="mt-1 min-w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua Kabupaten</SelectItem>
                                {availableKabupaten.map(kab => (
                                    <SelectItem key={kab.kode_kab} value={kab.kabupaten}>
                                        {kab.kabupaten}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            <Tabs defaultValue="visualisasi" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="visualisasi">Gambaran Umum</TabsTrigger>
                    <TabsTrigger value="validator">Anomali Amatan</TabsTrigger>
                    <TabsTrigger value="kinerja">Kinerja Petugas</TabsTrigger>
                </TabsList>

              <TabsContent value="visualisasi">
                {isLoading ? (
                    <div className="space-y-6 pt-4">
                        <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-24"/><Skeleton className="h-24"/><Skeleton className="h-24"/></div>
                        <Skeleton className="h-80"/>
                        <Skeleton className="h-80"/>
                    </div>
                 ) : error ? (
                    <p className="text-red-500 text-center py-8">{error}</p>
                 ) : (
                  <div className="space-y-6 pt-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Rata-Rata Frekuensi Panen Setahun</CardTitle><Scissors className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(kpiData?.avgHarvestFrequency ?? 0)} kali</div><p className="text-xs text-muted-foreground">rata-rata per subsegmen/tahun</p></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Puncak Tanam</CardTitle><Tractor className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpiData?.peakTanamMonth ?? '-'}</div><p className="text-xs text-muted-foreground">bulan aktivitas tanam terbanyak</p></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Puncak Panen</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpiData?.peakPanenMonth ?? '-'}</div><p className="text-xs text-muted-foreground">bulan aktivitas panen terbanyak</p></CardContent></Card>
                    </div>
                    <Card>
                        <CardHeader><CardTitle>Proporsi Fase Amatan per Bulan</CardTitle><CardDescription>Komposisi fase tanam padi (disederhanakan) sepanjang tahun {selectedYear}.</CardDescription></CardHeader>
                        <CardContent>{areaChartData.length === 0 ? <NoDataDisplay /> : (<ResponsiveContainer width="100%" height={300}><AreaChart data={areaChartData} stackOffset="expand"><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="bulan" tickFormatter={(tick) => MONTH_NAMES[tick-1]} fontSize={12} /><YAxis tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`} fontSize={12} /><Tooltip formatter={(value: number, name: string, props) => { const payload = props.payload || {}; const total = Object.keys(payload).filter(key => key !== 'bulan').reduce((sum, key) => sum + (payload[key] || 0), 0); const percentage = total > 0 ? (value / total) * 100 : 0; return [`${percentage.toFixed(2)}%`, name];}} /><Legend wrapperStyle={{fontSize: '12px'}}/>{areaChartKeys.map((key, index) => (<Area key={key} type="monotone" dataKey={key} name={key} stackId="1" stroke={COLORS[index % COLORS.length]} fill={COLORS[index % COLORS.length]} />))}</AreaChart></ResponsiveContainer>)}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Aktivitas Tanam vs. Panen</CardTitle><CardDescription>Perbandingan jumlah subsegmen yang tanam dan panen setiap bulan selama tahun {selectedYear}.</CardDescription></CardHeader>
                        <CardContent>{lineChartData.length === 0 ? <NoDataDisplay /> : (<ResponsiveContainer width="100%" height={300}><LineChart data={lineChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend wrapperStyle={{fontSize: '12px'}}/><Line type="monotone" name="Tanam" dataKey="Tanam" stroke="#3b82f6" strokeWidth={2} /><Line type="monotone" name="Panen" dataKey="Panen" stroke="#22c55e" strokeWidth={2} /></LineChart></ResponsiveContainer>)}</CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><TableIcon className="h-5 w-5"/> Distribusi Frekuensi Panen</CardTitle><CardDescription>Jumlah subsegmen berdasarkan berapa kali panen dalam setahun ({selectedYear}). Klik nama kabupaten untuk melihat rincian.</CardDescription></CardHeader>
                        <CardContent>{pivotTableData.length === 0 ? <NoDataDisplay message="Tidak ada data panen untuk filter ini." /> : (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        {table.getHeaderGroups().map(headerGroup => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map(header => (
                                                    <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows.map(row => (
                                            <TableRow key={row.id}>
                                                {row.getVisibleCells().map(cell => (
                                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    {/* --- PATCH DIMULAI DI SINI --- */}
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell className="font-bold">Kalimantan Barat</TableCell>
                                            {harvestColumns.map(col => (
                                                <TableCell key={`footer-${col}`} className="text-center font-bold font-mono">
                                                    {formatNumber(harvestTotals[`${col}x`] || 0, 0)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableFooter>
                                    {/* --- PATCH SELESAI DI SINI --- */}
                                </Table>
                            </div>
                        )}</CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TableIcon className="h-5 w-5"/> Tabulasi Subsegmen Tidak dapat Diamati (Kode 12)</CardTitle>
                        <CardDescription>Jumlah subsegmen yang tidak dapat diamati per kabupaten setiap bulannya di tahun {selectedYear}.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isCompletionLoading ? ( 
                            <Skeleton className="h-48 w-full" /> 
                        ) : completionError ? ( 
                            <p className="text-red-500 text-center py-8">{completionError}</p> 
                        ) : completionTable.getRowModel().rows.length === 0 ? ( 
                            <NoDataDisplay message="Tidak ada data kelengkapan amatan untuk filter ini."/> 
                        ) : (
                          <div className="rounded-md border overflow-x-auto">
                            <Table>
                              <TableHeader>
                                {completionTable.getHeaderGroups().map(headerGroup => (
                                  <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                      <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableHeader>
                              <TableBody>
                                {completionTable.getRowModel().rows.map(row => (
                                  <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                      <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableFooter>
                                <TableRow>
                                    <TableCell className="font-bold">Kalimantan Barat</TableCell>
                                    {completionMonths.map(month => (
                                        <TableCell key={`footer-${month}`} className="text-center font-bold font-mono">
                                            {completionFooterTotals[month]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                              </TableFooter>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="validator">
                <AnomalyValidatorTab />
              </TabsContent>

              <TabsContent value="kinerja">
                <OfficerPerformanceTab />
              </TabsContent>
            </Tabs>
            
            {isModalOpen && (
                <DetailKsaModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    kabupaten={selectedKabForModal}
                />
            )}
        </div>
    );
}