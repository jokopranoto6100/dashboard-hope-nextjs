/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// Impor React dan hooks
import React, { useMemo, useState } from 'react';

// Impor komponen UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Impor konteks dan hooks kustom
import { useUbinanEvaluasiFilter } from '@/context/UbinanEvaluasiFilterContext';
import { useUbinanDescriptiveStatsData, DescriptiveStatsRow } from '@/hooks/useUbinanDescriptiveStatsData';
import { usePenggunaanBenihDanPupukData, PupukDanBenihRow } from '@/hooks/usePenggunaanBenihDanPupukData';
import { useYear } from '@/context/YearContext';

// Impor definisi kolom tabel
import { columns as descriptiveStatsTableColumns } from './descriptive-stats-columns';
import { benihDanPupukColumns } from './penggunaan-benih-dan-pupuk-columns';

// Impor Server Action
import { downloadAnomaliExcelAction } from './_actions';

// Impor utilitas dan komponen lain
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, SortingState, RowData } from "@tanstack/react-table";

// --- DIUBAH: Impor kedua modal ---
import { DetailKabupatenModal } from './DetailKabupatenModal';
import { HasilUbinanDetailModal } from './HasilUbinanDetailModal'; 

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    kalimantanBaratData?: DescriptiveStatsRow | null;
    kalimantanBaratPupukDanBenih?: PupukDanBenihRow | null;
    currentUnit?: string;
    selectedKomoditas?: string | null; // BARU
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

  // State untuk komponen
  const [useKuHa, setUseKuHa] = useState(false);
  const [sortingStats, setSortingStats] = React.useState<SortingState>([]);
  const [sortingBenihDanPupuk, setSortingBenihDanPupuk] = React.useState<SortingState>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // State untuk modal detail benih & pupuk
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedKabForDetail, setSelectedKabForDetail] = useState<{ code: number; name: string; } | null>(null);

  // --- BARU: State untuk modal detail hasil ubinan ---
  const [isHasilUbinanModalOpen, setIsHasilUbinanModalOpen] = useState(false);
  const [selectedKabForHasilUbinan, setSelectedKabForHasilUbinan] = useState<{ code: number; name: string; } | null>(null);
  
  // Konversi dan unit
  const conversionFactor = useKuHa ? 16 : 1;
  const currentUnit = useKuHa ? 'ku/ha' : 'kg/plot';

  // Pengambilan data
  const {
    data: statsDataPerKab,
    kalimantanBaratData: kalbarStatsData,
    isLoadingData: isLoadingStatsData,
    error: statsDataError,
  } = useUbinanDescriptiveStatsData(conversionFactor);

  const {
    dataBenihDanPupuk,
    isLoadingBenihPupuk,
    errorBenihPupuk,
  } = usePenggunaanBenihDanPupukData();

  const { pupukDanBenihPerKab, kalimantanBaratPupukDanBenih } = dataBenihDanPupuk;

  // Memoization untuk tabel
  const memoizedStatsColumns = useMemo(() => descriptiveStatsTableColumns, []);
  const memoizedStatsData = useMemo(() => statsDataPerKab, [statsDataPerKab]);
  const memoizedBenihDanPupukColumns = useMemo(() => benihDanPupukColumns, []);
  const memoizedBenihDanPupukData = useMemo(() => pupukDanBenihPerKab, [pupukDanBenihPerKab]);

  // Inisialisasi React Table
  const statsTable = useReactTable({
    data: memoizedStatsData,
    columns: memoizedStatsColumns,
    state: { sorting: sortingStats },
    onSortingChange: setSortingStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // --- DIUBAH: Tambahkan selectedKomoditas ke meta ---
    meta: { 
        kalimantanBaratData: kalbarStatsData, 
        currentUnit,
        selectedKomoditas, // BARU
    },
  });

  const benihDanPupukTable = useReactTable({
    data: memoizedBenihDanPupukData,
    columns: memoizedBenihDanPupukColumns,
    state: { sorting: sortingBenihDanPupuk },
    onSortingChange: setSortingBenihDanPupuk,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: { kalimantanBaratPupukDanBenih },
  });

  // Handler untuk interaksi UI
  const handleSubroundChange = (value: string) => setSelectedSubround(value === 'all' ? 'all' : Number(value));
  const handleKomoditasChange = (value: string) => setSelectedKomoditas(value);
  const isKomoditasDisabled = isLoadingFilters || availableKomoditas.length === 0;

  // Handler untuk modal detail benih & pupuk (tetap ada)
  const handleOpenDetailModal = (rowData: RowData) => {
    const kabData = rowData as PupukDanBenihRow;
    if (kabData.kab !== undefined && kabData.kab !== null) {
      setSelectedKabForDetail({ code: kabData.kab, name: kabData.namaKabupaten });
      setIsDetailModalOpen(true);
    }
  };
  
  // --- BARU: Handler untuk modal detail hasil ubinan ---
  const handleOpenHasilUbinanModal = (rowData: RowData) => {
    const statsData = rowData as DescriptiveStatsRow;
    if (statsData.kab !== undefined && statsData.kab !== null) {
      setSelectedKabForHasilUbinan({ code: statsData.kab, name: statsData.namaKabupaten });
      setIsHasilUbinanModalOpen(true);
    }
  };

  // Fungsi untuk menangani download Excel
  const handleDownloadAnomali = async () => {
    setIsDownloading(true);
    toast.info("Mempersiapkan file Excel...", {
      description: `Data anomali untuk tahun ${selectedYear} sedang diambil.`,
    });

    try {
      const result = await downloadAnomaliExcelAction(selectedYear as number); //

      if (result.success && result.data) {
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = result.fileName || `anomali_ubinan_${selectedYear}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        toast.success("Download Berhasil", {
          description: `File ${result.fileName} telah diunduh.`,
        });
      } else {
        toast.error("Download Gagal", {
          description: result.message || "Gagal mengunduh file Excel.",
        });
      }
    } catch (e) {
      toast.error("Terjadi Kesalahan", {
        description: "Tidak dapat menghubungi server untuk mengunduh file.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

// --- DIUBAH: Fungsi renderTable dengan skeleton yang lebih baik ---
  const renderTable = (
    tableInstance: any, title: string, description: string, isLoading: boolean,
    errorMsg: string | null, showUnitSwitcher = false, footerData?: PupukDanBenihRow | DescriptiveStatsRow | null,
    onRowClickHandler?: (rowData: RowData) => void
  ) => {
    const noData = !isLoading && !errorMsg && tableInstance.getRowModel().rows.length === 0;
    const hasFooter = footerData && tableInstance.getRowModel().rows.length > 0;
    
    // BARU: Tentukan jumlah baris skeleton. Jika sudah ada data, pakai jumlah itu. Jika belum (initial load), pakai 5.
    const skeletonRowCount = tableInstance.getRowModel().rows.length > 0 ? tableInstance.getRowModel().rows.length : 5;

    return (
      <Card className="mt-6">
        <CardHeader className={`relative ${showUnitSwitcher ? 'pr-28 md:pr-32' : ''}`}>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {showUnitSwitcher && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center space-x-2">
              <Switch id="unit-switcher" checked={useKuHa} onCheckedChange={setUseKuHa} />
              <Label htmlFor="unit-switcher" className="text-sm font-medium whitespace-nowrap">ku/ha</Label>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* DIHAPUS: Blok skeleton lama yang statis dihapus dari sini.
            {isLoading && (<div className="space-y-2">{[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div>)} 
          */}
          {!isLoading && errorMsg && (<p className="text-red-600 dark:text-red-400 text-center py-4">Error: {errorMsg}</p>)}
          {noData && (<p className="text-center text-gray-500 dark:text-gray-400 py-4">Tidak ada data untuk ditampilkan.</p>)}
          
          {/* DIUBAH: Tampilkan tabel bahkan saat loading untuk menjaga struktur */}
          {(!noData || isLoading) && !errorMsg && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  {tableInstance.getHeaderGroups().map((headerGroup: any) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header: any) => (
                        <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()} className={`whitespace-nowrap ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`} style={{ textAlign: 'center' }}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted() as string] ?? null}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {/* BARU: Logika untuk menampilkan baris skeleton atau baris data asli */}
                  {isLoading ? (
                    // Tampilkan baris skeleton
                    [...Array(skeletonRowCount)].map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        {tableInstance.getAllLeafColumns().map((column: any) => (
                          <TableCell key={column.id} style={{ textAlign: 'center' }} className="whitespace-nowrap">
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    // Tampilkan baris data asli (logika yang sudah ada)
                    tableInstance.getRowModel().rows.map((row: any) => (
                      <TableRow 
                        key={row.id} 
                        onClick={onRowClickHandler ? () => onRowClickHandler(row.original) : undefined}
                        className={onRowClickHandler ? "cursor-pointer hover:bg-muted/50" : ""}
                      >
                        {row.getVisibleCells().map((cell: any) => (
                          <TableCell key={cell.id} style={{ textAlign: 'center' }} className="whitespace-nowrap">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
                {/* Footer tidak ditampilkan saat loading */}
                {hasFooter && !isLoading && (
                  <TableFooter>
                    {tableInstance.getFooterGroups().map((footerGroup: any) => (
                      <TableRow key={footerGroup.id} className="bg-muted/50 font-semibold">
                        {footerGroup.headers.map((header: any) => (
                          <TableCell key={header.id} scope="col" style={{ textAlign: 'center' }} className="whitespace-nowrap">
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-x-4 gap-y-2 mb-4">
        <div>
          <Button onClick={handleDownloadAnomali} disabled={isDownloading} variant="outline">
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download Anomali
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-x-4 gap-y-2">
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
      </div>

      {/* --- DIUBAH: Panggilan renderTable untuk statsTable menggunakan handler baru --- */}
      {renderTable(
          statsTable, 
          "Statistik Deskriptif Hasil Ubinan (r701)", 
          `Pilih tahun melalui filter global di header. Data pada tabel di bawah ini difilter berdasarkan subround dan komoditas yang dipilih di atas. Statistik mencakup entri r701 yang tidak kosong. Ubah satuan ke kuintal/hektar menggunakan tombol di pojok kanan atas.`, 
          isLoadingStatsData, 
          statsDataError, 
          true, 
          kalbarStatsData,
          handleOpenHasilUbinanModal
      )}
      
      {renderTable(
        benihDanPupukTable,
        "Rata-Rata Penggunaan Benih dan Pupuk",
        `Data pada tabel di bawah ini menampilkan rata-rata penggunaan benih dan berbagai jenis pupuk per hektar, serta rata-rata luas tanam (m²) per kabupaten. Data difilter berdasarkan tahun, subround, dan komoditas yang dipilih. Klik baris untuk melihat detail per record.`,
        isLoadingBenihPupuk, 
        errorBenihPupuk, 
        false, 
        kalimantanBaratPupukDanBenih,
        handleOpenDetailModal
      )}

      {/* Modal untuk Benih & Pupuk (tetap ada) */}
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

      {/* --- BARU: Render modal detail hasil ubinan --- */}
      {selectedKabForHasilUbinan && (
        <HasilUbinanDetailModal
          isOpen={isHasilUbinanModalOpen}
          onClose={() => { setIsHasilUbinanModalOpen(false); setSelectedKabForHasilUbinan(null); }}
          kabCode={selectedKabForHasilUbinan.code}
          namaKabupaten={selectedKabForHasilUbinan.name}
          selectedYear={selectedYear}
          selectedSubround={selectedSubround}
          selectedKomoditas={selectedKomoditas}
        />
      )}
    </div>
  );
}