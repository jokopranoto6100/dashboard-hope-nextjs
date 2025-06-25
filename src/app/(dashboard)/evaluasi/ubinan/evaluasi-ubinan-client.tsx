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
import { SlidersHorizontal, Download, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from "sonner";

// Impor konteks dan hooks kustom
import { useUbinanEvaluasiFilter } from '@/context/UbinanEvaluasiFilterContext';
import { useUbinanDescriptiveStatsData } from '@/hooks/useUbinanDescriptiveStatsData';
import { usePenggunaanBenihDanPupukData } from '@/hooks/usePenggunaanBenihDanPupukData';
import { useYear } from '@/context/YearContext';
import { DescriptiveStatsRow, PupukDanBenihRow } from './types';

// Impor definisi kolom tabel
import { detailStatsColumns, comparisonStatsColumns } from './descriptive-stats-columns';
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
    if (analysisMode === 'comparison' && comparisonYear) return comparisonStatsColumns;
    return detailStatsColumns;
  }, [analysisMode, comparisonYear]);

  const fertilizerColumns = useMemo(() => {
      if (analysisMode === 'comparison' && comparisonYear) return getComparisonFertilizerColumns(comparisonFertilizerVariables);
      return detailFertilizerColumns;
  }, [analysisMode, comparisonYear, comparisonFertilizerVariables]);

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
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {headerActions}
            {showUnitSwitcher && (
              <div className="flex items-center space-x-2 pl-2 border-l">
                <Switch id="unit-switcher" checked={useKuHa} onCheckedChange={setUseKuHa} />
                <Label htmlFor="unit-switcher" className="text-sm font-medium whitespace-nowrap">ku/ha</Label>
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-x-4 gap-y-2 mb-4">
        <div><Button onClick={handleDownloadAnomali} disabled={isDownloading || !selectedYear} variant="outline">{isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Download Anomali</Button></div>
        <div className="flex flex-col sm:flex-row items-center gap-x-4 gap-y-2">
          <div>{isLoadingFilters ? (<Skeleton className="h-10 w-36 sm:w-40" />) : (<Select value={selectedSubround === 'all' ? 'all' : String(selectedSubround)} onValueChange={handleSubroundChange} disabled={isLoadingFilters || availableSubrounds.length === 0}><SelectTrigger id="subround-filter" className="w-full sm:w-auto min-w-[150px]"><SelectValue placeholder="Pilih Subround" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Subround</SelectItem>{availableSubrounds.map((subround) => (<SelectItem key={subround} value={String(subround)}>Subround {subround}</SelectItem>))}</SelectContent></Select>)}</div>
          <div>{isLoadingFilters ? (<Skeleton className="h-10 w-36 sm:w-40" />) : (<Select value={selectedKomoditas || ""} onValueChange={handleKomoditasChange} disabled={isKomoditasDisabled}><SelectTrigger id="komoditas-filter" className="w-full sm:w-auto min-w-[150px]"><SelectValue placeholder={isKomoditasDisabled ? "Tidak ada komoditas" : "Pilih Komoditas"} /></SelectTrigger><SelectContent>{availableKomoditas.map((komoditas) => (<SelectItem key={komoditas} value={komoditas}>{komoditas}</SelectItem>))}</SelectContent></Select>)}</div>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Mode Analisis</CardTitle><CardDescription>Pilih mode untuk analisis mendalam satu tahun atau perbandingan antar waktu.</CardDescription></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center flex-wrap">
            <Tabs value={analysisMode} onValueChange={(value) => setAnalysisMode(value as 'detail' | 'comparison')} className="w-full sm:w-auto">
                <TabsList><TabsTrigger value="detail">Analisis Detail</TabsTrigger><TabsTrigger value="comparison">Perbandingan Waktu</TabsTrigger></TabsList>
            </Tabs>
            <div className="flex items-center gap-2 pl-2 sm:border-l"><Label htmlFor="comparison-year-filter" className="text-sm font-medium">Tahun Pembanding:</Label>
                <Select value={comparisonYear ? String(comparisonYear) : "none"} onValueChange={(value) => setComparisonYear(value === "none" ? null : Number(value))} disabled={analysisMode !== 'comparison'}>
                    <SelectTrigger id="comparison-year-filter" className="w-[150px]"><SelectValue placeholder="Pilih Tahun" /></SelectTrigger>
                    <SelectContent><SelectItem value="none">(Tidak ada)</SelectItem>{availableYears?.filter(y => y !== selectedYear).map(year => (<SelectItem key={year} value={String(year)}>{year}</SelectItem>))}</SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>
      <div className={analysisMode === 'detail' ? 'block' : 'hidden'}>
        <div className="space-y-6">
          {renderTable(statsTable, "Statistik Deskriptif Hasil Ubinan (r701)", `Statistik hasil ubinan per kabupaten. Klik baris untuk melihat detail. Ganti satuan menggunakan tombol di pojok kanan.`, isLoadingData, statsDataError, true, kalbarStatsData, handleOpenHasilUbinanModal)}
          <UbinanBoxPlot data={boxPlotData} currentUnit={currentUnit} isLoading={isLoadingData} />
          {renderTable(benihDanPupukTable, "Rata-Rata Penggunaan Benih dan Pupuk", `Rata-rata penggunaan benih dan pupuk per hektar. Klik baris untuk melihat detail per record.`, isLoadingBenihPupuk, errorBenihPupuk, false, kalimantanBaratPupukDanBenih, handleOpenDetailModal)}
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