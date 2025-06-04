// src/app/(dashboard)/evaluasi/ubinan/penggunaan-pupuk-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PupukRow } from "@/hooks/usePenggunaanBenihDanPupukData"; // Pastikan path ini benar

// Fungsi formatNumber bisa diletakkan di sini atau di-import dari utils jika sudah ada
const formatNumber = (value: number | null | undefined, decimalPlaces: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return value.toFixed(decimalPlaces);
};

export const pupukColumns: ColumnDef<PupukRow>[] = [
  {
    accessorKey: "namaKabupaten",
    header: () => <div className="text-center">Nama Kabupaten/Kota</div>,
    cell: ({ row }) => <div className="text-start">{row.original.namaKabupaten}</div>, //
    footer: ({ table }) => {
        // Asumsi 'kalimantanBaratPupuk' akan ada di table.options.meta
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{kalbarData?.namaKabupaten || "Kalimantan Barat"}</div>; //
    },
  },
  {
    accessorKey: "avgR604_m2",
    header: () => <div className="text-center">Rata-rata Luas Tanam (m²)</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgR604_m2, 0)}</div>, //
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgR604_m2, 0)}</div>; //
    },
  },
  {
    accessorKey: "avgUreaPerHa_kg_ha",
    header: () => <div className="text-center">Rata-rata Urea (Kg/Ha)</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgUreaPerHa_kg_ha)}</div>, //
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgUreaPerHa_kg_ha)}</div>; //
    },
  },
  {
    accessorKey: "avgTSPerHa_kg_ha",
    header: () => <div className="text-center">Rata-rata TSP/SP36 (Kg/Ha)</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgTSPerHa_kg_ha)}</div>, //
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgTSPerHa_kg_ha)}</div>; //
    },
  },
  {
    accessorKey: "avgKCLperHa_kg_ha",
    header: () => <div className="text-center">Rata-rata KCL (Kg/Ha)</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgKCLperHa_kg_ha)}</div>, //
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgKCLperHa_kg_ha)}</div>; //
    },
  },
  {
    accessorKey: "avgNPKperHa_kg_ha",
    header: () => <div className="text-center">Rata-rata NPK (Kg/Ha)</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgNPKperHa_kg_ha)}</div>, //
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgNPKperHa_kg_ha)}</div>; //
    },
  },
  {
    accessorKey: "avgKomposPerHa_kg_ha",
    header: () => <div className="text-center">Rata-rata Kompos (Kg/Ha)</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgKomposPerHa_kg_ha)}</div>, //
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgKomposPerHa_kg_ha)}</div>; //
    },
  },
  {
    accessorKey: "avgOrganikCairPerHa_liter_ha",
    header: () => <div className="text-center">Rata-rata Organik Cair (Liter/Ha)</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgOrganikCairPerHa_liter_ha)}</div>, //
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgOrganikCairPerHa_liter_ha)}</div>; //
    },
  },
  {
    accessorKey: "avgZAPerHa_kg_ha",
    header: () => <div className="text-center">Rata-rata ZA (Kg/Ha)</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgZAPerHa_kg_ha)}</div>, //
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgZAPerHa_kg_ha)}</div>; //
    },
  },
];