// src/app/(dashboard)/produksi-statistik/components/FilterSection.tsx
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FULL_MONTH_NAMES } from "@/lib/utils";

interface FilterState {
  bulan: string;
  indikatorNama: string;
  level: 'provinsi' | 'kabupaten';
  tahunPembanding: string;
}

interface FilterSectionProps {
  filters: FilterState;
  availableIndicators: { id: number; nama_resmi: string; satuan_default: string | null }[];
  selectedYear: number;
  onFilterChange: (key: keyof Omit<FilterState, 'idIndikator'>, value: string) => void;
  onIndicatorChange: (nama: string, id: number | null) => void;
}

const generateYears = (): string[] => {
  const years: string[] = [];
  for (let i = new Date().getFullYear() + 1; i >= 2020; i--) {
    years.push(i.toString());
  }
  return years;
};

export function FilterSection({
  filters,
  availableIndicators,
  selectedYear,
  onFilterChange,
  onIndicatorChange,
}: FilterSectionProps) {
  const handleIndicatorChange = (value: string) => {
    const selectedIndicator = availableIndicators.find(i => i.nama_resmi === value);
    onIndicatorChange(selectedIndicator?.nama_resmi || '', selectedIndicator?.id || null);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-blue-900/20 shadow-sm">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-emerald-400/10" />
      
      {/* Header with gradient */}
      <div className="relative border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-blue-900/30 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          Filter & Konfigurasi Data
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Sesuaikan parameter untuk melihat statistik yang diinginkan
        </p>
      </div>

      <div className="relative p-4">
        <div className="grid gap-4 mx-auto sm:grid-cols-2 lg:grid-cols-4">
          {/* Periode Bulan */}
          <div className="w-full">
            <Select value={filters.bulan} onValueChange={(v) => onFilterChange('bulan', v)}>
              <SelectTrigger id="filter-bulan" className="w-full h-10 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <SelectValue placeholder="Pilih periode bulan..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tahunan">Tahunan</SelectItem>
                <Separator className="my-1"/>
                {Object.values(FULL_MONTH_NAMES).map(([num, name]) => (
                  <SelectItem key={num} value={num}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Indikator */}
          <div className="w-full">
            <Select value={filters.indikatorNama} onValueChange={handleIndicatorChange}>
              <SelectTrigger id="filter-indikator" className="w-full h-10 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                <SelectValue placeholder="Pilih indikator..." />
              </SelectTrigger>
              <SelectContent>
                {availableIndicators.map(i => (
                  <SelectItem key={i.id} value={i.nama_resmi}>
                    <span className="truncate">{i.nama_resmi}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Level Wilayah */}
          <div className="w-full">
            <Select value={filters.level} onValueChange={(v) => onFilterChange('level', v as 'provinsi' | 'kabupaten')}>
              <SelectTrigger id="filter-level" className="w-full h-10 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <SelectValue placeholder="Pilih level wilayah..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="provinsi">Provinsi</SelectItem>
                <SelectItem value="kabupaten">Kabupaten/Kota</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Tahun Pembanding */}
          <div className="w-full">
            <Select value={filters.tahunPembanding} onValueChange={(v) => onFilterChange('tahunPembanding', v)}>
              <SelectTrigger id="filter-tahun-pembanding" className="w-full h-10 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
                <SelectValue placeholder="Bandingkan dengan tahun..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tidak">-Bandingkan dengan Tahun-</SelectItem>
                <Separator className="my-1"/>
                {generateYears().filter(y => y !== selectedYear.toString()).map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
