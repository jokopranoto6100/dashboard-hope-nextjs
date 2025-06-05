// src/app/(dashboard)/evaluasi/ubinan/penggunaan-benih-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BenihRow } from "@/hooks/usePenggunaanBenihDanPupukData"; // Pastikan path ini benar

const formatNumber = (value: number | null | undefined, decimalPlaces: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return value.toFixed(decimalPlaces);
};

// Helper function untuk membuat header dua baris
const createTwoLineHeader = (line1: string, line2: string) => {
  return () => (
    <div className="text-center">
      <div>{line1}</div>
      <div className="text-xs font-normal text-muted-foreground">{line2}</div> {/* Styling sederhana untuk baris kedua */}
    </div>
  );
};

export const benihColumns: ColumnDef<BenihRow>[] = [
  {
    accessorKey: "namaKabupaten",
    header: () => <div className="text-center">Kabupaten/Kota</div>,
    cell: ({ row }) => <div className="text-start">{row.original.namaKabupaten}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratBenih as BenihRow | null;
        return <div className="text-center font-bold">{kalbarData?.namaKabupaten || "Kalimantan Barat"}</div>;
    },
  },
  {
    accessorKey: "avgR604_m2",
    header: createTwoLineHeader("Rata-rata Luas Tanam", "(m²)"), // Menggunakan helper
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgR604_m2, 0)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratBenih as BenihRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgR604_m2, 0)}</div>;
    },
  },
  {
    accessorKey: "avgBenihPerHa_kg_ha",
    header: createTwoLineHeader("Rata-rata Benih", "(Kg/Ha)"), // Menggunakan helper
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgBenihPerHa_kg_ha)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratBenih as BenihRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgBenihPerHa_kg_ha)}</div>;
    },
  },
];