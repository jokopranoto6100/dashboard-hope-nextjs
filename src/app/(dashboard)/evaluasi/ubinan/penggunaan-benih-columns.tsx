// src/app/(dashboard)/evaluasi/ubinan/penggunaan-benih-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BenihRow } from "@/hooks/usePenggunaanBenihDanPupukData";
import { ShieldAlert } from 'lucide-react'; // Impor ikon

const formatNumber = (value: number | null | undefined, decimalPlaces: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return value.toFixed(decimalPlaces);
};

// Ambil ambang batas dari konstanta yang sama jika memungkinkan (atau definisikan ulang di sini)
const AMBANG_BATAS = {
  BENIH_KG_HA: 100, // Sesuaikan jika ambang batas untuk rata-rata berbeda
  // ... (tidak perlu ambang batas pupuk di file ini)
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

export const benihColumns: ColumnDef<BenihRow>[] = [
  {
    accessorKey: "namaKabupaten",
    header: () => <div className="text-center">Nama Kabupaten/Kota</div>,
    cell: ({ row }) => <div className="text-start">{row.original.namaKabupaten}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratBenih as BenihRow | null;
        return <div className="text-center font-bold">{kalbarData?.namaKabupaten || "Kalimantan Barat"}</div>;
    },
  },
  {
    accessorKey: "avgR604_m2",
    header: createTwoLineHeader("Rata-rata Luas Tanam", "(m²)"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgR604_m2, 0)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratBenih as BenihRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgR604_m2, 0)}</div>;
    },
  },
  {
    accessorKey: "avgBenihPerHa_kg_ha",
    header: createTwoLineHeader("Rata-rata Benih", "(Kg/Ha)"),
    cell: ({ row }) => {
      const nilaiAvgPerHa = row.original.avgBenihPerHa_kg_ha;
      return (
        <div className="text-center flex items-center justify-center">
          <span>{formatNumber(nilaiAvgPerHa, 1)}</span>
          {nilaiAvgPerHa != null && nilaiAvgPerHa > AMBANG_BATAS.BENIH_KG_HA && (
              <ShieldAlert className="ml-2 h-4 w-4 text-destructive" />
          )}
        </div>
      );
    },
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratBenih as BenihRow | null;
        const nilaiAvgPerHa = kalbarData?.avgBenihPerHa_kg_ha;
        return (
          <div className="text-center flex items-center justify-center font-bold">
            <span>{formatNumber(nilaiAvgPerHa,1)}</span>
            {nilaiAvgPerHa != null && nilaiAvgPerHa > AMBANG_BATAS.BENIH_KG_HA && (
                <ShieldAlert className="ml-2 h-4 w-4 text-destructive" />
            )}
          </div>
        );
    },
  },
];