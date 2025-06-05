// atau src/app/(dashboard)/evaluasi/ubinan/penggunaan-benih-dan-pupuk-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PupukDanBenihRow } from "@/hooks/usePenggunaanBenihDanPupukData";
import { ShieldAlert } from 'lucide-react';

const formatNumber = (value: number | null | undefined, decimalPlaces: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return value.toFixed(decimalPlaces);
};

const AMBANG_BATAS = {
  BENIH_KG_HA: 100, 
  UREA_KG_HA: 250,
  TSP_KG_HA: 250,
  KCL_KG_HA: 250,
  NPK_KG_HA: 250,
  ZA_KG_HA: 250,
  KOMPOS_KG_HA: 1000,
  ORGANIK_CAIR_LITER_HA: 20,
};

const createTwoLineHeader = (line1: string, line2: string) => {
  return () => (
    <div className="text-center">
      <div>{line1}</div>
      <div className="text-xs font-normal text-muted-foreground">{line2}</div>
    </div>
  );
};

// Helper untuk membuat kolom rata-rata (bisa untuk benih atau pupuk) dengan ikon badge
const createAvgColumnWithIcon = (
  accessorKey: keyof PupukDanBenihRow,
  headerText: string,
  unit: 'Kg/Ha' | 'Liter/Ha' | '(m²)', 
  ambangBatas?: number, 
  decimalPlacesRender: number = 1,
  isLuasTanam: boolean = false 
): ColumnDef<PupukDanBenihRow> => {
  return {
    accessorKey,
    header: createTwoLineHeader(headerText, unit === '(m²)' ? unit : `(${unit})`),
    cell: ({ row }) => {
      const nilaiAvg = row.original[accessorKey] as number | null;
      const displayDecimalPlaces = isLuasTanam ? 0 : decimalPlacesRender;
      return (
        <div className="text-center flex items-center justify-center">
          <span>{formatNumber(nilaiAvg, displayDecimalPlaces)}</span>
          {/* Tampilkan badge hanya jika ambangBatas didefinisikan dan terlampaui */}
          {ambangBatas !== undefined && nilaiAvg !== null && nilaiAvg > ambangBatas && (
            <ShieldAlert className="ml-2 h-4 w-4 text-destructive" />
          )}
        </div>
      );
    },
    footer: ({ table }) => {
      // Menggunakan `kalimantanBaratPupukDanBenih` dari meta
      const kalbarData = table.options.meta?.kalimantanBaratPupukDanBenih as PupukDanBenihRow | null;
      const nilaiAvg = kalbarData ? kalbarData[accessorKey] as number | null : null;
      const displayDecimalPlaces = isLuasTanam ? 0 : decimalPlacesRender;
      return (
        <div className="text-center flex items-center justify-center font-bold">
           <span>{formatNumber(nilaiAvg, displayDecimalPlaces)}</span>
           {ambangBatas !== undefined && nilaiAvg !== null && nilaiAvg > ambangBatas && (
            <ShieldAlert className="ml-2 h-4 w-4 text-destructive" />
           )}
        </div>
      );
    }
  };
};

// Ganti nama 'pupukColumns' menjadi sesuatu yang lebih generik jika file juga diganti nama
export const benihDanPupukColumns: ColumnDef<PupukDanBenihRow>[] = [
  {
    accessorKey: "namaKabupaten",
    header: () => <div className="text-center">Nama Kabupaten/Kota</div>,
    cell: ({ row }) => <div className="text-start">{row.original.namaKabupaten}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupukDanBenih as PupukDanBenihRow | null; // Update meta key
        return <div className="text-center font-bold">{kalbarData?.namaKabupaten || "Kalimantan Barat"}</div>;
    },
  },
  // Kolom Rata-rata Luas Tanam menggunakan helper baru
  createAvgColumnWithIcon('avgR604_m2', "Rata-rata Luas Tanam", "(m²)", undefined, 0, true),

  // Kolom Rata-rata Benih menggunakan helper baru
  createAvgColumnWithIcon('avgBenihPerHa_kg_ha', 'Rata-rata Benih', 'Kg/Ha', AMBANG_BATAS.BENIH_KG_HA, 1),
  
  // Kolom Rata-rata Pupuk menggunakan helper baru
  createAvgColumnWithIcon('avgUreaPerHa_kg_ha', 'Rata-rata Urea', 'Kg/Ha', AMBANG_BATAS.UREA_KG_HA),
  createAvgColumnWithIcon('avgTSPerHa_kg_ha', 'Rata-rata TSP/SP36', 'Kg/Ha', AMBANG_BATAS.TSP_KG_HA),
  createAvgColumnWithIcon('avgKCLperHa_kg_ha', 'Rata-rata KCL', 'Kg/Ha', AMBANG_BATAS.KCL_KG_HA),
  createAvgColumnWithIcon('avgNPKPerHa_kg_ha', 'Rata-rata NPK', 'Kg/Ha', AMBANG_BATAS.NPK_KG_HA),
  createAvgColumnWithIcon('avgKomposPerHa_kg_ha', 'Rata-rata Kompos', 'Kg/Ha', AMBANG_BATAS.KOMPOS_KG_HA, 0),
  createAvgColumnWithIcon('avgOrganikCairPerHa_liter_ha', 'Rata-rata Organik Cair', 'Liter/Ha', AMBANG_BATAS.ORGANIK_CAIR_LITER_HA),
  createAvgColumnWithIcon('avgZAPerHa_kg_ha', 'Rata-rata ZA', 'Kg/Ha', AMBANG_BATAS.ZA_KG_HA),
];