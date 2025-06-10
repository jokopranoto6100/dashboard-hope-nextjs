// Lokasi: src/app/(dashboard)/produksi-statistik/statistik-client.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
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
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Warehouse, Map, Download, ChevronsDownUp, Camera, PieChart, Bookmark, Trash2 } from "lucide-react";
import { unparse } from "papaparse";
import { saveAs } from "file-saver";
import { toPng } from 'html-to-image';
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { DataTable } from './data-table';
import { columns } from './columns';
import { toast } from "sonner";

// --- Impor komponen grafik secara dinamis ---
const BarChartWrapper = dynamic(() => import('./bar-chart-wrapper'), { ssr: false, loading: () => <Skeleton className="w-full h-[300px]" /> });
const LineChartWrapper = dynamic(() => import('./line-chart-wrapper'), { ssr: false, loading: () => <Skeleton className="w-full h-[300px]" /> });
const PieChartWrapper = dynamic(() => import('./pie-chart-wrapper'), { ssr: false, loading: () => <Skeleton className="w-full h-[300px]" /> });

// Tipe data dan konstanta
interface StatistikClientProps { availableIndicators: { id: number; nama_resmi: string; }[] }
type FilterState = { bulan: string; indikatorNama: string; level: 'provinsi' | 'kabupaten'; tahunPembanding: string; };
interface Preset { name: string; filters: FilterState; }
const KABUPATEN_MAP: { [key: string]: string } = { "6101": "Sambas", "6102": "Bengkayang", "6103": "Landak", "6104": "Mempawah", "6105": "Sanggau", "6106": "Ketapang", "6107": "Sintang", "6108": "Kapuas Hulu", "6109": "Sekadau", "6110": "Melawi", "6111": "Kayong Utara", "6112": "Kubu Raya", "6171": "Pontianak", "6172": "Singkawang" };
const MONTH_NAMES: { [key: string]: string } = { "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "Mei", "6": "Jun", "7": "Jul", "8": "Agu", "9": "Sep", "10": "Okt", "11": "Nov", "12": "Des" };
const FULL_MONTH_NAMES: { [key: string]: string[] } = { "1": ["1", "Januari"], "2": ["2", "Februari"], "3": ["3", "Maret"], "4": ["4", "April"], "5": ["5", "Mei"], "6": ["6", "Juni"], "7": ["7", "Juli"], "8": ["8", "Agustus"], "9": ["9", "September"], "10": ["10", "Oktober"], "11": ["11", "November"], "12": ["12", "Desember"] };
const formatNumber = (num: number) => (num === null || num === undefined) ? '0' : new Intl.NumberFormat('id-ID').format(num);

// Komponen untuk Dialog Simpan Preset
function SavePresetDialog({ onSave }: { onSave: (name: string) => void }) {
    const [name, setName] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        if (!name.trim()) {
            toast.error("Nama preset tidak boleh kosong.");
            return;
        }
        onSave(name.trim());
        setName('');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Bookmark className="mr-2 h-4 w-4" /> Simpan Tampilan</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Simpan Tampilan Filter</DialogTitle>
                    <DialogDescription>
                        Beri nama pada konfigurasi filter Anda saat ini untuk diakses kembali dengan cepat.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="preset-name" className="text-right">Nama</Label>
                        <Input id="preset-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="Contoh: Produksi Padi Tahunan" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function StatistikClient({ availableIndicators }: StatistikClientProps) {
  const router = useRouter();
  const { selectedYear } = useYear();
  const { supabase } = useAuth();

  const barChartCardRef = useRef<HTMLDivElement>(null);
  const lineChartCardRef = useRef<HTMLDivElement>(null);
  const pieChartCardRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterState>({
    bulan: 'tahunan',
    indikatorNama: availableIndicators[0]?.nama_resmi || '',
    level: 'kabupaten',
    tahunPembanding: 'tidak',
  });
  
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedKabupaten, setSelectedKabupaten] = useState<string | null>(null);
  
  const debouncedFilters = useDebounce(filters, 500);

  useEffect(() => {
    try {
        const savedPresets = localStorage.getItem('statistik-presets');
        if (savedPresets) {
            setPresets(JSON.parse(savedPresets));
        }
    } catch (error) {
        console.error("Gagal memuat preset dari localStorage", error);
    }
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setSelectedKabupaten(null);
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const { data, dataPembanding, isLoading } = useAtapStatistikData({
    ...debouncedFilters,
    tahunPembanding: debouncedFilters.tahunPembanding === 'tidak' ? null : parseInt(debouncedFilters.tahunPembanding)
  });

  const lineChartSWRKey = `monthly_trend_${selectedYear}_${debouncedFilters.indikatorNama}_${debouncedFilters.tahunPembanding}_${selectedKabupaten || 'prov'}`;
  const { data: lineChartRawData, isLoading: isLineChartLoading } = useSWR(
    debouncedFilters.indikatorNama && supabase ? lineChartSWRKey : null,
    async () => {
        const fetchMonthlyData = async (year: number) => {
            let query = supabase.from('laporan_atap_lengkap').select('bulan, nilai, kode_wilayah')
              .eq('tahun', year)
              .eq('indikator', filters.indikatorNama)
              .like('level_data', 'Bulanan%')
              .in('bulan', [1,2,3,4,5,6,7,8,9,10,11,12]);
            
            query = selectedKabupaten 
                ? query.eq('kode_wilayah', selectedKabupaten) 
                : query.eq('level_wilayah', 'provinsi');
            
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

  const processedData = useMemo(() => {
    const mainData = data || [];
    const compareData = dataPembanding || [];
    const barChartData = mainData.map(d => ({ name: KABUPATEN_MAP[d.kode_wilayah] || 'Provinsi', kode_wilayah: d.kode_wilayah, [selectedYear.toString()]: d.nilai, ...(compareData.find(p => p.kode_wilayah === d.kode_wilayah) && { [filters.tahunPembanding]: compareData.find(p => p.kode_wilayah === d.kode_wilayah)?.nilai }) })).sort((a, b) => (b[selectedYear.toString()] || 0) - (a[selectedYear.toString()] || 0));
    const lineChartData = Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => {
        const monthStr = monthNum.toString();
        const mainDataPoint = lineChartRawData?.mainData?.find(d => d.bulan?.toString() === monthStr);
        const compareDataPoint = lineChartRawData?.compareData?.find(d => d.bulan?.toString() === monthStr);
        return { name: MONTH_NAMES[monthStr], [selectedYear.toString()]: mainDataPoint?.nilai ?? null, ...(filters.tahunPembanding !== 'tidak' && { [filters.tahunPembanding]: compareDataPoint?.nilai ?? null }) };
    });
    const pieChartData = barChartData.map(d => ({ name: d.name, value: d[selectedYear.toString()] || 0, }));
    const totalNilai = mainData.reduce((sum, item) => sum + item.nilai, 0);
    const wilayahTertinggi = barChartData[0] || null;
    const wilayahTerendah = barChartData.length > 1 ? barChartData[barChartData.length - 1] : null;
    let percentageChange: number | null = null;
    if (filters.tahunPembanding !== 'tidak' && compareData.length > 0) {
        const totalNilaiPembanding = compareData.reduce((sum, item) => sum + item.nilai, 0);
        if (totalNilaiPembanding > 0) {
            percentageChange = ((totalNilai - totalNilaiPembanding) / totalNilaiPembanding) * 100;
        } else if (totalNilai > 0) {
            percentageChange = Infinity;
        }
    }
    return { kpi: { total: totalNilai, satuan: mainData[0]?.satuan || '', wilayahTertinggi, wilayahTerendah, jumlahWilayah: new Set(mainData.map(d => d.kode_wilayah)).size, percentageChange }, barChart: barChartData, lineChart: lineChartData, pieChart: pieChartData };
  }, [data, dataPembanding, lineChartRawData, selectedYear, filters.tahunPembanding, selectedKabupaten]);

  const handleBarClick = (payload: any) => {
    if (filters.level !== 'kabupaten') { toast.info("Drill-down hanya tersedia untuk level kabupaten."); return; }
    if (payload?.activePayload?.[0]?.payload?.kode_wilayah) {
        setSelectedKabupaten(prev => prev === payload.activePayload[0].payload.kode_wilayah ? null : payload.activePayload[0].payload.kode_wilayah);
    }
  };
  const handleExportChart = async (ref: React.RefObject<HTMLDivElement>, chartName: string) => {
    if (!ref.current) { toast.error("Grafik tidak dapat ditemukan."); return; }
    toast.info("Membuat gambar grafik...");
    try {
      const dataUrl = await toPng(ref.current, { cacheBust: true, backgroundColor: 'white', pixelRatio: 2 });
      saveAs(dataUrl, `grafik_${chartName}_${filters.indikatorNama}_${selectedYear}.png`);
      toast.success("Grafik berhasil diunduh!");
    } catch (err) {
      toast.error("Gagal mengekspor grafik.");
    }
  };
  const handleExport = () => {
    if(!data || data.length === 0) { toast.error("Tidak ada data untuk diekspor."); return; }
    const csv = unparse(data.map(d => ({ Indikator: d.indikator, Tahun: d.tahun, Bulan: d.bulan ? Object.values(FULL_MONTH_NAMES).find(v => v[0] === d.bulan!.toString())?.[1] : 'Tahunan', "Level Wilayah": d.level_wilayah, "Kode Wilayah": d.kode_wilayah, "Nama Wilayah": KABUPATEN_MAP[d.kode_wilayah] || 'Provinsi', Nilai: d.nilai, Satuan: d.satuan })));
    saveAs(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }), `statistik_${filters.indikatorNama}_${selectedYear}.csv`);
  };
  const generateYears = () => {
    const years = [];
    for (let i = new Date().getFullYear() + 1; i >= 2020; i--) years.push(i.toString());
    return years;
  };

  const handleSavePreset = (name: string) => {
    const newPreset = { name, filters };
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('statistik-presets', JSON.stringify(updatedPresets));
    toast.success(`Tampilan "${name}" berhasil disimpan.`);
  };
  const handleApplyPreset = (presetFilters: FilterState) => {
    setFilters(presetFilters);
    toast.info(`Tampilan preset diterapkan.`);
  };
  const handleDeletePreset = (presetName: string) => {
    const updatedPresets = presets.filter(p => p.name !== presetName);
    setPresets(updatedPresets);
    localStorage.setItem('statistik-presets', JSON.stringify(updatedPresets));
    toast.success(`Preset "${presetName}" dihapus.`);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Filter Data</h3>
            <SavePresetDialog onSave={handleSavePreset} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><Label htmlFor="filter-bulan">Periode Bulan</Label><Select value={filters.bulan} onValueChange={(v) => handleFilterChange('bulan', v)}><SelectTrigger id="filter-bulan"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tahunan">Tahunan</SelectItem><Separator className="my-1"/>{Object.values(FULL_MONTH_NAMES).map(([num, name]) => <SelectItem key={num} value={num}>{name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label htmlFor="filter-indikator">Indikator</Label><Select value={filters.indikatorNama} onValueChange={(v) => handleFilterChange('indikatorNama', v)}><SelectTrigger id="filter-indikator"><SelectValue /></SelectTrigger><SelectContent>{availableIndicators.map(i => <SelectItem key={i.id} value={i.nama_resmi}>{i.nama_resmi}</SelectItem>)}</SelectContent></Select></div>
          <div><Label htmlFor="filter-level">Level Wilayah</Label><Select value={filters.level} onValueChange={(v) => handleFilterChange('level', v as 'provinsi' | 'kabupaten')}><SelectTrigger id="filter-level"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="provinsi">Provinsi</SelectItem><SelectItem value="kabupaten">Kabupaten/Kota</SelectItem></SelectContent></Select></div>
          <div><Label htmlFor="filter-tahun-pembanding">Bandingkan Dengan Tahun</Label><Select value={filters.tahunPembanding} onValueChange={(v) => handleFilterChange('tahunPembanding', v)}><SelectTrigger id="filter-tahun-pembanding"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tidak">Tidak ada perbandingan</SelectItem><Separator className="my-1"/>{generateYears().filter(y => y !== selectedYear.toString()).map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select></div>
        </div>
        {presets.length > 0 && (<div><Label className="text-xs text-muted-foreground">Tampilan Tersimpan</Label><div className="flex flex-wrap gap-2 mt-2">{presets.map(preset => (<div key={preset.name} className="flex items-center"><Button variant="secondary" size="sm" onClick={() => handleApplyPreset(preset.filters)}>{preset.name}</Button><Button variant="ghost" size="icon" className="h-7 w-7 ml-1" onClick={() => handleDeletePreset(preset.name)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></Button></div>))}</div></div>)}
      </div>
      <Separator />
      {isLoading ? (
        <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
            <div className="grid md:grid-cols-2 gap-6"><Skeleton className="h-[350px]" /><Skeleton className="h-[350px]" /></div>
        </div>
      ) : (
        <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Nilai ({filters.level === 'provinsi' ? 'Provinsi' : 'Semua Kab'})</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(processedData.kpi.total)}</div>{processedData.kpi.percentageChange !== null && isFinite(processedData.kpi.percentageChange) && (<Badge variant={processedData.kpi.percentageChange >= 0 ? 'default' : 'destructive'} className="flex items-center gap-1 text-xs mt-1 w-fit">{processedData.kpi.percentageChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}<span>{processedData.kpi.percentageChange.toFixed(2)}% vs thn pembanding</span></Badge>)}<p className="text-xs text-muted-foreground mt-2">{processedData.kpi.satuan}</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Wilayah Tertinggi & Terendah</CardTitle><ChevronsDownUp className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent className="space-y-2"><div className="flex items-start justify-between"><div className="flex items-center gap-2"><div className="p-1.5 bg-emerald-100 dark:bg-emerald-900 rounded-md"><TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div><div><p className="text-xs text-muted-foreground">Tertinggi</p><p className="text-sm font-semibold">{processedData.kpi.wilayahTertinggi?.name || '-'}</p></div></div><p className="text-sm font-bold">{formatNumber(processedData.kpi.wilayahTertinggi?.[selectedYear.toString()] || 0)}</p></div>{processedData.kpi.wilayahTerendah && (<div className="flex items-start justify-between"><div className="flex items-center gap-2"><div className="p-1.5 bg-red-100 dark:bg-red-900 rounded-md"><TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" /></div><div><p className="text-xs text-muted-foreground">Terendah</p><p className="text-sm font-semibold">{processedData.kpi.wilayahTerendah?.name || '-'}</p></div></div><p className="text-sm font-bold">{formatNumber(processedData.kpi.wilayahTerendah?.[selectedYear.toString()] || 0)}</p></div>)}</CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Jumlah Wilayah</CardTitle><Map className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{processedData.kpi.jumlahWilayah}</div><p className="text-xs text-muted-foreground">Wilayah dengan data</p></CardContent></Card>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <Card ref={barChartCardRef} className="lg:col-span-2"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>{filters.level === 'provinsi' ? 'Data Provinsi' : 'Perbandingan Antar Kabupaten'}</CardTitle><CardDescription className="mt-1">{filters.bulan === 'tahunan' ? `Data tahunan untuk ${selectedYear}` : `Data untuk bulan ${Object.values(FULL_MONTH_NAMES).find(v => v[0] === filters.bulan)?.[1] || ''} ${selectedYear}`}</CardDescription></div><Button variant="ghost" size="icon" onClick={() => handleExportChart(barChartCardRef, 'perbandingan_wilayah')}><Camera className="h-4 w-4" /></Button></CardHeader><CardContent><BarChartWrapper data={processedData.barChart} onClick={handleBarClick} dataKey1={selectedYear.toString()} dataKey2={filters.tahunPembanding !== 'tidak' ? filters.tahunPembanding : undefined} /></CardContent></Card>
              <Card ref={pieChartCardRef}><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Kontribusi Wilayah</CardTitle><CardDescription className="mt-1">Persentase kontribusi per wilayah</CardDescription></div><Button variant="ghost" size="icon" onClick={() => handleExportChart(pieChartCardRef, 'kontribusi_wilayah')}><Camera className="h-4 w-4" /></Button></CardHeader><CardContent>{(filters.level === 'kabupaten' && processedData.pieChart.length > 0) ? (<PieChartWrapper data={processedData.pieChart} />) : (<div className="flex items-center justify-center h-[300px] text-center text-sm text-muted-foreground"><p>Grafik kontribusi hanya tersedia<br/>untuk level Kabupaten/Kota.</p></div>)}</CardContent></Card>
            </div>
            <div className="grid md:grid-cols-1 gap-6">
              <Card ref={lineChartCardRef}><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>{selectedKabupaten ? `Tren Waktu Bulanan: ${KABUPATEN_MAP[selectedKabupaten]}` : 'Tren Waktu Bulanan: Provinsi'}</CardTitle>{selectedKabupaten && <Button variant="link" size="sm" onClick={() => setSelectedKabupaten(null)} className="p-0 h-auto">Kembali ke tampilan Provinsi</Button>}</div><Button variant="ghost" size="icon" onClick={() => handleExportChart(lineChartCardRef, 'tren_waktu')}><Camera className="h-4 w-4" /></Button></CardHeader><CardContent>{isLineChartLoading ? <Skeleton className="w-full h-[300px]" /> : <LineChartWrapper data={processedData.lineChart} dataKey1={selectedYear.toString()} dataKey2={filters.tahunPembanding !== 'tidak' ? filters.tahunPembanding : undefined}/>}</CardContent></Card>
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Data Rinci</CardTitle><CardDescription className="mt-1">Data mendetail berdasarkan filter yang Anda pilih.</CardDescription></div>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !data || data.length === 0}><Download className="mr-2 h-4 w-4"/>Ekspor ke CSV</Button>
              </CardHeader>
              <CardContent>
                <DataTable columns={columns} data={data || []} />
              </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}