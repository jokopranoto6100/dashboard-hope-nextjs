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
import { usePenggunaanBenihDanPupukData, BenihRow, PupukRow } from '@/hooks/usePenggunaanBenihDanPupukData';
import { columns as descriptiveStatsTableColumns } from './descriptive-stats-columns';
import { benihColumns } from './penggunaan-benih-columns';
import { pupukColumns } from './penggunaan-pupuk-columns';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  RowData, // Ditambahkan untuk tipe generic
} from "@tanstack/react-table";

// Impor DetailKabupatenModal (pastikan path ini benar dan file akan dibuat)
import { DetailKabupatenModal } from './DetailKabupatenModal';
// Ambil selectedYear dari useYear (atau pastikan sudah ada di useUbinanEvaluasiFilter)
import { useYear } from '@/context/YearContext';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    kalimantanBaratData?: DescriptiveStatsRow | null;
    kalimantanBaratBenih?: BenihRow | null;
    kalimantanBaratPupuk?: PupukRow | null;
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
  const { selectedYear } = useYear(); // Ambil selectedYear

  const [useKuHa, setUseKuHa] = useState(false);
  const conversionFactor = useKuHa ? 16 : 1;
  const currentUnit = useKuHa ? 'ku/ha' : 'kg/plot';
  const [sortingStats, setSortingStats] = React.useState<SortingState>([]);
  const [sortingBenih, setSortingBenih] = React.useState<SortingState>([]);
  const [sortingPupuk, setSortingPupuk] = React.useState<SortingState>([]);

  // State untuk modal detail
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedKabForDetail, setSelectedKabForDetail] = useState<{ code: number; name: string; tableType: 'benih' | 'pupuk' } | null>(null);

  const {
    data: statsDataPerKab,
    kalimantanBaratData: kalbarStatsData,
    isLoadingData: isLoadingStatsData,
    error: statsDataError,
  } = useUbinanDescriptiveStatsData(conversionFactor);

  const {
    dataBenihPupuk,
    isLoadingBenihPupuk,
    errorBenihPupuk,
  } = usePenggunaanBenihDanPupukData();

  const { benihPerKab, pupukPerKab, kalimantanBaratBenih, kalimantanBaratPupuk } = dataBenihPupuk;

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

  const memoizedBenihColumns = useMemo(() => benihColumns, []);
  const memoizedBenihData = useMemo(() => benihPerKab, [benihPerKab]);

  const benihTable = useReactTable({
    data: memoizedBenihData,
    columns: memoizedBenihColumns,
    state: { sorting: sortingBenih },
    onSortingChange: setSortingBenih,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    meta: { kalimantanBaratBenih },
  });

  const memoizedPupukColumns = useMemo(() => pupukColumns, []);
  const memoizedPupukData = useMemo(() => pupukPerKab, [pupukPerKab]);

  const pupukTable = useReactTable({
    data: memoizedPupukData,
    columns: memoizedPupukColumns,
    state: { sorting: sortingPupuk },
    onSortingChange: setSortingPupuk,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    meta: { kalimantanBaratPupuk },
  });

  const handleSubroundChange = (value: string) => {
    setSelectedSubround(value === 'all' ? 'all' : Number(value));
  };

  const handleKomoditasChange = (value: string) => {
    setSelectedKomoditas(value);
  };
  
  const isKomoditasDisabled = isLoadingFilters || availableKomoditas.length === 0;

  // Fungsi untuk menangani klik baris dan membuka modal
  const handleOpenDetailModal = (rowData: RowData, type: 'benih' | 'pupuk') => {
    // Pastikan rowData adalah tipe yang benar (BenihRow atau PupukRow)
    const kabData = rowData as BenihRow | PupukRow; // Type assertion
    if (kabData.kab !== undefined && kabData.kab !== null) {
      setSelectedKabForDetail({ code: kabData.kab, name: kabData.namaKabupaten, tableType: type });
      setIsDetailModalOpen(true);
    }
  };

  const renderTable = (
    tableInstance: any,
    title: string,
    description: string,
    isLoading: boolean,
    errorMsg: string | null, // Ganti nama parameter agar tidak konflik
    showUnitSwitcher: boolean = false,
    footerData?: BenihRow | PupukRow | DescriptiveStatsRow | null,
    onRowClickHandler?: (rowData: RowData) => void // Tambahkan parameter onRowClickHandler
  ) => {
    const noData = !isLoading && !errorMsg && tableInstance.getRowModel().rows.length === 0;
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
                      <TableRow key={footerGroup.id} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold">
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
      {renderTable(
        benihTable, 
        "Tabel Rata-Rata Penggunaan Benih", 
        `Data pada tabel di bawah ini menampilkan rata-rata penggunaan benih per hektar (Kg/Ha) dan rata-rata luas tanam (m²) per kabupaten, berdasarkan filter tahun, subround, dan komoditas yang dipilih. Klik baris untuk melihat detail per record.`, 
        isLoadingBenihPupuk, 
        errorBenihPupuk, 
        false, 
        kalimantanBaratBenih,
        (data) => handleOpenDetailModal(data, 'benih') // Tambahkan handler
      )}
      {renderTable(
        pupukTable, 
        "Tabel Rata-Rata Penggunaan Pupuk", 
        `Data pada tabel di bawah ini menampilkan rata-rata penggunaan berbagai jenis pupuk per hektar dan rata-rata luas tanam (m²) per kabupaten, berdasarkan filter tahun, subround, dan komoditas yang dipilih. Satuan pupuk dalam Kg/Ha, kecuali organik cair dalam Liter/Ha. Klik baris untuk melihat detail per record.`, 
        isLoadingBenihPupuk, 
        errorBenihPupuk, 
        false, 
        kalimantanBaratPupuk,
        (data) => handleOpenDetailModal(data, 'pupuk') // Tambahkan handler
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