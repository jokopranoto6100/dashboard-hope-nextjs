/* eslint-disable @typescript-eslint/no-explicit-any */
// Lokasi: src/app/(dashboard)/produksi-statistik/statistik-client.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import dynamic from 'next/dynamic';
import { useYear } from "@/context/YearContext";
import { useAtapStatistikData } from "@/hooks/useAtapStatistikData";
import { useDebounce } from "@/hooks/useDebounce";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Map, Download, ChevronsDownUp, Camera, ArrowBigLeftDash, Baseline } from "lucide-react";
import { unparse } from "papaparse";
import { saveAs } from "file-saver";
import { toPng } from 'html-to-image';
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import { DataTable } from './data-table';
import { getColumns, AugmentedAtapDataPoint } from './columns';
import { AnnotationSheet } from './annotation-sheet';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion, AnimatePresence } from 'framer-motion';

const BarChartWrapper = dynamic(() => import('./bar-chart-wrapper'), { ssr: false, loading: () => <Skeleton className="w-full h-[300px]" /> });
const LineChartWrapper = dynamic(() => import('./line-chart-wrapper'), { ssr: false, loading: () => <Skeleton className="w-full h-[300px]" /> });
const PieChartWrapper = dynamic(() => import('./pie-chart-wrapper'), { ssr: false, loading: () => <Skeleton className="w-full h-[300px]" /> });

interface StatistikClientProps { availableIndicators: { id: number; nama_resmi: string; }[] }
type FilterState = { bulan: string; indikatorNama: string; idIndikator: number | null; level: 'provinsi' | 'kabupaten'; tahunPembanding: string; };
interface Annotation {
  id: number; created_at: string; user_id: string; komentar: string; id_indikator: number;
  tahun: number; bulan: number | null; kode_wilayah: string | null; user_fullname: string | null;
}

type TimeDataView = 'bulanan' | 'subround';

const KABUPATEN_MAP: { [key: string]: string } = { "6101": "Sambas", "6102": "Bengkayang", "6103": "Landak", "6104": "Mempawah", "6105": "Sanggau", "6106": "Ketapang", "6107": "Sintang", "6108": "Kapuas Hulu", "6109": "Sekadau", "6110": "Melawi", "6111": "Kayong Utara", "6112": "Kubu Raya", "6171": "Pontianak", "6172": "Singkawang" };
const MONTH_NAMES: { [key: string]: string } = { "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "Mei", "6": "Jun", "7": "Jul", "8": "Agu", "9": "Sep", "10": "Okt", "11": "Nov", "12": "Des" };
const FULL_MONTH_NAMES: { [key: string]: string[] } = { "1": ["1", "Januari"], "2": ["2", "Februari"], "3": ["3", "Maret"], "4": ["4", "April"], "5": ["5", "Mei"], "6": ["6", "Juni"], "7": ["7", "Juli"], "8": ["8", "Agustus"], "9": ["9", "September"], "10": ["10", "Oktober"], "11": ["11", "November"], "12": ["12", "Desember"] };
const formatNumber = (num: number) => (num === null || num === undefined) ? '0' : new Intl.NumberFormat('id-ID').format(num);

export function StatistikClient({ availableIndicators }: StatistikClientProps) {
  const { selectedYear } = useYear();
  const { supabase, user: authUser } = useAuth();

  const barChartCardRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const lineChartCardRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const pieChartCardRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

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

  const debouncedFilters = useDebounce(filters, 500);

  const handleFilterChange = (key: keyof Omit<FilterState, 'idIndikator'>, value: string) => {
    setSelectedKabupaten(null);
    setTimeDataView('bulanan'); 
    
    if (key === 'indikatorNama') {
        const selectedIndicator = availableIndicators.find(i => i.nama_resmi === value);
        setFilters(prev => ({ ...prev, indikatorNama: selectedIndicator?.nama_resmi || '', idIndikator: selectedIndicator?.id || null }));
    } else {
        setFilters(prev => ({ ...prev, [key]: value }));
    }
  };
  
  const { data, dataPembanding, isLoading } = useAtapStatistikData({ ...debouncedFilters, tahunPembanding: debouncedFilters.tahunPembanding === 'tidak' ? null : parseInt(debouncedFilters.tahunPembanding) });

  const lineChartSWRKey = `monthly_trend_${selectedYear}_${debouncedFilters.idIndikator}_${debouncedFilters.tahunPembanding}_${selectedKabupaten || 'prov'}`;
  const { data: lineChartRawData, isLoading: isLineChartLoading } = useSWR(
    debouncedFilters.idIndikator && supabase ? lineChartSWRKey : null,
    async () => {
        const fetchMonthlyData = async (year: number) => {
            let query = supabase.from('laporan_atap_lengkap').select('bulan, nilai, kode_wilayah')
              .eq('tahun', year)
              .eq('indikator', filters.indikatorNama)
              .like('level_data', 'Bulanan%')
              .in('bulan', [1,2,3,4,5,6,7,8,9,10,11,12]);
            
            query = selectedKabupaten ? query.eq('kode_wilayah', selectedKabupaten) : query.eq('level_wilayah', 'provinsi');
            
            const { data, error } = await query;
            if (error) throw error;
            return data;
        };
        const mainData = await fetchMonthlyData(selectedYear);
        let compareData: any[] = [];
        if (filters.tahunPembanding !== 'tidak') {
            compareData = await fetchMonthlyData(parseInt(filters.tahunPembanding));
        }
        return { mainData, compareData };
    }
  );

  const annotationsSWRKey = `annotations_${selectedYear}_${debouncedFilters.idIndikator}`;
  const { data: annotations, mutate: mutateAnnotations } = useSWR( debouncedFilters.idIndikator && supabase ? annotationsSWRKey : null, async () => {
    const { data, error } = await supabase.rpc('get_annotations_with_user_details', { p_id_indikator: debouncedFilters.idIndikator, p_tahun: selectedYear });
    if (error) { console.error("Gagal mengambil anotasi:", error); return []; }
    return data as Annotation[];
  });

  const processedData = useMemo(() => {
    const mainData = data || []; 
    const compareData = dataPembanding || []; 
    const totalNilai = mainData.reduce((sum: number, item: any) => sum + item.nilai, 0);
    const totalNilaiPembanding = compareData.reduce((sum: number, item: any) => sum + item.nilai, 0);
    
    const augmentedTableData: AugmentedAtapDataPoint[] = mainData.map((d: any) => { const nilaiTahunIni = d.nilai; const nilaiTahunLalu = compareData.find((p: any) => p.kode_wilayah === d.kode_wilayah)?.nilai; const kontribusi = totalNilai > 0 ? (nilaiTahunIni / totalNilai) * 100 : 0; let pertumbuhan: number | null = null; if (nilaiTahunLalu !== undefined && nilaiTahunLalu > 0) { pertumbuhan = ((nilaiTahunIni - nilaiTahunLalu) / nilaiTahunLalu) * 100; } else if (nilaiTahunLalu !== undefined && nilaiTahunIni > 0) { pertumbuhan = Infinity; } return { ...d, nama_wilayah: KABUPATEN_MAP[d.kode_wilayah] || 'Provinsi', kontribusi, nilaiTahunLalu, pertumbuhan }; }).sort((a: AugmentedAtapDataPoint, b: AugmentedAtapDataPoint) => b.nilai - a.nilai);
    const pieChartData = augmentedTableData.map(d => ({ name: d.nama_wilayah, value: d.nilai || 0 }));
    const barChartData = augmentedTableData.map(d => { 
      const barAnnotations = annotations?.filter(
        (a: Annotation) => a.kode_wilayah === d.kode_wilayah && (filters.bulan === 'tahunan' ? a.bulan === null : a.bulan === parseInt(filters.bulan))
      ) || []; 
      return { 
        name: d.nama_wilayah, 
        kode_wilayah: d.kode_wilayah, 
        nilai: d.nilai,
        [selectedYear.toString()]: d.nilai, 
        ...(d.nilaiTahunLalu && { [filters.tahunPembanding]: d.nilaiTahunLalu }), 
        annotations: barAnnotations 
      }; 
    });
    
    const monthlyLineChartData = Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => { 
      const monthStr = monthNum.toString(); 
      const mainDataPoint = lineChartRawData?.mainData?.find(d => d.bulan?.toString() === monthStr); 
      const compareDataPoint = lineChartRawData?.compareData?.find(d => d.bulan?.toString() === monthStr); 
      const monthAnnotations = annotations?.filter((a: Annotation) => a.bulan === monthNum && a.kode_wilayah === (selectedKabupaten ? selectedKabupaten : null)) || []; 
      return { name: MONTH_NAMES[monthStr], [selectedYear.toString()]: mainDataPoint?.nilai ?? null, ...(filters.tahunPembanding !== 'tidak' && { [filters.tahunPembanding]: compareDataPoint?.nilai ?? null }), annotations: monthAnnotations, kode_wilayah: selectedKabupaten }; 
    });

    const subroundTemplate: { name: string; main: number; compare: number; annotations: Annotation[] }[] = [ { name: 'Subround 1', main: 0, compare: 0, annotations: [] }, { name: 'Subround 2', main: 0, compare: 0, annotations: [] }, { name: 'Subround 3', main: 0, compare: 0, annotations: [] }, ];
    const subroundResult = JSON.parse(JSON.stringify(subroundTemplate));
    const aggregateData = (sourceData: any[], target: typeof subroundTemplate, key: 'main' | 'compare') => { sourceData.forEach(d => { if (!d.bulan) return; if (d.bulan <= 4) target[0][key] += d.nilai || 0; else if (d.bulan <= 8) target[1][key] += d.nilai || 0; else if (d.bulan <= 12) target[2][key] += d.nilai || 0; }); };
    aggregateData(lineChartRawData?.mainData || [], subroundResult, 'main');
    aggregateData(lineChartRawData?.compareData || [], subroundResult, 'compare');
    const subroundChartData = subroundResult.map((d: { name: string; main: number; compare: number; annotations: Annotation[] }) => ({ name: d.name, [selectedYear.toString()]: d.main, ...(filters.tahunPembanding !== 'tidak' && { [filters.tahunPembanding]: d.compare }), annotations: d.annotations }));

    const lineChartData = timeDataView === 'subround' ? subroundChartData : monthlyLineChartData;
    
    const wilayahTertinggi = barChartData[0] || null; const wilayahTerendah = barChartData.length > 1 ? barChartData[barChartData.length - 1] : null; let percentageChange: number | null = null; if (filters.tahunPembanding !== 'tidak' && totalNilaiPembanding > 0) { percentageChange = ((totalNilai - totalNilaiPembanding) / totalNilaiPembanding) * 100; } else if (totalNilai > 0) { percentageChange = Infinity; }
    
    return { kpi: { total: totalNilai, totalPembanding: totalNilaiPembanding, satuan: mainData[0]?.satuan || '', wilayahTertinggi, wilayahTerendah, jumlahWilayah: new Set(mainData.map((d: any) => d.kode_wilayah)).size, percentageChange }, barChart: barChartData, lineChart: lineChartData, pieChart: pieChartData, tableData: augmentedTableData };
  }, [data, dataPembanding, lineChartRawData, annotations, selectedYear, filters.bulan, filters.tahunPembanding, selectedKabupaten, timeDataView]);
  
  const tableColumns = useMemo(
    () => getColumns(selectedYear, filters.tahunPembanding, processedData.kpi.total, processedData.kpi.totalPembanding), 
    [selectedYear, filters.tahunPembanding, processedData.kpi.total, processedData.kpi.totalPembanding]
  );

  const handleChartClick = (payload: any) => { if (!payload) return; setSelectedAnnotationPoint(payload); setIsAnnotationSheetOpen(true); };
  
  const handleBarClick = (payload: any) => { if (!payload?.activePayload?.[0]?.payload) return; const clickedPayload = payload.activePayload[0].payload; if (filters.level === 'kabupaten' && clickedPayload.kode_wilayah) { setSelectedKabupaten(prev => prev === clickedPayload.kode_wilayah ? null : clickedPayload.kode_wilayah); return; } handleChartClick(clickedPayload); };

  const handleAnnotationSubmit = async (comment: string) => { if (!selectedAnnotationPoint || !filters.idIndikator) { toast.error("Gagal menyimpan: Titik data tidak valid."); return; } if (!authUser) { toast.error("Anda harus login untuk menambahkan komentar."); return; } const bulanAngka = parseInt(Object.keys(MONTH_NAMES).find(key => MONTH_NAMES[key] === selectedAnnotationPoint.name) || '0'); const newAnnotation = { user_id: authUser.id, komentar: comment, id_indikator: filters.idIndikator, tahun: selectedYear, bulan: bulanAngka > 0 ? bulanAngka : null, kode_wilayah: selectedAnnotationPoint.kode_wilayah || null }; const { error } = await supabase.from('fenomena_anotasi').insert(newAnnotation); if (error) { toast.error("Gagal menyimpan anotasi.", { description: error.message }); } else { toast.success("Anotasi berhasil ditambahkan!"); mutateAnnotations(); } };
  
  const handleExportChart = async (ref: React.RefObject<HTMLDivElement>, chartName: string) => { if (!ref.current) { toast.error("Grafik tidak dapat ditemukan."); return; } toast.info("Membuat gambar grafik..."); try { const dataUrl = await toPng(ref.current, { cacheBust: true, backgroundColor: 'white', pixelRatio: 2 }); saveAs(dataUrl, `grafik_${chartName}_${filters.indikatorNama}_${selectedYear}.png`); toast.success("Grafik berhasil diunduh!"); } catch (err) { toast.error("Gagal mengekspor grafik.", { description: (err as Error).message }); } };

  const handleExport = () => {
    if (!processedData.tableData || processedData.tableData.length === 0) {
      toast.error("Tidak ada data untuk diekspor.");
      return;
    }
    type ExportRow = {
      "Nama Wilayah": string;
      "Nilai (Thn Ini)": number;
      "Kontribusi (%)": string | undefined;
      "Nilai (Thn Lalu)"?: number | null | undefined;
      "Pertumbuhan (%)"?: string | undefined;
      Indikator: string;
      Tahun: number;
      Bulan: string;
      Satuan: string | null;
    };
    const dataToExport: ExportRow[] = processedData.tableData.map(d => ({
      "Nama Wilayah": d.nama_wilayah,
      "Nilai (Thn Ini)": d.nilai,
      "Kontribusi (%)": d.kontribusi?.toFixed(2),
      ...(filters.tahunPembanding !== 'tidak' && { "Nilai (Thn Lalu)": d.nilaiTahunLalu }),
      ...(filters.tahunPembanding !== 'tidak' && { "Pertumbuhan (%)": d.pertumbuhan?.toFixed(2) }),
      Indikator: d.indikator,
      Tahun: d.tahun,
      Bulan: d.bulan ? FULL_MONTH_NAMES[d.bulan.toString()][1] : 'Tahunan',
      Satuan: d.satuan,
    }));
    const columns = [
      "Nama Wilayah",
      "Nilai (Thn Ini)",
      "Kontribusi (%)",
      ...(filters.tahunPembanding !== 'tidak' ? ["Nilai (Thn Lalu)", "Pertumbuhan (%)"] : []),
      "Indikator",
      "Tahun",
      "Bulan",
      "Satuan"
    ] as const;
    const csv = unparse(dataToExport, { columns: columns as unknown as string[] });
    saveAs(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }), `data_rinci_${filters.indikatorNama}_${selectedYear}.csv`);
  };

  const generateYears = () => { const years = []; for (let i = new Date().getFullYear() + 1; i >= 2020; i--) years.push(i.toString()); return years; };

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-4">
        <div className="flex w-full flex-col items-end gap-4 sm:flex-row sm:justify-between">
          <div className="flex w-full flex-wrap items-center gap-4">
            <div>
                <Label htmlFor="filter-bulan" className="mb-1.5 block text-xs font-medium text-muted-foreground">Periode Bulan</Label>
                <Select value={filters.bulan} onValueChange={(v) => handleFilterChange('bulan', v)}><SelectTrigger id="filter-bulan"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tahunan">Tahunan</SelectItem><Separator className="my-1"/>{Object.values(FULL_MONTH_NAMES).map(([num, name]) => <SelectItem key={num} value={num}>{name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div>
                <Label htmlFor="filter-indikator" className="mb-1.5 block text-xs font-medium text-muted-foreground">Indikator</Label>
                <Select value={filters.indikatorNama} onValueChange={(v) => handleFilterChange('indikatorNama', v)}><SelectTrigger id="filter-indikator"><SelectValue /></SelectTrigger><SelectContent>{availableIndicators.map(i => <SelectItem key={i.id} value={i.nama_resmi}>{i.nama_resmi}</SelectItem>)}</SelectContent></Select>
            </div>
            <div>
                <Label htmlFor="filter-level" className="mb-1.5 block text-xs font-medium text-muted-foreground">Level Wilayah</Label>
                <Select value={filters.level} onValueChange={(v) => handleFilterChange('level', v as 'provinsi' | 'kabupaten')}><SelectTrigger id="filter-level"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="provinsi">Provinsi</SelectItem><SelectItem value="kabupaten">Kabupaten/Kota</SelectItem></SelectContent></Select>
            </div>
            <div>
                <Label htmlFor="filter-tahun-pembanding" className="mb-1.5 block text-xs font-medium text-muted-foreground">Bandingkan Dengan Tahun</Label>
                <Select value={filters.tahunPembanding} onValueChange={(v) => handleFilterChange('tahunPembanding', v)}><SelectTrigger id="filter-tahun-pembanding"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tidak">Tidak ada perbandingan</SelectItem><Separator className="my-1"/>{generateYears().filter(y => y !== selectedYear.toString()).map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {isLoading ? (
        <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
            <div className="grid lg:grid-cols-3 gap-6"><Skeleton className="h-[350px] lg:col-span-2" /><Skeleton className="h-[350px]" /></div>
            <Skeleton className="h-96" />
        </div>
      ) : (
        /* ======================================================================= */
        /* PERUBAHAN UTAMA DI SINI                                                 */
        /* Wrapper <div className="grid gap-6"> diubah menjadi <div className="space-y-6"> */
        /* ======================================================================= */
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Nilai ({filters.level === 'provinsi' ? 'Provinsi' : 'Semua Kab/Kota'})</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(processedData.kpi.total)}
                </div>
                {processedData.kpi.percentageChange !== null && isFinite(processedData.kpi.percentageChange) && (
                  <Badge variant={processedData.kpi.percentageChange >= 0 ? 'default' : 'destructive'} className="flex items-center gap-1 text-xs mt-1 w-fit">
                    {processedData.kpi.percentageChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{processedData.kpi.percentageChange.toFixed(2)}% vs thn pembanding</span>
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mt-2">{processedData.kpi.satuan}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Wilayah Tertinggi & Terendah</CardTitle>
                <ChevronsDownUp className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900 rounded-md flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Tertinggi</p>
                      <p className="text-sm font-semibold truncate" title={processedData.kpi.wilayahTertinggi?.name || ''}>
                        {processedData.kpi.wilayahTertinggi?.name || '-'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold flex-shrink-0 sm:pl-2">
                    {formatNumber(Number(processedData.kpi.wilayahTertinggi?.nilai || 0))}
                  </p>
                </div>
                {processedData.kpi.wilayahTerendah && (
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-red-100 dark:bg-red-900 rounded-md flex-shrink-0">
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Terendah</p>
                        <p className="text-sm font-semibold truncate" title={processedData.kpi.wilayahTerendah?.name || ''}>
                          {processedData.kpi.wilayahTerendah?.name || '-'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold flex-shrink-0 sm:pl-2">
                      {formatNumber(Number(processedData.kpi.wilayahTerendah?.nilai || 0))}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>     
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Jumlah Wilayah</CardTitle>
                <Map className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{processedData.kpi.jumlahWilayah}</div>
                <p className="text-xs text-muted-foreground">Wilayah dengan data</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div 
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={filters.tahunPembanding !== 'tidak' ? 'lg:col-span-3' : 'lg:col-span-2'}
            >
              <Card ref={barChartCardRef}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="min-w-0">
                    <CardTitle>{filters.level === 'provinsi' ? `Data ${filters.indikatorNama} Provinsi` : `Perbandingan ${filters.indikatorNama} Antar Kabupaten`}</CardTitle>
                    <CardDescription className="mt-1">{`${filters.bulan === 'tahunan' ? `Data tahunan untuk ${selectedYear}` : `Data untuk bulan ${Object.values(FULL_MONTH_NAMES).find(v => v[0] === filters.bulan)?.[1] || ''} ${selectedYear}`}${filters.tahunPembanding !== 'tidak' ? `, dibandingkan dengan ${filters.tahunPembanding}`: ''}`}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleExportChart(barChartCardRef, 'perbandingan_wilayah')}><Camera className="h-4 w-4" /></Button>
                </CardHeader>
                <CardContent>
                  <BarChartWrapper data={processedData.barChart} onClick={handleBarClick} dataKey1={selectedYear.toString()} dataKey2={filters.tahunPembanding !== 'tidak' ? filters.tahunPembanding : undefined} />
                </CardContent>
              </Card>
            </motion.div>

            <AnimatePresence>
              {filters.tahunPembanding === 'tidak' && (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Card ref={pieChartCardRef}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="min-w-0">
                        <CardTitle>Kontribusi {filters.indikatorNama}</CardTitle>
                        <CardDescription className="mt-1">
                          {filters.bulan === 'tahunan'
                            ? `Data tahunan untuk ${selectedYear}`
                            : `Data untuk bulan ${Object.values(FULL_MONTH_NAMES).find(v => v[0] === filters.bulan)?.[1] || ''} ${selectedYear}`
                          }
                        </CardDescription>                  
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleExportChart(pieChartCardRef, 'kontribusi_wilayah')}>
                        <Camera className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {(filters.level === 'kabupaten' && processedData.pieChart.length > 0) ? (
                        <PieChartWrapper data={processedData.pieChart} />
                      ) : (
                        <div className="flex items-center justify-center h-[300px] text-center text-sm text-muted-foreground">
                          <p>Grafik kontribusi hanya tersedia<br/>untuk level Kabupaten/Kota.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Card ref={lineChartCardRef}>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 flex-grow min-w-0">
                {selectedKabupaten && (<Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => setSelectedKabupaten(null)} aria-label="Kembali ke tampilan Provinsi"><ArrowBigLeftDash className="h-4 w-4" /></Button>)}
                <div className="flex-grow">
                  <CardTitle>Tren Waktu: {filters.indikatorNama}</CardTitle>
                  <CardDescription className="mt-1">{`${selectedKabupaten ? `Data untuk ${KABUPATEN_MAP[selectedKabupaten]}` : 'Data level Provinsi'}, tahun ${selectedYear}${filters.tahunPembanding !== 'tidak' ? ` vs ${filters.tahunPembanding}`: ''}`}</CardDescription>
                </div>
              </div>
              <div className="flex items-center justify-end flex-shrink-0 gap-2">
                <ToggleGroup type="single" variant="outline" size="sm" value={timeDataView} onValueChange={(value) => { if (value) setTimeDataView(value as TimeDataView); }} className="h-8">
                  <ToggleGroupItem value="bulanan" aria-label="Tampilan Bulanan">Bulanan</ToggleGroupItem>
                  <ToggleGroupItem value="subround" aria-label="Tampilan Subround">Subround</ToggleGroupItem>
                </ToggleGroup>
                <Separator orientation="vertical" className="h-6"/>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setShowLineChartLabels(prev => !prev)} aria-label="Toggle Nilai">
                  <Baseline className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleExportChart(lineChartCardRef, 'tren_waktu')}>
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLineChartLoading ? <Skeleton className="w-full h-[300px]" /> : <LineChartWrapper data={processedData.lineChart} dataKey1={selectedYear.toString()} dataKey2={filters.tahunPembanding !== 'tidak' ? filters.tahunPembanding : undefined} onPointClick={handleChartClick} showLabels={showLineChartLabels} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Data Rinci</CardTitle><CardDescription className="mt-1">Data mendetail berdasarkan filter yang Anda pilih.</CardDescription></div>
              <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !processedData.tableData || processedData.tableData.length === 0}><Download className="mr-2 h-4 w-4"/>Ekspor ke CSV</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <DataTable 
                  columns={tableColumns} 
                  data={processedData.tableData}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AnnotationSheet isOpen={isAnnotationSheetOpen} onOpenChange={setIsAnnotationSheetOpen} annotations={selectedAnnotationPoint?.annotations || []} title={`Diskusi: ${filters.indikatorNama} - ${selectedAnnotationPoint?.name || ''} ${selectedYear}`} onSubmit={handleAnnotationSubmit} />
    </div>
  );
}