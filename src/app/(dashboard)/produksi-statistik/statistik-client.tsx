// Lokasi: src/app/(dashboard)/produksi-statistik/statistik-client.tsx
"use client";

import { useState, useMemo } from "react";
import { useYear } from "@/context/YearContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, Info, Table as TableIcon } from "lucide-react";

// Impor hook, komponen chart, dan komponen tabel baru kita
import { useAtapStatistikData } from "@/hooks/useAtapStatistikData";
import { AtapTimeSeriesChart, AtapComparisonChart } from "./atap-charts";
import { DataTable } from "./data-table";
import { getAtapColumns } from "./columns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Tipe untuk props yang diterima dari Server Component
interface StatistikClientProps {
  availableIndicators: {
    id: number;
    nama_resmi: string;
  }[];
}

// Tipe untuk state filter lokal
type FilterState = {
  bulan: string; // "tahunan" atau "1"-"12"
  indikatorId: string;
  level: 'provinsi' | 'kabupaten';
};

export function StatistikClient({ availableIndicators }: StatistikClientProps) {
  const { selectedYear } = useYear(); // Mengambil tahun dari context global

  const [filters, setFilters] = useState<FilterState>({
    bulan: 'tahunan',
    indikatorId: availableIndicators[0]?.id.toString() || '', // Default ke indikator pertama
    level: 'provinsi',
  });

  // Panggil custom hook dengan filter yang aktif
  const { data, loading, error } = useAtapStatistikData({
    tahun: selectedYear,
    ...filters
  });

  // Gunakan useMemo untuk membuat definisi kolom agar tidak dibuat ulang di setiap render
  const columns = useMemo(() => getAtapColumns(filters.level), [filters.level]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const selectedIndicatorName = availableIndicators.find(i => i.id.toString() === filters.indikatorId)?.nama_resmi || "Indikator";
  const selectedMonthName = filters.bulan !== 'tahunan' 
    ? new Date(0, parseInt(filters.bulan) - 1).toLocaleString('id-ID', { month: 'long' })
    : '';

  return (
    <div className="space-y-6">
      {/* Bagian Filter (tetap sama) */}
      <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
        <h3 className="text-lg font-semibold mb-4">Filter Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="filter-bulan">Periode Bulan</Label>
            <Select value={filters.bulan} onValueChange={(v) => handleFilterChange('bulan', v)}>
              <SelectTrigger id="filter-bulan"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tahunan">Tahunan</SelectItem>
                <Separator className="my-1"/>
                {[...Array(12)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-indikator">Indikator</Label>
            <Select value={filters.indikatorId} onValueChange={(v) => handleFilterChange('indikatorId', v)}>
              <SelectTrigger id="filter-indikator"><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableIndicators.map(indicator => (
                  <SelectItem key={indicator.id} value={indicator.id.toString()}>
                    {indicator.nama_resmi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-level">Level Wilayah</Label>
            <Select value={filters.level} onValueChange={(v) => handleFilterChange('level', v as 'provinsi' | 'kabupaten')}>
              <SelectTrigger id="filter-level"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="provinsi">Provinsi</SelectItem>
                <SelectItem value="kabupaten">Kabupaten/Kota</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Separator />

      {/* Bagian Visualisasi */}
      <div className="grid gap-6">
          <h2 className="text-xl font-bold">
            Analisis: {selectedIndicatorName} - {filters.bulan === 'tahunan' ? `Tahun ${selectedYear}` : `${selectedMonthName}, ${selectedYear}`}
          </h2>
          
          {loading && (
              <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="ml-2 text-muted-foreground">Memuat data...</p>
              </div>
          )}

          {error && (
              <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Gagal Memuat Data</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}

          {!loading && !error && data.length === 0 && (
              <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Tidak Ada Data</AlertTitle>
                  <AlertDescription>
                      Tidak ada data yang ditemukan untuk kombinasi filter yang Anda pilih.
                  </AlertDescription>
              </Alert>
          )}
          
          {!loading && !error && data.length > 0 && (
            <div className="space-y-6">
              {/* --- PERUBAHAN DI SINI: Dihapus lg:grid-cols-2 --- */}
              <div className="grid grid-cols-1 gap-6">
                  {/* Komponen chart akan memutuskan sendiri untuk tampil atau tidak */}
                  <AtapTimeSeriesChart data={data} level={filters.level} />
                  <AtapComparisonChart data={data} level={filters.level} />
              </div>
              
              {/* --- BAGIAN TABEL DATA RINCI --- */}
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center">
                          <TableIcon className="h-5 w-5 mr-2" />
                          Data Rinci
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <DataTable 
                        columns={columns} 
                        data={data}
                        filterColumn={filters.level === 'kabupaten' ? 'kode_kab' : undefined}
                        filterPlaceholder={filters.level === 'kabupaten' ? 'Filter berdasarkan nama kabupaten...' : undefined}
                      />
                  </CardContent>
              </Card>
            </div>
          )}
      </div>
    </div>
  );
}
