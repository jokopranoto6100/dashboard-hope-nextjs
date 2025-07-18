// src/app/(dashboard)/produksi-statistik/components/FilterSection.tsx
"use client";

import { Label } from "@/components/ui/label";
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
    <div className="p-3 sm:p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <div className="grid max-w-5xl grid-cols-1 gap-3 mx-auto sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 lg:items-end">
        <div className="w-full">
          <Label htmlFor="filter-bulan" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Periode Bulan
          </Label>
          <Select value={filters.bulan} onValueChange={(v) => onFilterChange('bulan', v)}>
            <SelectTrigger id="filter-bulan" className="w-full h-9 sm:h-10">
              <SelectValue />
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
        
        <div className="w-full">
          <Label htmlFor="filter-indikator" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Indikator
          </Label>
          <Select value={filters.indikatorNama} onValueChange={handleIndicatorChange}>
            <SelectTrigger id="filter-indikator" className="w-full h-9 sm:h-10">
              <SelectValue />
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
        
        <div className="w-full">
          <Label htmlFor="filter-level" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Level Wilayah
          </Label>
          <Select value={filters.level} onValueChange={(v) => onFilterChange('level', v as 'provinsi' | 'kabupaten')}>
            <SelectTrigger id="filter-level" className="w-full h-9 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="provinsi">Provinsi</SelectItem>
              <SelectItem value="kabupaten">Kabupaten/Kota</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full">
          <Label htmlFor="filter-tahun-pembanding" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Bandingkan Dengan Tahun
          </Label>
          <Select value={filters.tahunPembanding} onValueChange={(v) => onFilterChange('tahunPembanding', v)}>
            <SelectTrigger id="filter-tahun-pembanding" className="w-full h-9 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tidak">Tidak ada perbandingan</SelectItem>
              <Separator className="my-1"/>
              {generateYears().filter(y => y !== selectedYear.toString()).map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
