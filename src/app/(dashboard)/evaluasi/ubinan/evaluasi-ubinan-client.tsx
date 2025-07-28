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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, Download, Loader2, ArrowUpDown, ArrowUp, ArrowDown, BarChart3, TrendingUp } from 'lucide-react';
import { toast } from "sonner";
import Link from 'next/link';

// Impor konteks dan hooks kustom
import { useUbinanEvaluasiFilter } from '@/context/UbinanEvaluasiFilterContext';
import { useUbinanDescriptiveStatsData } from '@/hooks/useUbinanDescriptiveStatsData';
import { usePenggunaanBenihDanPupukData } from '@/hooks/usePenggunaanBenihDanPupukData';
import { useYear } from '@/context/YearContext';
import { DescriptiveStatsRow, PupukDanBenihRow } from './types';

// Impor definisi kolom tabel
import { detailStatsColumns, createComparisonStatsColumns } from './descriptive-stats-columns';
import { detailFertilizerColumns, getComparisonFertilizerColumns } from './penggunaan-benih-dan-pupuk-columns';

// Impor Server Action
import { downloadAnomaliExcelAction } from './_actions';

// Impor utilitas dan komponen lain
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, SortingState, RowData } from "@tanstack/react-table";
import { DetailKabupatenModal } from './DetailKabupatenModal';
import { HasilUbinanDetailModal } from './HasilUbinanDetailModal';
import { UbinanBoxPlot } from './UbinanBoxPlot';
import { UbinanComparisonChart } from './UbinanComparisonChart';

declare module '@tanstack/react-table' {
  // Baris komentar di bawah ini adalah solusinya
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    kalimantanBaratData?: DescriptiveStatsRow | null;
    kalimantanBaratPupukDanBenih?: PupukDanBenihRow | null;
    currentUnit?: string;
    selectedKomoditas?: string | null;
  }
}

const FERTILIZER_VARIABLES = [
    { id: 'avgBenihPerHa_kg_ha', label: 'Benih' }, { id: 'avgUreaPerHa_kg_ha', label: 'Urea' }, { id: 'avgTSPerHa_kg_ha', label: 'TSP/SP36' }, { id: 'avgKCLperHa_kg_ha', label: 'KCL' }, { id: 'avgNPKPerHa_kg_ha', label: 'NPK' }, { id: 'avgKomposPerHa_kg_ha', label: 'Kompos' }, { id: 'avgOrganikCairPerHa_liter_ha', label: 'Organik Cair' }, { id: 'avgZAPerHa_kg_ha', label: 'ZA' },
];

const JUMLAH_KABUPATEN_KOTA = 14; // [PERBAIKAN] Definisikan konstanta

export function EvaluasiUbinanClient() {
  const { selectedSubround, setSelectedSubround, availableSubrounds, selectedKomoditas, setSelectedKomoditas, availableKomoditas, isLoadingFilters } = useUbinanEvaluasiFilter();
  const { selectedYear, availableYears } = useYear();
  const [useKuHa, setUseKuHa] = useState(false);
  const [sortingStats, setSortingStats] = React.useState<SortingState>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedKabForDetail, setSelectedKabForDetail] = useState<{ code: number; name: string; } | null>(null);
  const [isHasilUbinanModalOpen, setIsHasilUbinanModalOpen] = useState(false);
  const [selectedKabForHasilUbinan, setSelectedKabForHasilUbinan] = useState<{ code: number; name: string; } | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'detail' | 'comparison'>('detail');
  const [comparisonYear, setComparisonYear] = useState<number | null>(null);
  const [comparisonFertilizerVariables, setComparisonFertilizerVariables] = useState<string[]>(['avgBenihPerHa_kg_ha']);
  const [sortingBenihDanPupuk, setSortingBenihDanPupuk] = React.useState<SortingState>([]);
  const conversionFactor = useKuHa ? 16 : 1;
  const currentUnit = useKuHa ? 'ku/ha' : 'kg/plot';

  const { descriptiveStats, boxPlotData, kalimantanBaratData: kalbarStatsData, isLoadingData, error: statsDataError } = useUbinanDescriptiveStatsData(conversionFactor, analysisMode === 'comparison' ? comparisonYear : null);
  const { dataBenihDanPupuk, isLoadingBenihPupuk, errorBenihPupuk } = usePenggunaanBenihDanPupukData(analysisMode === 'comparison' ? comparisonYear : null);
  const { pupukDanBenihPerKab, kalimantanBaratPupukDanBenih } = dataBenihDanPupuk;

  const statsColumns = useMemo(() => {
    if (analysisMode === 'comparison' && comparisonYear && selectedYear) {
      return createComparisonStatsColumns(selectedYear, comparisonYear);
    }
    return detailStatsColumns;
  }, [analysisMode, comparisonYear, selectedYear]);

  const fertilizerColumns = useMemo(() => {
    if (analysisMode === 'comparison' && comparisonYear && selectedYear) {
      return getComparisonFertilizerColumns(comparisonFertilizerVariables, selectedYear, comparisonYear);
    }
    return detailFertilizerColumns;
  }, [analysisMode, comparisonYear, comparisonFertilizerVariables, selectedYear]);

  const statsTable = useReactTable({
    data: descriptiveStats, columns: statsColumns, state: { sorting: sortingStats }, onSortingChange: setSortingStats, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), meta: { kalimantanBaratData: kalbarStatsData, currentUnit, selectedKomoditas },
  });

  const benihDanPupukTable = useReactTable({
    data: pupukDanBenihPerKab, columns: fertilizerColumns, state: { sorting: sortingBenihDanPupuk }, onSortingChange: setSortingBenihDanPupuk, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), meta: { kalimantanBaratPupukDanBenih },
  });

  const handleSubroundChange = (value: string) => setSelectedSubround(value === 'all' ? 'all' : Number(value));
  const handleKomoditasChange = (value: string) => setSelectedKomoditas(value);
  const isKomoditasDisabled = isLoadingFilters || availableKomoditas.length === 0;

  const handleOpenDetailModal = (rowData: RowData) => {
    const kabData = rowData as PupukDanBenihRow;
    if (kabData.kab !== undefined && kabData.kab !== null) {
      setSelectedKabForDetail({ code: kabData.kab, name: kabData.namaKabupaten });
      setIsDetailModalOpen(true);
    }
  };
  
  const handleOpenHasilUbinanModal = (rowData: RowData) => {
    const statsData = rowData as DescriptiveStatsRow;
    if (statsData.kab !== undefined && statsData.kab !== null) {
      setSelectedKabForHasilUbinan({ code: statsData.kab, name: statsData.namaKabupaten });
      setIsHasilUbinanModalOpen(true);
    }
  };

  const handleDownloadAnomali = async () => {
    if (!selectedYear) {
      toast.error("Tahun belum dipilih", { description: "Silakan pilih tahun terlebih dahulu." });
      return;
    }
    setIsDownloading(true);
    toast.info("Mempersiapkan file Excel...", { description: `Data anomali untuk tahun ${selectedYear} sedang diambil.` });
    try {
      const result = await downloadAnomaliExcelAction(selectedYear);
      if (result.success && result.data) {
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) { byteNumbers[i] = byteCharacters.charCodeAt(i); }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = result.fileName || `anomali_ubinan_${selectedYear}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast.success("Download Berhasil", { description: `File ${result.fileName} telah diunduh.` });
      } else {
        toast.error("Download Gagal", { description: result.message || "Gagal mengunduh file Excel." });
      }
    } catch {
      toast.error("Terjadi Kesalahan", { description: "Tidak dapat menghubungi server untuk mengunduh file." });
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleComparisonVariableChange = (variableId: string, checked: boolean) => {
    setComparisonFertilizerVariables(prev => 
        checked ? [...prev, variableId] : prev.filter(item => item !== variableId)
    );
  };

  const renderTable = (
    tableInstance: any, title: string, description: string, isLoading: boolean,
    errorMsg: string | null, showUnitSwitcher = false, footerData?: PupukDanBenihRow | DescriptiveStatsRow | null,
    onRowClickHandler?: (rowData: RowData) => void,
    headerActions?: React.ReactNode
  ) => {
    const noData = !isLoading && !errorMsg && tableInstance.getRowModel().rows.length === 0;
    const hasFooter = footerData; 
    
    // [PERBAIKAN] Gunakan konstanta untuk fallback saat loading awal
    const skeletonRowCount = tableInstance.getRowModel().rows.length > 0 ? tableInstance.getRowModel().rows.length : JUMLAH_KABUPATEN_KOTA;

    return (
      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {showUnitSwitcher && (
                  <div className="flex items-center space-x-2 pl-2 border-l">
                    <Switch id="unit-switcher" checked={useKuHa} onCheckedChange={setUseKuHa} />
                    <Label htmlFor="unit-switcher" className="text-sm font-medium whitespace-nowrap">ku/ha</Label>
                  </div>
                )}
              </div>
            </div>
            {headerActions && (
              <div className="flex justify-start">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isLoading && errorMsg && (<p className="text-red-600 dark:text-red-400 text-center py-4">Error: {errorMsg}</p>)}
          {noData && (<p className="text-center text-gray-500 dark:text-gray-400 py-4">Tidak ada data untuk ditampilkan.</p>)}
          {(!noData || isLoading) && !errorMsg && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  {tableInstance.getHeaderGroups().map((headerGroup: any) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header: any) => (
                        <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()} className={`whitespace-nowrap ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`} style={{ textAlign: 'center' }}>
                            <div className="flex items-center justify-center">
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getCanSort() && (
                                    header.column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> :
                                    header.column.getIsSorted() === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> :
                                    <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />
                                )}
                            </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {isLoading ? ([...Array(skeletonRowCount)].map((_, i) => (<TableRow key={`skeleton-${i}`}>{tableInstance.getAllLeafColumns().map((column: any) => (<TableCell key={column.id} style={{ textAlign: 'center' }} className="whitespace-nowrap"><Skeleton className="h-5 w-full" /></TableCell>))}</TableRow>)))
                   : (tableInstance.getRowModel().rows.map((row: any) => (<TableRow key={row.id} onClick={onRowClickHandler ? () => onRowClickHandler(row.original) : undefined} className={onRowClickHandler ? "cursor-pointer hover:bg-muted/50" : ""}>{row.getVisibleCells().map((cell: any) => (<TableCell key={cell.id} style={{ textAlign: 'center' }} className="whitespace-nowrap">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>)))}
                </TableBody>
                {hasFooter && !isLoading && (
                  <TableFooter>
                    {tableInstance.getFooterGroups().map((footerGroup: any) => (
                      <TableRow key={footerGroup.id} className="bg-muted/50 font-semibold">
                        {footerGroup.headers.map((header: any) => (
                          <TableCell key={header.id} scope="col" style={{ textAlign: 'center' }} className="whitespace-nowrap">{header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}</TableCell>
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

  const fertilizerVariablesFilter = (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Pilih Variabel
          <Badge className="ml-2">{comparisonFertilizerVariables.length}</Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2"><h4 className="font-medium leading-none">Variabel Pembanding</h4><p className="text-sm text-muted-foreground">Pilih variabel benih & pupuk yang ingin ditampilkan.</p></div>
          <div className="grid grid-cols-2 gap-4">
            {FERTILIZER_VARIABLES.map(variable => (<div key={variable.id} className="flex items-center space-x-2"><Checkbox id={`check-${variable.id}`} checked={comparisonFertilizerVariables.includes(variable.id)} onCheckedChange={(checked) => handleComparisonVariableChange(variable.id, checked as boolean)} /><Label htmlFor={`check-${variable.id}`} className="text-sm font-normal">{variable.label}</Label></div>))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-4">
      {/* Header - following scatter-plot pattern with gradient */}
      <div 
        className="relative overflow-hidden rounded-xl p-4 sm:p-6 text-white shadow-xl"
        style={{
          background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 50%, rgb(29, 78, 216) 100%)'
        }}
      >
        {/* Background pattern dengan dark mode adaptif */}
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent dark:from-white/3 dark:to-transparent" />
        
        {/* Decorative circles dengan dark mode adaptif */}
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 dark:bg-white/5 blur-xl" />
        <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5 dark:bg-white/3 blur-2xl" />
        
        <div className="relative flex flex-col gap-4 sm:gap-6 sm:flex-row sm:justify-between sm:items-center">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-white/20 dark:bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">Evaluasi Sampel Ubinan</h1>
                <div className="flex items-center gap-1 sm:gap-2 mt-1">
                  <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-white/60 dark:bg-white/50 rounded-full" />
                  <div className="h-0.5 sm:h-1 w-6 sm:w-8 bg-white/40 dark:bg-white/30 rounded-full" />
                  <div className="h-0.5 sm:h-1 w-3 sm:w-4 bg-white/20 dark:bg-white/15 rounded-full" />
                </div>
              </div>
            </div>
            <p className="text-white/90 dark:text-white/85 text-sm sm:text-base lg:text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
              <span>Analisis statistik deskriptif hasil Ubinan berdasarkan Kabupaten/Kota</span>
              <span className="font-bold bg-white/20 dark:bg-white/15 px-2 py-1 rounded-lg text-white text-sm sm:text-base">{selectedYear || 'Pilih Tahun'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Layout: Stack (Download top, filters below in 2-col grid) */}
            {/* Filter Controls - Compact and Responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Download Button */}
        <div className="order-2 sm:order-1">
          <Button 
            onClick={handleDownloadAnomali} 
            disabled={isDownloading || !selectedYear} 
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white border-amber-500 dark:border-amber-600 transition-colors"
            size="sm"
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download Anomali
          </Button>
        </div>
        
        {/* Filters - Compact Layout */}
        <div className="order-1 sm:order-2 flex gap-2">
          <div className="flex-1">
            {isLoadingFilters ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select 
                value={selectedSubround === 'all' ? 'all' : String(selectedSubround)} 
                onValueChange={handleSubroundChange} 
                disabled={isLoadingFilters || availableSubrounds.length === 0}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Subround" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Subround</SelectItem>
                  {availableSubrounds.map((subround) => (
                    <SelectItem key={subround} value={String(subround)}>
                      Subround {subround}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="flex-1">
            {isLoadingFilters ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select 
                value={selectedKomoditas || ""} 
                onValueChange={handleKomoditasChange} 
                disabled={isKomoditasDisabled}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={isKomoditasDisabled ? "Tidak ada" : "Komoditas"} />
                </SelectTrigger>
                <SelectContent>
                  {availableKomoditas.map((komoditas) => (
                    <SelectItem key={komoditas} value={komoditas}>
                      {komoditas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

            <Card>
        <CardHeader>
          <CardTitle>Mode Analisis</CardTitle>
          <CardDescription>Pilih mode untuk analisis mendalam satu tahun atau perbandingan antar waktu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Tabs value={analysisMode} onValueChange={(value) => setAnalysisMode(value as 'detail' | 'comparison')} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="detail">Analisis Detail</TabsTrigger>
                <TabsTrigger value="comparison">Perbandingan Waktu</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Tahun Pembanding - hanya muncul ketika mode comparison aktif */}
            {analysisMode === 'comparison' && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:pl-4 sm:border-l w-full sm:w-auto">
                <Label htmlFor="comparison-year-filter" className="text-sm font-medium whitespace-nowrap">
                  Tahun Pembanding:
                </Label>
                <Select 
                  value={comparisonYear ? String(comparisonYear) : "none"} 
                  onValueChange={(value) => setComparisonYear(value === "none" ? null : Number(value))}
                >
                  <SelectTrigger id="comparison-year-filter" className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">(Tidak ada)</SelectItem>
                    {availableYears?.filter(y => y !== selectedYear).map(year => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {/* Navigation Links - hanya muncul ketika mode detail */}
          {analysisMode === 'detail' && (
            <div className="flex flex-wrap gap-2">
              <Link href="/evaluasi/ubinan/karakteristik">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Karakteristik Sampel
                </Button>
              </Link>
              <Link href="/evaluasi/ubinan/scatter-plot">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Scatter Plot Analysis
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      <div className={analysisMode === 'detail' ? 'block' : 'hidden'}>
        <div className="space-y-6">
          {renderTable(statsTable, "Statistik Deskriptif Hasil Ubinan (r701)", `Klik baris untuk melihat detail.`, isLoadingData, statsDataError, true, kalbarStatsData, handleOpenHasilUbinanModal)}
          <UbinanBoxPlot data={boxPlotData} currentUnit={currentUnit} isLoading={isLoadingData} />
          {renderTable(benihDanPupukTable, "Rata-Rata Penggunaan Benih dan Pupuk", `Klik baris untuk melihat detail per record.`, isLoadingBenihPupuk, errorBenihPupuk, false, kalimantanBaratPupukDanBenih, handleOpenDetailModal)}
        </div>
      </div>
      <div className={analysisMode === 'comparison' ? 'block' : 'hidden'}>
        {comparisonYear ? (
          <div className="space-y-6">
            <UbinanComparisonChart data={descriptiveStats} currentYear={selectedYear!} comparisonYear={comparisonYear} isLoading={isLoadingData}/>
            {renderTable(statsTable, `Perbandingan Statistik (${selectedYear} vs ${comparisonYear})`, `Membandingkan rata-rata hasil ubinan dan jumlah sampel antara dua tahun yang dipilih.`, isLoadingData, statsDataError, true, kalbarStatsData, handleOpenHasilUbinanModal)}
            {renderTable(benihDanPupukTable, `Perbandingan Penggunaan Benih & Pupuk`, `Menampilkan perbandingan untuk variabel yang dipilih.`, isLoadingBenihPupuk, errorBenihPupuk, false, kalimantanBaratPupukDanBenih, handleOpenDetailModal, fertilizerVariablesFilter)}
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg"><p>Silakan pilih "Tahun Pembanding" untuk melihat perbandingan data.</p></div>
        )}
      </div>
      {selectedKabForDetail && (<DetailKabupatenModal isOpen={isDetailModalOpen} onClose={() => { setIsDetailModalOpen(false); setSelectedKabForDetail(null); }} kabCode={selectedKabForDetail.code} namaKabupaten={selectedKabForDetail.name} selectedYear={selectedYear} selectedSubround={selectedSubround} selectedKomoditas={selectedKomoditas}/>)}
      {selectedKabForHasilUbinan && (<HasilUbinanDetailModal isOpen={isHasilUbinanModalOpen} onClose={() => { setIsHasilUbinanModalOpen(false); setSelectedKabForHasilUbinan(null); }} kabCode={selectedKabForHasilUbinan.code} namaKabupaten={selectedKabForHasilUbinan.name} selectedYear={selectedYear} selectedSubround={selectedSubround} selectedKomoditas={selectedKomoditas}/>)}
    </div>
  );
}