// src/app/(dashboard)/evaluasi/ubinan/penggunaan-pupuk-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PupukRow } from "@/hooks/usePenggunaanBenihDanPupukData";
import { ShieldAlert } from 'lucide-react'; // Impor ikon

const formatNumber = (value: number | null | undefined, decimalPlaces: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return value.toFixed(decimalPlaces);
};

// Definisikan ulang atau impor konstanta AMBANG_BATAS
const AMBANG_BATAS = {
  UREA_KG_HA: 300,
  TSP_KG_HA: 300,
  KCL_KG_HA: 300,
  NPK_KG_HA: 300,
  ZA_KG_HA: 300,
  KOMPOS_KG_HA: 1000,
  ORGANIK_CAIR_LITER_HA: 20,
};

// Helper untuk header dua baris (jika belum ada atau ingin dipusatkan)
const createTwoLineHeader = (line1: string, line2: string) => {
  return () => (
    <div className="text-center">
      <div>{line1}</div>
      <div className="text-xs font-normal text-muted-foreground">{line2}</div>
    </div>
  );
};

// Helper untuk membuat kolom rata-rata pupuk dengan ikon badge
const createAvgPupukColumnWithIcon = (
  accessorKey: keyof PupukRow,
  headerText: string,
  unit: 'Kg/Ha' | 'Liter/Ha',
  ambangBatasPerHa: number,
  decimalPlacesRender: number = 1
): ColumnDef<PupukRow> => {
  return {
    accessorKey,
    header: createTwoLineHeader(headerText, `(${unit})`),
    cell: ({ row }) => {
      const nilaiAvgPerHa = row.original[accessorKey] as number | null;
      return (
        <div className="text-center flex items-center justify-center">
          <span>{formatNumber(nilaiAvgPerHa, decimalPlacesRender)}</span>
          {nilaiAvgPerHa !== null && nilaiAvgPerHa > ambangBatasPerHa && (
            <ShieldAlert className="ml-2 h-4 w-4 text-destructive" />
          )}
        </div>
      );
    },
    footer: ({ table }) => {
      const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
      const nilaiAvgPerHa = kalbarData ? kalbarData[accessorKey] as number | null : null;
      return (
        <div className="text-center flex items-center justify-center font-bold">
           <span>{formatNumber(nilaiAvgPerHa, decimalPlacesRender)}</span>
           {nilaiAvgPerHa !== null && nilaiAvgPerHa > ambangBatasPerHa && (
            <ShieldAlert className="ml-2 h-4 w-4 text-destructive" />
           )}
        </div>
      );
    }
  };
};

export const pupukColumns: ColumnDef<PupukRow>[] = [
  {
    accessorKey: "namaKabupaten",
    header: () => <div className="text-center">Nama Kabupaten/Kota</div>,
    cell: ({ row }) => <div className="text-start">{row.original.namaKabupaten}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{kalbarData?.namaKabupaten || "Kalimantan Barat"}</div>;
    },
  },
  {
    accessorKey: "avgR604_m2",
    header: createTwoLineHeader("Rata-rata Luas Tanam", "(m²)"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgR604_m2, 0)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgR604_m2, 0)}</div>;
    },
  },
  createAvgPupukColumnWithIcon('avgUreaPerHa_kg_ha', 'Rata-rata Urea', 'Kg/Ha', AMBANG_BATAS.UREA_KG_HA),
  createAvgPupukColumnWithIcon('avgTSPerHa_kg_ha', 'Rata-rata TSP/SP36', 'Kg/Ha', AMBANG_BATAS.TSP_KG_HA),
  createAvgPupukColumnWithIcon('avgKCLperHa_kg_ha', 'Rata-rata KCL', 'Kg/Ha', AMBANG_BATAS.KCL_KG_HA),
  createAvgPupukColumnWithIcon('avgNPKperHa_kg_ha', 'Rata-rata NPK', 'Kg/Ha', AMBANG_BATAS.NPK_KG_HA),
  createAvgPupukColumnWithIcon('avgKomposPerHa_kg_ha', 'Rata-rata Kompos', 'Kg/Ha', AMBANG_BATAS.KOMPOS_KG_HA, 0),
  createAvgPupukColumnWithIcon('avgOrganikCairPerHa_liter_ha', 'Rata-rata Organik Cair', 'Liter/Ha', AMBANG_BATAS.ORGANIK_CAIR_LITER_HA),
  createAvgPupukColumnWithIcon('avgZAPerHa_kg_ha', 'Rata-rata ZA', 'Kg/Ha', AMBANG_BATAS.ZA_KG_HA),
];