// src/app/(dashboard)/evaluasi/ubinan/penggunaan-pupuk-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PupukRow } from "@/hooks/usePenggunaanBenihDanPupukData"; // Pastikan path ini benar

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

export const pupukColumns: ColumnDef<PupukRow>[] = [
  {
    accessorKey: "namaKabupaten",
    header: () => <div className="text-center">Kabupaten/Kota</div>,
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
  {
    accessorKey: "avgUreaPerHa_kg_ha",
    header: createTwoLineHeader("Rata-rata Urea", "(Kg/Ha)"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgUreaPerHa_kg_ha)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgUreaPerHa_kg_ha)}</div>;
    },
  },
  {
    accessorKey: "avgTSPerHa_kg_ha",
    header: createTwoLineHeader("Rata-rata TSP/SP36", "(Kg/Ha)"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgTSPerHa_kg_ha)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgTSPerHa_kg_ha)}</div>;
    },
  },
  {
    accessorKey: "avgKCLperHa_kg_ha",
    header: createTwoLineHeader("Rata-rata KCL", "(Kg/Ha)"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgKCLperHa_kg_ha)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgKCLperHa_kg_ha)}</div>;
    },
  },
  {
    accessorKey: "avgNPKperHa_kg_ha",
    header: createTwoLineHeader("Rata-rata NPK", "(Kg/Ha)"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgNPKperHa_kg_ha)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgNPKperHa_kg_ha)}</div>;
    },
  },
  {
    accessorKey: "avgKomposPerHa_kg_ha",
    header: createTwoLineHeader("Rata-rata Kompos", "(Kg/Ha)"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgKomposPerHa_kg_ha)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgKomposPerHa_kg_ha)}</div>;
    },
  },
  {
    accessorKey: "avgOrganikCairPerHa_liter_ha",
    header: createTwoLineHeader("Rata-rata Organik Cair", "(Liter/Ha)"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgOrganikCairPerHa_liter_ha)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgOrganikCairPerHa_liter_ha)}</div>;
    },
  },
  {
    accessorKey: "avgZAPerHa_kg_ha",
    header: createTwoLineHeader("Rata-rata ZA", "(Kg/Ha)"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.avgZAPerHa_kg_ha)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratPupuk as PupukRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.avgZAPerHa_kg_ha)}</div>;
    },
  },
];