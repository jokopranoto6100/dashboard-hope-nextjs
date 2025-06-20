/* eslint-disable @typescript-eslint/no-explicit-any */
// Lokasi: src/app/(dashboard)/produksi-statistik/statistik-client.tsx
"use client";

import { useState, useMemo, useRef, RefObject } from "react";
import dynamic from 'next/dynamic';
import { useYear } from "@/context/YearContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { unparse } from "papaparse";
import { saveAs } from "file-saver";
import { toPng } from 'html-to-image';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Download, Baseline, ArrowBigLeftDash } from "lucide-react";

// Local Components and Types
import { DataTable } from './data-table';
import { getColumns, AugmentedAtapDataPoint } from './columns';
import { AnnotationSheet } from './annotation-sheet';
import { KABUPATEN_MAP, FULL_MONTH_NAMES, MONTH_NAMES } from './config';

// Custom Hooks and UI Components
import { useStatistikDataFetcher } from "@/hooks/useStatistikDataFetcher";
import { useProcessedStatistikData } from "@/hooks/useProcessedStatistikData";
import { FilterControls } from "./filter-controls";
import { KpiCards } from "./kpi-cards";

// Dynamic Imports for Charts
const BarChartWrapper = dynamic(() => import('./bar-chart-wrapper'), { ssr: false, loading: () => <Skeleton className="w-full h-[300px]" /> });
const LineChartWrapper = dynamic(() => import('./line-chart-wrapper'), { ssr: false, loading: () => <Skeleton className="w-full h-[350px]" /> });
const PieChartWrapper = dynamic(() => import('./pie-chart-wrapper'), { ssr: false, loading: () => <Skeleton className="w-full h-[300px]" /> });

interface StatistikClientProps { availableIndicators: { id: number; nama_resmi: string; }[] }
type FilterState = { bulan: string; indikatorNama: string; idIndikator: number | null; level: 'provinsi' | 'kabupaten'; tahunPembanding: string; };
type TimeDataView = 'bulanan' | 'subround';

export function StatistikClient({ availableIndicators }: StatistikClientProps) {
  const { selectedYear } = useYear();
  const { supabase, user: authUser } = useAuth();
  const isMobile = useIsMobile();

  // PASTIKAN DEFINISI REF PERSIS SEPERTI INI
  const barChartCardRef = useRef<HTMLDivElement>(null!);
  const lineChartCardRef = useRef<HTMLDivElement>(null!);
  const pieChartCardRef = useRef<HTMLDivElement>(null!);

  // State untuk filter dan interaksi UI
  const [filters, setFilters] = useState<FilterState>({
    bulan: 'tahunan',
    indikatorNama: availableIndicators[0]?.nama_resmi || '',
    idIndikator: availableIndicators[0]?.id || null,
    level: 'kabupaten',
    tahunPembanding: 'tidak',
  });
  const [selectedKabupaten, setSelectedKabupaten] = useState<string | null>(null);
  const [isAnnotationSheetOpen, setIsAnnotationSheetOpen] = useState(false);
  const [selectedAnnotationPoint, setSelectedAnnotationPoint] = useState<any | null>(null);
  const [showLineChartLabels, setShowLineChartLabels] = useState(false);
  const [timeDataView, setTimeDataView] = useState<TimeDataView>('bulanan');
  const [showAllTableColumns, setShowAllTableColumns] = useState(false);

  const debouncedFilters = useDebounce(filters, 500);

  const { rawData, isLoading, mutateAnnotations } = useStatistikDataFetcher({
    ...debouncedFilters,
    selectedYear,
    selectedKabupaten,
  });

  const { kpi, barChart, lineChart, pieChart, tableData } = useProcessedStatistikData(
    rawData,
    debouncedFilters,
    selectedYear,
    selectedKabupaten,
    timeDataView
  );

  const handleFilterChange = (key: keyof Omit<FilterState, 'idIndikator'>, value: string) => {
    setSelectedKabupaten(null);
    setTimeDataView('bulanan'); 
    
    if (key === 'indikatorNama') {
        const selectedIndicator = availableIndicators.find(i => i.nama_resmi === value);
        setFilters(prev => ({ ...prev, indikatorNama: selectedIndicator?.nama_resmi || '', idIndikator: selectedIndicator?.id || null }));
    } else {
        setFilters(prev => ({ ...prev, [key]: value as any }));
    }
  };
  
  const tableColumns = useMemo(
    () => getColumns(selectedYear, filters.tahunPembanding, kpi.total, kpi.totalPembanding, isMobile, showAllTableColumns), 
    [selectedYear, filters.tahunPembanding, kpi.total, kpi.totalPembanding, isMobile, showAllTableColumns]
  );

  const handleChartClick = (payload: any) => { if (!payload) return; setSelectedAnnotationPoint(payload); setIsAnnotationSheetOpen(true); };
  
  const handleBarClick = (payload: any) => { if (!payload?.activePayload?.[0]?.payload) return; const clickedPayload = payload.activePayload[0].payload; if (filters.level === 'kabupaten' && clickedPayload.kode_wilayah) { setSelectedKabupaten(prev => prev === clickedPayload.kode_wilayah ? null : clickedPayload.kode_wilayah); return; } handleChartClick(clickedPayload); };

  const handleAnnotationSubmit = async (comment: string) => {
    if (!selectedAnnotationPoint || !filters.idIndikator) { toast.error("Gagal menyimpan: Titik data tidak valid."); return; }
    if (!authUser) { toast.error("Anda harus login untuk menambahkan komentar."); return; }

    const monthKey = Object.keys(MONTH_NAMES).find(key => MONTH_NAMES[key] === selectedAnnotationPoint.name);
    const bulanAngka = monthKey ? parseInt(monthKey, 10) : null;

    const newAnnotation = {
        user_id: authUser.id,
        komentar: comment,
        id_indikator: filters.idIndikator,
        tahun: selectedYear,
        bulan: bulanAngka,
        kode_wilayah: selectedAnnotationPoint.kode_wilayah || null
    };

    if (mutateAnnotations) {
        const { error } = await supabase.from('fenomena_anotasi').insert(newAnnotation);
        if (error) {
            toast.error("Gagal menyimpan anotasi.", { description: error.message });
        } else {
            toast.success("Anotasi berhasil ditambahkan!");
            mutateAnnotations();
        }
    }
  };
  
  // PASTIKAN TIPE PARAMETER REF PERSIS SEPERTI INI
  const handleExportChart = async (ref: RefObject<HTMLDivElement>, chartName: string) => { 
    if (!ref.current) { 
        toast.error("Grafik tidak dapat ditemukan."); 
        return; 
    } 
    toast.info("Membuat gambar grafik..."); 
    try { 
        const dataUrl = await toPng(ref.current, { cacheBust: true, backgroundColor: 'white', pixelRatio: 2 }); 
        saveAs(dataUrl, `grafik_${chartName}_${filters.indikatorNama}_${selectedYear}.png`); 
        toast.success("Grafik berhasil diunduh!"); 
    } catch (err) { 
        toast.error("Gagal mengekspor grafik.", { description: (err as Error).message }); 
    } 
  };

  const handleExport = () => {
    if (!tableData || tableData.length === 0) {
      toast.error("Tidak ada data untuk diekspor.");
      return;
    }
    type ExportRow = { "Nama Wilayah": string; "Nilai (Thn Ini)": number; "Kontribusi (%)": string | undefined; "Nilai (Thn Lalu)"?: number | null | undefined; "Pertumbuhan (%)"?: string | undefined; Indikator: string; Tahun: number; Bulan: string; Satuan: string | null; };
    
    const dataToExport: ExportRow[] = tableData.map((d: AugmentedAtapDataPoint) => {
      const monthEntry = d.bulan != null ? FULL_MONTH_NAMES[d.bulan.toString()] : undefined;
      const namaBulan = monthEntry ? monthEntry[1] : 'Tahunan';

      return {
        "Nama Wilayah": d.nama_wilayah,
        "Nilai (Thn Ini)": d.nilai,
        "Kontribusi (%)": d.kontribusi?.toFixed(2),
        ...(filters.tahunPembanding !== 'tidak' && { "Nilai (Thn Lalu)": d.nilaiTahunLalu }),
        ...(filters.tahunPembanding !== 'tidak' && { "Pertumbuhan (%)": d.pertumbuhan?.toFixed(2) }),
        Indikator: d.indikator,
        Tahun: d.tahun,
        Bulan: namaBulan,
        Satuan: d.satuan,
      };
    });
    
    const columns = [ "Nama Wilayah", "Nilai (Thn Ini)", "Kontribusi (%)", ...(filters.tahunPembanding !== 'tidak' ? ["Nilai (Thn Lalu)", "Pertumbuhan (%)"] : []), "Indikator", "Tahun", "Bulan", "Satuan" ] as const;
    const csv = unparse(dataToExport, { columns: columns as unknown as string[] });
    saveAs(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }), `data_rinci_${filters.indikatorNama}_${selectedYear}.csv`);
  };

  return (
    <div className="space-y-6">
      <FilterControls
        filters={filters}
        availableIndicators={availableIndicators}
        selectedYear={selectedYear}
        onFilterChange={handleFilterChange}
      />
      
      <Separator />
      
      {isLoading ? (
        <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
            <div className="grid lg:grid-cols-3 gap-6"><Skeleton className="h-[350px] lg:col-span-2" /><Skeleton className="h-[350px]" /></div>
            <Skeleton className="h-96" />
        </div>
      ) : (
        <div className="grid gap-6">
            <KpiCards kpi={kpi} level={filters.level} />
        
            <div className="grid lg:grid-cols-3 gap-6">
                <motion.div layout transition={{ type: "spring", stiffness: 400, damping: 30 }} className={filters.tahunPembanding !== 'tidak' ? 'lg:col-span-3' : 'lg:col-span-2'}>
                    <Card ref={barChartCardRef}>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div><CardTitle>{filters.level === 'provinsi' ? `Data ${filters.indikatorNama} Provinsi` : `Perbandingan ${filters.indikatorNama} Antar Kabupaten`}</CardTitle><CardDescription className="mt-1">{`${filters.bulan === 'tahunan' ? `Data tahunan untuk ${selectedYear}` : `Data untuk bulan ${Object.values(FULL_MONTH_NAMES).find(v => v[0] === filters.bulan)?.[1] || ''} ${selectedYear}`}${filters.tahunPembanding !== 'tidak' ? `, dibandingkan dengan ${filters.tahunPembanding}`: ''}`}</CardDescription></div>
                          <Button variant="ghost" size="icon" onClick={() => handleExportChart(barChartCardRef, 'perbandingan_wilayah')}><Camera className="h-4 w-4" /></Button>
                        </CardHeader>
                        <CardContent><BarChartWrapper data={barChart} onClick={handleBarClick} dataKey1={selectedYear.toString()} dataKey2={filters.tahunPembanding !== 'tidak' ? filters.tahunPembanding : undefined} isMobile={isMobile} /></CardContent>
                    </Card>
                </motion.div>

                <AnimatePresence>{filters.tahunPembanding === 'tidak' && (
                    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                        <Card ref={pieChartCardRef}>
                            <CardHeader className="flex flex-row items-center justify-between">
                              <div><CardTitle>Kontribusi {filters.indikatorNama}</CardTitle><CardDescription className="mt-1">{filters.bulan === 'tahunan' ? `Data tahunan untuk ${selectedYear}` : `Data untuk bulan ${Object.values(FULL_MONTH_NAMES).find(v => v[0] === filters.bulan)?.[1] || ''} ${selectedYear}`}</CardDescription></div>
                              <Button variant="ghost" size="icon" onClick={() => handleExportChart(pieChartCardRef, 'kontribusi_wilayah')}><Camera className="h-4 w-4" /></Button>
                            </CardHeader>
                            <CardContent className="pt-0">{(filters.level === 'kabupaten' && pieChart.length > 0) ? (<PieChartWrapper data={pieChart} isMobile={isMobile} />) : (<div className="flex items-center justify-center h-[300px] text-center text-sm text-muted-foreground"><p>Grafik kontribusi hanya tersedia<br/>untuk level Kabupaten/Kota.</p></div>)}</CardContent>
                        </Card>
                    </motion.div>
                )}</AnimatePresence>
            </div>

            <div className="grid md:grid-cols-1 gap-6">
              <Card ref={lineChartCardRef}>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2 flex-grow">
                    {selectedKabupaten && (<Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => setSelectedKabupaten(null)} aria-label="Kembali ke tampilan Provinsi"><ArrowBigLeftDash className="h-4 w-4" /></Button>)}
                    <div className="flex-grow"><CardTitle>Tren Waktu: {filters.indikatorNama}</CardTitle><CardDescription className="mt-1">{`${selectedKabupaten ? `Data untuk ${KABUPATEN_MAP[selectedKabupaten]}` : 'Data level Provinsi'}, tahun ${selectedYear}${filters.tahunPembanding !== 'tidak' ? ` vs ${filters.tahunPembanding}`: ''}`}</CardDescription></div>
                  </div>
                  <div className="flex items-center justify-end flex-shrink-0 gap-2">
                    <ToggleGroup type="single" variant="outline" size="sm" value={timeDataView} onValueChange={(value) => { if (value) setTimeDataView(value as TimeDataView); }} className="h-8"><ToggleGroupItem value="bulanan" aria-label="Tampilan Bulanan">Bulanan</ToggleGroupItem><ToggleGroupItem value="subround" aria-label="Tampilan Subround">Subround</ToggleGroupItem></ToggleGroup>
                    <Separator orientation="vertical" className="h-6"/>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setShowLineChartLabels(prev => !prev)} aria-label="Toggle Nilai"><Baseline className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleExportChart(lineChartCardRef, 'tren_waktu')}><Camera className="h-4 w-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent><LineChartWrapper data={lineChart} dataKey1={selectedYear.toString()} dataKey2={filters.tahunPembanding !== 'tidak' ? filters.tahunPembanding : undefined} onPointClick={handleChartClick} showLabels={showLineChartLabels} /></CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Data Rinci</CardTitle><CardDescription className="mt-1">Data mendetail berdasarkan filter yang Anda pilih.</CardDescription></div>
                <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !tableData || tableData.length === 0}><Download className="mr-2 h-4 w-4"/>Ekspor ke CSV</Button></div>
              </CardHeader>
              <CardContent><DataTable columns={tableColumns} data={tableData} isMobile={isMobile} showAllColumns={showAllTableColumns} onToggleColumns={() => setShowAllTableColumns(prev => !prev)}/></CardContent>
            </Card>
        </div>
      )}

      <AnnotationSheet isOpen={isAnnotationSheetOpen} onOpenChange={setIsAnnotationSheetOpen} annotations={selectedAnnotationPoint?.annotations || []} title={`Diskusi: ${filters.indikatorNama} - ${selectedAnnotationPoint?.name || ''} ${selectedYear}`} onSubmit={handleAnnotationSubmit} />
    </div>
  );
}