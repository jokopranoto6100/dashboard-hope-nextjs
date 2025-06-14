/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/evaluasi/ubinan/evaluasi-ubinan-client.tsx
"use client";

import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUbinanEvaluasiFilter } from '@/context/UbinanEvaluasiFilterContext';
import { useUbinanDescriptiveStatsData, DescriptiveStatsRow } from '@/hooks/useUbinanDescriptiveStatsData';
// Impor interface dan hook yang sudah digabung
import { usePenggunaanBenihDanPupukData, PupukDanBenihRow } from '@/hooks/usePenggunaanBenihDanPupukData'; //
import { columns as descriptiveStatsTableColumns } from './descriptive-stats-columns';
// Impor kolom gabungan (pastikan nama file dan ekspornya sesuai)
import { benihDanPupukColumns } from './penggunaan-benih-dan-pupuk-columns'; // Atau './penggunaan-benih-dan-pupuk-columns'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  RowData,
} from "@tanstack/react-table";

import { DetailKabupatenModal } from './DetailKabupatenModal';
import { useYear } from '@/context/YearContext';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    kalimantanBaratData?: DescriptiveStatsRow | null;
    // kalimantanBaratBenih?: BenihRow | null; // Hapus
    kalimantanBaratPupukDanBenih?: PupukDanBenihRow | null; // Ganti nama
    currentUnit?: string;
  }
}

export function EvaluasiUbinanClient() {
  const {
    selectedSubround,
    setSelectedSubround,
    availableSubrounds,
    selectedKomoditas,
    setSelectedKomoditas,
    availableKomoditas,
    isLoadingFilters,
  } = useUbinanEvaluasiFilter();
  const { selectedYear } = useYear();

  const [useKuHa, setUseKuHa] = useState(false);
  const conversionFactor = useKuHa ? 16 : 1;
  const currentUnit = useKuHa ? 'ku/ha' : 'kg/plot';
  const [sortingStats, setSortingStats] = React.useState<SortingState>([]);
  // const [sortingBenih, setSortingBenih] = React.useState<SortingState>([]); // Hapus
  const [sortingBenihDanPupuk, setSortingBenihDanPupuk] = React.useState<SortingState>([]); // Ganti nama state sorting

  // State untuk modal detail
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // Tipe untuk selectedKabForDetail sekarang bisa lebih generik atau spesifik ke PupukDanBenihRow jika hanya dari tabel itu
  const [selectedKabForDetail, setSelectedKabForDetail] = useState<{ code: number; name: string; } | null>(null);


  const {
    data: statsDataPerKab,
    kalimantanBaratData: kalbarStatsData,
    isLoadingData: isLoadingStatsData,
    error: statsDataError,
  } = useUbinanDescriptiveStatsData(conversionFactor);

  // Menggunakan hook yang sudah dimodifikasi
  const {
    dataBenihDanPupuk, // Nama variabel disesuaikan dengan output hook
    isLoadingBenihPupuk,
    errorBenihPupuk,
  } = usePenggunaanBenihDanPupukData();

  // Destrukturisasi data gabungan
  const { pupukDanBenihPerKab, kalimantanBaratPupukDanBenih } = dataBenihDanPupuk;

  const memoizedStatsColumns = useMemo(() => descriptiveStatsTableColumns, []);
  const memoizedStatsData = useMemo(() => statsDataPerKab, [statsDataPerKab]);

  const statsTable = useReactTable({
    data: memoizedStatsData,
    columns: memoizedStatsColumns,
    state: { sorting: sortingStats },
    onSortingChange: setSortingStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    meta: { kalimantanBaratData: kalbarStatsData, currentUnit },
  });

  // Setup untuk tabel gabungan benih dan pupuk
  const memoizedBenihDanPupukColumns = useMemo(() => benihDanPupukColumns, []); // Gunakan kolom gabungan
  const memoizedBenihDanPupukData = useMemo(() => pupukDanBenihPerKab, [pupukDanBenihPerKab]); // Gunakan data gabungan

  const benihDanPupukTable = useReactTable({ // Ganti nama instance tabel
    data: memoizedBenihDanPupukData,
    columns: memoizedBenihDanPupukColumns,
    state: { sorting: sortingBenihDanPupuk }, // Gunakan state sorting yang baru
    onSortingChange: setSortingBenihDanPupuk,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    meta: { kalimantanBaratPupukDanBenih }, // Gunakan data Kalimantan Barat yang gabungan
  });


  const handleSubroundChange = (value: string) => {
    setSelectedSubround(value === 'all' ? 'all' : Number(value));
  };

  const handleKomoditasChange = (value: string) => {
    setSelectedKomoditas(value);
  };
  
  const isKomoditasDisabled = isLoadingFilters || availableKomoditas.length === 0;

  const handleOpenDetailModal = (rowData: RowData) => { // Parameter type tidak lagi krusial jika hanya ada satu jenis tabel detail
    const kabData = rowData as PupukDanBenihRow; // Asumsikan rowData dari tabel gabungan
    if (kabData.kab !== undefined && kabData.kab !== null) {
      setSelectedKabForDetail({ code: kabData.kab, name: kabData.namaKabupaten });
      setIsDetailModalOpen(true);
    }
  };

  const renderTable = (
    tableInstance: any,
    title: string,
    description: string,
    isLoading: boolean,
    errorMsg: string | null,
    showUnitSwitcher: boolean = false,
    // Tipe footerData disesuaikan
    footerData?: PupukDanBenihRow | DescriptiveStatsRow | null,
    onRowClickHandler?: (rowData: RowData) => void
  ) => {
    const noData = !isLoading && !errorMsg && tableInstance.getRowModel().rows.length === 0;
    // Tipe footerData disesuaikan di sini juga jika perlu validasi lebih ketat
    const hasFooter = footerData && tableInstance.getRowModel().rows.length > 0;


    return (
      <Card className="mt-6">
        <CardHeader className={`relative ${showUnitSwitcher ? 'pr-28 md:pr-32' : ''}`}>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {showUnitSwitcher && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center space-x-2">
              <Switch id="unit-switcher" checked={useKuHa} onCheckedChange={setUseKuHa} />
              <Label htmlFor="unit-switcher" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">ku/ha</Label>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && (<div className="space-y-2">{[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div>)}
          {!isLoading && errorMsg && (<p className="text-red-600 dark:text-red-400 text-center py-4">Error: {errorMsg}</p>)}
          {noData && (<p className="text-center text-gray-500 dark:text-gray-400 py-4">Tidak ada data untuk ditampilkan dengan filter yang dipilih.</p>)}
          {!isLoading && !errorMsg && tableInstance.getRowModel().rows.length > 0 && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  {tableInstance.getHeaderGroups().map((headerGroup: any) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header: any) => (
                        <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()} className={`whitespace-nowrap ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`} style={{ textAlign: 'center' }}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          {{asc: ' 🔼', desc: ' 🔽'}[header.column.getIsSorted() as string] ?? null}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {tableInstance.getRowModel().rows.map((row: any) => (
                    <TableRow 
                      key={row.id} 
                      data-state={row.getIsSelected() && "selected"}
                      onClick={onRowClickHandler ? () => onRowClickHandler(row.original) : undefined}
                      className={onRowClickHandler ? "cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/30" : ""}
                    >
                      {row.getVisibleCells().map((cell: any) => (
                        <TableCell key={cell.id} style={{ textAlign: 'center' }} className="whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
                {hasFooter && (
                  <TableFooter>
                    {tableInstance.getFooterGroups().map((footerGroup: any) => (
                      <TableRow
                        key={footerGroup.id}
                        className="bg-muted/50 dark:bg-muted/30 font-semibold"
                      >
                        {footerGroup.headers.map((header: any) => (
                          <TableCell
                            key={header.id}
                            scope="col"
                            style={{ textAlign: 'center' }}
                            className="whitespace-nowrap text-gray-900 dark:text-gray-100"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.footer, header.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableFooter>
                )}
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-end items-center gap-x-4 gap-y-2 mb-4">
        <div>
          {isLoadingFilters ? (<Skeleton className="h-10 w-36 sm:w-40" />) : (
            <Select value={selectedSubround === 'all' ? 'all' : String(selectedSubround)} onValueChange={handleSubroundChange} disabled={isLoadingFilters || availableSubrounds.length === 0}>
              <SelectTrigger id="subround-filter" className="w-full sm:w-auto min-w-[150px]"><SelectValue placeholder="Pilih Subround" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Subround</SelectItem>
                {availableSubrounds.map((subround) => (<SelectItem key={subround} value={String(subround)}>Subround {subround}</SelectItem>))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          {isLoadingFilters ? (<Skeleton className="h-10 w-36 sm:w-40" />) : (
            <Select value={selectedKomoditas || ""} onValueChange={handleKomoditasChange} disabled={isKomoditasDisabled}>
              <SelectTrigger id="komoditas-filter" className="w-full sm:w-auto min-w-[150px]"><SelectValue placeholder={isKomoditasDisabled ? "Tidak ada komoditas" : "Pilih Komoditas"} /></SelectTrigger>
              <SelectContent>
                {availableKomoditas.map((komoditas) => (<SelectItem key={komoditas} value={komoditas}>{komoditas}</SelectItem>))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {renderTable(statsTable, "Tabel Statistik Deskriptif Ubinan (R701)", `Pilih tahun melalui filter global di header. Data pada tabel di bawah ini difilter berdasarkan subround dan komoditas yang dipilih di atas. Statistik mencakup entri R701 yang tidak kosong. Ubah satuan menggunakan tombol di pojok kanan atas kartu ini.`, isLoadingStatsData, statsDataError, true, kalbarStatsData)}
      
      {/* Hapus renderTable untuk tabel benih yang terpisah */}
      {/* {renderTable(benihTable, "Tabel Rata-Rata Penggunaan Benih", ..., handleOpenDetailModal(data, 'benih'))} */}

      {/* Render tabel gabungan benih dan pupuk */}
      {renderTable(
        benihDanPupukTable, // Gunakan instance tabel gabungan
        "Tabel Rata-Rata Penggunaan Benih dan Pupuk", // Judul baru
        `Data pada tabel di bawah ini menampilkan rata-rata penggunaan benih dan berbagai jenis pupuk per hektar, serta rata-rata luas tanam (m²) per kabupaten. Data difilter berdasarkan tahun, subround, dan komoditas yang dipilih. Klik baris untuk melihat detail per record.`, // Deskripsi baru
        isLoadingBenihPupuk, 
        errorBenihPupuk, 
        false, 
        kalimantanBaratPupukDanBenih, // Gunakan data footer gabungan
        handleOpenDetailModal // Handler tetap sama, tipe data di handleOpenDetailModal sudah PupukDanBenihRow
      )}

      {/* Render Modal Detail */}
      {selectedKabForDetail && (
        <DetailKabupatenModal
          isOpen={isDetailModalOpen}
          onClose={() => { setIsDetailModalOpen(false); setSelectedKabForDetail(null); }}
          kabCode={selectedKabForDetail.code}
          namaKabupaten={selectedKabForDetail.name}
          selectedYear={selectedYear}
          selectedSubround={selectedSubround}
          selectedKomoditas={selectedKomoditas}
        />
      )}
    </div>
  );
}