// src/app/(dashboard)/evaluasi/ubinan/penggunaan-benih-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BenihRow } from "@/hooks/usePenggunaanBenihDanPupukData"; // Pastikan path ini benar

// Fungsi formatNumber bisa diletakkan di sini atau di-import dari utils jika sudah ada
const formatNumber = (value: number | null | undefined, decimalPlaces: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return value.toFixed(decimalPlaces);
};

export const benihColumns: ColumnDef<BenihRow>[] = [
  {
    accessorKey: "namaKabupaten",
    header: () => <div className="text-center">Nama Kabupaten/Kota</div>,
    cell: ({ row }) => <div className="text-start">{row.original.namaKabupaten}</div>, //
    footer: ({ table }) => {
        // Asumsi 'kalimantanBaratBenih' akan ada di table.options.meta
        const kalbarData = table.options.meta?.kalimantanBaratBenih as BenihRow | null;
        return <div className="text-center font-bold">{kalbarData?.namaKabupaten || "Kalimantan Barat"}</div>; //
    },
  },
  {
    accessorKey: "avgR604_m2",
    header: () => <div className="text-center">Rata-rata Luas Tanam (m²)</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgR604_m2, 0)}</div>, //
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratBenih as BenihRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgR604_m2, 0)}</div>; //
    },
  },
  {
    accessorKey: "avgBenihPerHa_kg_ha",
    header: () => <div className="text-center">Rata-rata Benih (Kg/Ha)</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgBenihPerHa_kg_ha)}</div>, //
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratBenih as BenihRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgBenihPerHa_kg_ha)}</div>; //
    },
  },
];