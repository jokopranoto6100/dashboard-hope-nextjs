/* eslint-disable @typescript-eslint/no-explicit-any */
// Lokasi: src/app/(dashboard)/produksi-statistik/statistik-client.tsx
"use client";

import { useState, useMemo } from "react";
import dynamic from 'next/dynamic';
import { useYear } from "@/context/YearContext";
import { useAtapStatistikData } from "@/hooks/useAtapStatistikData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Warehouse, Map, Download } from "lucide-react";
import { unparse } from "papaparse";
import { saveAs } from "file-saver";
import useSWR from "swr";
import { createClientComponentSupabaseClient } from "@/lib/supabase";
import { DataTable } from './data-table';
import { columns } from './columns';

// --- Impor komponen grafik secara dinamis untuk mengatasi error Recharts ---
const BarChartWrapper = dynamic(
    () => import('./bar-chart-wrapper'),
    { 
        ssr: false, // Nonaktifkan Server-Side Rendering untuk komponen ini
        loading: () => <Skeleton className="w-full h-[300px]" /> 
    }
);

const LineChartWrapper = dynamic(
    () => import('./line-chart-wrapper'),
    { 
        ssr: false, // Nonaktifkan SSR
        loading: () => <Skeleton className="w-full h-[300px]" /> 
    }
);

// Tipe data yang diterima dari Server Component
interface StatistikClientProps {
  availableIndicators: {
    id: number;
    nama_resmi: string;
  }[];
}

// Tipe untuk state filter lokal
type FilterState = {
  bulan: string; // "tahunan" atau "1"-"12"
  indikatorNama: string;
  level: 'provinsi' | 'kabupaten';
  tahunPembanding: string; // "tidak" atau tahun
};

// Daftar konstanta untuk mapping
const KABUPATEN_MAP: { [key: string]: string } = { "6101": "Sambas", "6102": "Bengkayang", "6103": "Landak", "6104": "Mempawah", "6105": "Sanggau", "6106": "Ketapang", "6107": "Sintang", "6108": "Kapuas Hulu", "6109": "Sekadau", "6110": "Melawi", "6111": "Kayong Utara", "6112": "Kubu Raya", "6171": "Pontianak", "6172": "Singkawang" };
const MONTH_NAMES: { [key: string]: string } = { "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "Mei", "6": "Jun", "7": "Jul", "8": "Agu", "9": "Sep", "10": "Okt", "11": "Nov", "12": "Des" };
const FULL_MONTH_NAMES: { [key: string]: string[] } = { 
    "1": ["1", "Januari"], "2": ["2", "Februari"], "3": ["3", "Maret"], "4": ["4", "April"], 
    "5": ["5", "Mei"], "6": ["6", "Juni"], "7": ["7", "Juli"], "8": ["8", "Agustus"], 
    "9": ["9", "September"], "10": ["10", "Oktober"], "11": ["11", "November"], "12": ["12", "Desember"] 
};

// Fungsi untuk format angka besar
const formatNumber = (num: number) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
};

export function StatistikClient({ availableIndicators }: StatistikClientProps) {
  const { selectedYear } = useYear();

  const [filters, setFilters] = useState<FilterState>({
    bulan: 'tahunan',
    indikatorNama: availableIndicators[0]?.nama_resmi || '',
    level: 'kabupaten',
    tahunPembanding: 'tidak',
  });
  
  const [selectedKabupaten, setSelectedKabupaten] = useState<string | null>(null);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setSelectedKabupaten(null);
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Pengambilan data utama untuk KPI dan Bar Chart
  const { data, dataPembanding, isLoading } = useAtapStatistikData({
    ...filters,
    tahunPembanding: filters.tahunPembanding === 'tidak' ? null : parseInt(filters.tahunPembanding)
  });

  // Pengambilan data terpisah khusus untuk Line Chart (tren bulanan)
  const supabase = createClientComponentSupabaseClient();
  const lineChartSWRKey = `monthly_trend_${selectedYear}_${filters.indikatorNama}_${filters.tahunPembanding}_${selectedKabupaten || 'prov'}`;
  const { data: lineChartRawData, isLoading: isLineChartLoading } = useSWR(
    // Hanya fetch jika indikator sudah dipilih
    filters.indikatorNama ? lineChartSWRKey : null,
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

    const barChartData = mainData.map(d => ({
        name: KABUPATEN_MAP[d.kode_wilayah] || 'Provinsi',
        kode_wilayah: d.kode_wilayah,
        [selectedYear.toString()]: d.nilai,
        ...(compareData.find(p => p.kode_wilayah === d.kode_wilayah) && {
            [filters.tahunPembanding]: compareData.find(p => p.kode_wilayah === d.kode_wilayah)?.nilai
        })
    })).sort((a, b) => (b[selectedYear.toString()] || 0) - (a[selectedYear.toString()] || 0));
    
    const lineChartData = Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => {
        const monthStr = monthNum.toString();
        const mainDataPoint = lineChartRawData?.mainData?.find(d => d.bulan?.toString() === monthStr);
        const compareDataPoint = lineChartRawData?.compareData?.find(d => d.bulan?.toString() === monthStr);
        return {
            name: MONTH_NAMES[monthStr],
            [selectedYear]: mainDataPoint?.nilai ?? null,
            ...(filters.tahunPembanding !== 'tidak' && {
                [filters.tahunPembanding]: compareDataPoint?.nilai ?? null
            })
        };
    });

    const totalNilai = mainData.reduce((sum, item) => sum + item.nilai, 0);
    const wilayahTertinggi = barChartData[0] || null;

    return { 
        kpi: { total: totalNilai, satuan: mainData[0]?.satuan || '', wilayahTertinggi, jumlahWilayah: new Set(mainData.map(d => d.kode_wilayah)).size }, 
        barChart: barChartData, 
        lineChart: lineChartData
    };
  }, [data, dataPembanding, lineChartRawData, selectedYear, filters.tahunPembanding, selectedKabupaten]);

  const handleBarClick = (payload: any) => {
    if (filters.level !== 'kabupaten') { toast.info("Drill-down hanya tersedia untuk level kabupaten."); return; }
    if (payload?.activePayload?.[0]?.payload?.kode_wilayah) {
        const kodeWilayah = payload.activePayload[0].payload.kode_wilayah;
        setSelectedKabupaten(prev => prev === kodeWilayah ? null : kodeWilayah);
    }
  };

  const handleExport = () => {
    if(!data || data.length === 0) {
        toast.error("Tidak ada data untuk diekspor.");
        return;
    }
    const dataToExport = data.map(d => ({
        Indikator: d.indikator, Tahun: d.tahun, Bulan: d.bulan ? Object.values(FULL_MONTH_NAMES).find(v => v[0] === d.bulan!.toString())?.[1] : 'Tahunan',
        "Level Wilayah": d.level_wilayah, "Kode Wilayah": d.kode_wilayah, "Nama Wilayah": KABUPATEN_MAP[d.kode_wilayah] || 'Provinsi',
        Nilai: d.nilai, Satuan: d.satuan
    }));
    const csv = unparse(dataToExport);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `statistik_${filters.indikatorNama}_${selectedYear}.csv`);
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear + 1; i >= 2020; i--) years.push(i.toString());
    return years;
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="filter-bulan">Periode Bulan</Label>
            <Select value={filters.bulan} onValueChange={(v) => handleFilterChange('bulan', v)}>
              <SelectTrigger id="filter-bulan"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tahunan">Tahunan</SelectItem><Separator className="my-1"/>
                {Object.values(FULL_MONTH_NAMES).map(([num, name]) => <SelectItem key={num} value={num}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-indikator">Indikator</Label>
            <Select value={filters.indikatorNama} onValueChange={(v) => handleFilterChange('indikatorNama', v)}>
              <SelectTrigger id="filter-indikator"><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableIndicators.map(i => <SelectItem key={i.id} value={i.nama_resmi}>{i.nama_resmi}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-level">Level Wilayah</Label>
            <Select value={filters.level} onValueChange={(v) => handleFilterChange('level', v as 'provinsi' | 'kabupaten')}>
              <SelectTrigger id="filter-level"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="provinsi">Provinsi</SelectItem><SelectItem value="kabupaten">Kabupaten/Kota</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-tahun-pembanding">Bandingkan Dengan Tahun</Label>
            <Select value={filters.tahunPembanding} onValueChange={(v) => handleFilterChange('tahunPembanding', v)}>
              <SelectTrigger id="filter-tahun-pembanding"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tidak">Tidak ada perbandingan</SelectItem><Separator className="my-1"/>
                {generateYears().filter(y => y !== selectedYear.toString()).map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
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
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Nilai ({filters.level === 'provinsi' ? 'Provinsi' : 'Semua Kab'})</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(processedData.kpi.total)}</div><p className="text-xs text-muted-foreground">{processedData.kpi.satuan}</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Wilayah Tertinggi</CardTitle><Warehouse className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{processedData.kpi.wilayahTertinggi?.name || '-'}</div><p className="text-xs text-muted-foreground">Nilai: {formatNumber(processedData.kpi.wilayahTertinggi?.[selectedYear] || 0)}</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Jumlah Wilayah</CardTitle><Map className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{processedData.kpi.jumlahWilayah}</div><p className="text-xs text-muted-foreground">Wilayah dengan data</p></CardContent></Card>
            </div>
          
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{filters.level === 'provinsi' ? 'Data Provinsi' : 'Perbandingan Antar Kabupaten'}</CardTitle>
                  <CardDescription>
                    {filters.bulan === 'tahunan' ? `Data tahunan untuk ${selectedYear}` : `Data untuk bulan ${Object.values(FULL_MONTH_NAMES).find(v => v[0] === filters.bulan)?.[1] || ''} ${selectedYear}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <BarChartWrapper 
                        data={processedData.barChart}
                        onClick={handleBarClick}
                        dataKey1={selectedYear.toString()}
                        dataKey2={filters.tahunPembanding !== 'tidak' ? filters.tahunPembanding : undefined}
                    />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                    <CardTitle>{selectedKabupaten ? `Tren Waktu Bulanan: ${KABUPATEN_MAP[selectedKabupaten]}` : 'Tren Waktu Bulanan: Provinsi'}</CardTitle>
                    {selectedKabupaten && <Button variant="link" size="sm" onClick={() => setSelectedKabupaten(null)} className="p-0 h-auto">Kembali ke tampilan Provinsi</Button>}
                </CardHeader>
                <CardContent>
                    {isLineChartLoading ? <Skeleton className="w-full h-[300px]" /> : <LineChartWrapper data={processedData.lineChart} dataKey1={selectedYear.toString()} dataKey2={filters.tahunPembanding !== 'tidak' ? filters.tahunPembanding : undefined}/>}
                </CardContent>
              </Card>
            </div>

            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Data Rinci</CardTitle>
                    <CardDescription className="mt-1">
                    Data mendetail berdasarkan filter yang Anda pilih. Anda bisa melakukan sorting dan filtering pada tabel ini.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !data || data.length === 0}>
                <Download className="mr-2 h-4 w-4"/>
                Ekspor ke CSV
                </Button>
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