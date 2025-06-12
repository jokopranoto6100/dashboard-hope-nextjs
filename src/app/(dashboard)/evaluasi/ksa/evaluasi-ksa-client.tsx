// Lokasi: src/app/(dashboard)/evaluasi/ksa/evaluasi-ksa-client.tsx
"use client";

import React, { useMemo, useState } from 'react';
import { useKsaEvaluasiFilter } from "@/context/KsaEvaluasiFilterContext";
import { useYear } from "@/context/YearContext";
import { useKsaEvaluationData } from "@/hooks/useKsaEvaluationData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Tractor, Scissors, Info, Table as TableIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DetailKsaModal } from './DetailKsaModal'; // <-- 1. IMPOR MODAL

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

// Helper untuk format angka
const formatNumber = (num: number, decimals = 1) => (num === null || num === undefined) ? 'N/A' : new Intl.NumberFormat('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(num);

export function EvaluasiKsaClient() {
    const { selectedYear } = useYear();
    const {
        selectedKsaType, setSelectedKsaType,
        selectedKabupaten, setSelectedKabupaten,
        availableKabupaten,
        isLoadingFilters,
    } = useKsaEvaluasiFilter();

    const { isLoading, error, kpiData, areaChartData, lineChartData, tableData: pivotTableData, harvestColumns } = useKsaEvaluationData();

    // 2. TAMBAHKAN STATE UNTUK MODAL
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedKabForModal, setSelectedKabForModal] = useState<string | null>(null);

    // 3. UPDATE HANDLER UNTUK MEMBUKA MODAL
    const handleRowClick = (kabupaten: string) => {
        setSelectedKabForModal(kabupaten);
        setIsModalOpen(true);
    };

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

    const areaChartKeys = areaChartData.length > 0 ? Object.keys(areaChartData[0]).filter(k => k !== 'bulan') : [];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#dd4b39', '#4285F4', '#FBBC05'];
    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    return (
        <div className="space-y-6">
            {/* Filter Bar Tetap Sama */}
            <div className="flex flex-wrap items-end gap-4">
                <div><Label htmlFor="filter-ksa-type" className="text-xs font-medium">Jenis Survei</Label><Select value={selectedKsaType} onValueChange={(v) => setSelectedKsaType(v as 'Padi' | 'Jagung')}><SelectTrigger id="filter-ksa-type" className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Padi">KSA Padi</SelectItem><SelectItem value="Jagung" disabled>KSA Jagung (Segera)</SelectItem></SelectContent></Select></div>
                <div>
                    <Label htmlFor="filter-kabupaten" className="text-xs font-medium">Wilayah</Label>
                    {isLoadingFilters ? <Skeleton className="h-10 w-48 mt-1" /> : (
                        <Select value={selectedKabupaten} onValueChange={setSelectedKabupaten} disabled={isLoadingFilters}>
                            <SelectTrigger id="filter-kabupaten" className="mt-1 min-w-[180px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua Kabupaten</SelectItem>
                                {/* --- PERUBAHAN: Gunakan struktur data baru --- */}
                                {availableKabupaten.map(kab => (
                                    <SelectItem key={kab.kode_kab} value={kab.kabupaten}>
                                        {kab.kabupaten}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>            </div>

            {isLoading ? <Skeleton className="h-96 w-full" /> : error ? <p className="text-red-500 text-center py-8">{error}</p> : (
                <div className="space-y-6 pt-4">
                    {/* KPI, Grafik Area, Grafik Garis Tetap Sama */}
                    <div className="grid gap-4 md:grid-cols-3"><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Frekuensi Panen</CardTitle><Scissors className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(kpiData?.avgHarvestFrequency ?? 0)} kali</div><p className="text-xs text-muted-foreground">rata-rata per subsegmen/tahun</p></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Puncak Tanam</CardTitle><Tractor className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpiData?.peakTanamMonth ?? '-'}</div><p className="text-xs text-muted-foreground">bulan aktivitas tanam terbanyak</p></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Puncak Panen</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{kpiData?.peakPanenMonth ?? '-'}</div><p className="text-xs text-muted-foreground">bulan aktivitas panen terbanyak</p></CardContent></Card></div>
                    <Card><CardHeader><CardTitle>Proporsi Fase Amatan per Bulan</CardTitle><CardDescription>Komposisi fase tanam padi (disederhanakan) sepanjang tahun {selectedYear}.</CardDescription></CardHeader><CardContent>{areaChartData.length === 0 ? <NoDataDisplay /> : (<ResponsiveContainer width="100%" height={300}><AreaChart data={areaChartData} stackOffset="expand"><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="bulan" tickFormatter={(tick) => MONTH_NAMES[tick-1]} fontSize={12} /><YAxis tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`} fontSize={12} /><Tooltip formatter={(value: number, name: string, props) => { const payload = props.payload || {}; const total = Object.keys(payload).filter(key => key !== 'bulan').reduce((sum, key) => sum + (payload[key] || 0), 0); const percentage = total > 0 ? (value / total) * 100 : 0; return [`${percentage.toFixed(2)}%`, name];}} /><Legend wrapperStyle={{fontSize: '12px'}}/>{areaChartKeys.map((key, index) => (<Area key={key} type="monotone" dataKey={key} name={key} stackId="1" stroke={COLORS[index % COLORS.length]} fill={COLORS[index % COLORS.length]} />))}</AreaChart></ResponsiveContainer>)}</CardContent></Card>
                    <Card><CardHeader><CardTitle>Aktivitas Tanam vs. Panen</CardTitle><CardDescription>Perbandingan jumlah subsegmen yang tanam dan panen setiap bulan selama tahun {selectedYear}.</CardDescription></CardHeader><CardContent>{lineChartData.length === 0 ? <NoDataDisplay /> : (<ResponsiveContainer width="100%" height={300}><LineChart data={lineChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend wrapperStyle={{fontSize: '12px'}}/><Line type="monotone" name="Tanam" dataKey="Tanam" stroke="#3b82f6" strokeWidth={2} /><Line type="monotone" name="Panen" dataKey="Panen" stroke="#22c55e" strokeWidth={2} /></LineChart></ResponsiveContainer>)}</CardContent></Card>
                    
                    {/* Tabel Distribusi Frekuensi Tetap Sama */}
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><TableIcon className="h-5 w-5"/> Distribusi Frekuensi Panen</CardTitle><CardDescription>Jumlah subsegmen berdasarkan berapa kali panen dalam setahun ({selectedYear}). Klik nama kabupaten untuk melihat rincian.</CardDescription></CardHeader><CardContent>{pivotTableData.length === 0 ? <NoDataDisplay message="Tidak ada data panen untuk filter ini." /> : (<div className="rounded-md border"><Table><TableHeader>{table.getHeaderGroups().map(headerGroup => (<TableRow key={headerGroup.id}>{headerGroup.headers.map(header => (<TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}</TableHeader><TableBody>{table.getRowModel().rows.map(row => (<TableRow key={row.id}>{row.getVisibleCells().map(cell => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))}</TableBody></Table></div>)}</CardContent></Card>
                </div>
            )}
            
            {/* 5. RENDER MODAL SECARA KONDISIONAL */}
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
