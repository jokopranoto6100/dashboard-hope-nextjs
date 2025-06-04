// src/app/(dashboard)/evaluasi/ubinan/descriptive-stats-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DescriptiveStatsRow } from "@/hooks/useUbinanDescriptiveStatsData"; 

const formatNumber = (value: number | null | undefined, decimalPlaces: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return value.toFixed(decimalPlaces);
};

// Fungsi untuk mendapatkan unit dari meta tabel
const getUnitSuffix = (table: any): string => {
  const unit = table.options.meta?.currentUnit as string || 'kg/plot';
  return `(${unit})`;
};

export const columns: ColumnDef<DescriptiveStatsRow>[] = [
  {
    accessorKey: "namaKabupaten",
    header: () => <div className="text-center">Nama Kabupaten/Kota</div>,
    cell: ({ row }) => <div className="text-start">{row.original.namaKabupaten}</div>,
    footer: ({ table }) => { /* ... (footer namaKabupaten tetap) ... */
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{kalbarData?.namaKabupaten || "Kalimantan Barat"}</div>;
    },
  },
  {
    accessorKey: "count",
    header: () => <div className="text-center">Jumlah Sampel</div>, // Unit tidak berlaku untuk count
    cell: ({ row }) => <div className="text-center">{row.original.count}</div>,
    footer: ({ table }) => { /* ... (footer count tetap) ... */
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{kalbarData?.count ?? "-"}</div>;
    },
  },
  {
    accessorKey: "mean",
    header: ({ table }) => <div className="text-center">Rata-rata (Mean) {getUnitSuffix(table)}</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.mean)}</div>,
    footer: ({ table }) => { /* ... (footer mean tetap, unit sudah di header) ... */
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.mean)}</div>;
    },
  },
  {
    accessorKey: "median",
    header: ({ table }) => <div className="text-center">Median {getUnitSuffix(table)}</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.median)}</div>,
    footer: ({ table }) => { /* ... (footer median tetap) ... */
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.median)}</div>;
    },
  },
  {
    accessorKey: "min",
    header: ({ table }) => <div className="text-center">Min {getUnitSuffix(table)}</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.min)}</div>,
    footer: ({ table }) => { /* ... (footer min tetap) ... */
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.min)}</div>;
    },
  },
  {
    accessorKey: "max",
    header: ({ table }) => <div className="text-center">Max {getUnitSuffix(table)}</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.max)}</div>,
    footer: ({ table }) => { /* ... (footer max tetap) ... */
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.max)}</div>;
    },
  },
  {
    accessorKey: "stdDev",
    header: ({ table }) => <div className="text-center">Standar Deviasi {getUnitSuffix(table)}</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.stdDev)}</div>,
    footer: ({ table }) => { /* ... (footer stdDev tetap) ... */
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.stdDev)}</div>;
    },
  },
  {
    accessorKey: "q1",
    header: ({ table }) => <div className="text-center">Kuartil 1 (Q1) {getUnitSuffix(table)}</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.q1)}</div>,
    footer: ({ table }) => { /* ... (footer q1 tetap) ... */
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.q1)}</div>;
    },
  },
  {
    accessorKey: "q3",
    header: ({ table }) => <div className="text-center">Kuartil 3 (Q3) {getUnitSuffix(table)}</div>,
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.q3)}</div>,
    footer: ({ table }) => { /* ... (footer q3 tetap) ... */
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.q3)}</div>;
    },
  },
];