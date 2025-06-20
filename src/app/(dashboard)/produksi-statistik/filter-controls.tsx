// Lokasi: src/app/(dashboard)/produksi-statistik/filter-controls.tsx
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Tipe data untuk props
interface FilterControlsProps {
  filters: {
    bulan: string;
    indikatorNama: string;
    level: 'provinsi' | 'kabupaten';
    tahunPembanding: string;
  };
  availableIndicators: { id: number; nama_resmi: string; }[];
  selectedYear: number;
  onFilterChange: (key: keyof FilterControlsProps['filters'], value: string | 'provinsi' | 'kabupaten') => void;
}

// Fungsi untuk membuat daftar tahun
const generateYears = (currentYear: number) => {
    const years = [];
    for (let i = new Date().getFullYear() + 1; i >= 2020; i--) {
        if (i !== currentYear) {
            years.push(i.toString());
        }
    }
    return years;
};

// Konstanta untuk nama bulan
const FULL_MONTH_NAMES: { [key: string]: string[] } = {
    "1": ["1", "Januari"], "2": ["2", "Februari"], "3": ["3", "Maret"],
    "4": ["4", "April"], "5": ["5", "Mei"], "6": ["6", "Juni"],
    "7": ["7", "Juli"], "8": ["8", "Agustus"], "9": ["9", "September"],
    "10": ["10", "Oktober"], "11": ["11", "November"], "12": ["12", "Desember"]
};

export function FilterControls({ filters, availableIndicators, selectedYear, onFilterChange }: FilterControlsProps) {
  return (
    <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-4">
      <div className="flex w-full flex-col items-end gap-4 sm:flex-row sm:justify-between">
        <div className="flex w-full flex-wrap items-center gap-4">
          <div>
            <Label htmlFor="filter-bulan" className="mb-1.5 block text-xs font-medium text-muted-foreground">Periode Bulan</Label>
            <Select value={filters.bulan} onValueChange={(v) => onFilterChange('bulan', v)}>
              <SelectTrigger id="filter-bulan"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tahunan">Tahunan</SelectItem>
                <Separator className="my-1"/>
                {Object.values(FULL_MONTH_NAMES).map(([num, name]) => <SelectItem key={num} value={num}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-indikator" className="mb-1.5 block text-xs font-medium text-muted-foreground">Indikator</Label>
            <Select value={filters.indikatorNama} onValueChange={(v) => onFilterChange('indikatorNama', v)}>
              <SelectTrigger id="filter-indikator"><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableIndicators.map(i => <SelectItem key={i.id} value={i.nama_resmi}>{i.nama_resmi}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-level" className="mb-1.5 block text-xs font-medium text-muted-foreground">Level Wilayah</Label>
            <Select value={filters.level} onValueChange={(v) => onFilterChange('level', v)}>
              <SelectTrigger id="filter-level"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="provinsi">Provinsi</SelectItem>
                <SelectItem value="kabupaten">Kabupaten/Kota</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-tahun-pembanding" className="mb-1.5 block text-xs font-medium text-muted-foreground">Bandingkan Dengan Tahun</Label>
            <Select value={filters.tahunPembanding} onValueChange={(v) => onFilterChange('tahunPembanding', v)}>
              <SelectTrigger id="filter-tahun-pembanding"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tidak">Tidak ada perbandingan</SelectItem>
                <Separator className="my-1"/>
                {generateYears(selectedYear).map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}