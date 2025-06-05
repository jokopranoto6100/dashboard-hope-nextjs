// src/app/(dashboard)/evaluasi/ubinan/descriptive-stats-columns.tsx
"use client";

import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table"; // Impor Table sebagai TanstackTable
import { DescriptiveStatsRow } from "@/hooks/useUbinanDescriptiveStatsData"; 

const formatNumber = (value: number | null | undefined, decimalPlaces: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return value.toFixed(decimalPlaces);
};

// Fungsi untuk mendapatkan unit dari meta tabel, sekarang hanya mengembalikan unitnya saja
const getUnit = (table: TanstackTable<DescriptiveStatsRow>): string => { // Perjelas tipe generic untuk table
  return table.options.meta?.currentUnit as string || 'kg/plot';
};

// Helper function untuk membuat header dua baris, menerima table untuk mendapatkan unit
const createTwoLineHeaderWithUnit = (line1: string) => {
  return ({ table }: { table: TanstackTable<DescriptiveStatsRow> }) => ( // Akses table dari context header
    <div className="text-center">
      <div>{line1}</div>
      <div className="text-xs font-normal text-muted-foreground">({getUnit(table)})</div> {/* Panggil getUnit di sini */}
    </div>
  );
};

export const columns: ColumnDef<DescriptiveStatsRow>[] = [
  {
    accessorKey: "namaKabupaten",
    header: () => <div className="text-center">Nama Kabupaten/Kota</div>,
    cell: ({ row }) => <div className="text-start">{row.original.namaKabupaten}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{kalbarData?.namaKabupaten || "Kalimantan Barat"}</div>;
    },
  },
  {
    accessorKey: "count",
    header: () => <div className="text-center">Jumlah Sampel</div>, // Unit tidak berlaku untuk count
    cell: ({ row }) => <div className="text-center">{row.original.count}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{kalbarData?.count ?? "-"}</div>;
    },
  },
  {
    accessorKey: "mean",
    header: createTwoLineHeaderWithUnit("Rata-rata (Mean)"), // Menggunakan helper baru
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.mean)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.mean)}</div>;
    },
  },
  {
    accessorKey: "median",
    header: createTwoLineHeaderWithUnit("Median"), // Menggunakan helper baru
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.median)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.median)}</div>;
    },
  },
  {
    accessorKey: "min",
    header: createTwoLineHeaderWithUnit("Min"), // Menggunakan helper baru
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.min)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.min)}</div>;
    },
  },
  {
    accessorKey: "max",
    header: createTwoLineHeaderWithUnit("Max"), // Menggunakan helper baru
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.max)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.max)}</div>;
    },
  },
  {
    accessorKey: "stdDev",
    header: createTwoLineHeaderWithUnit("Standar Deviasi"), // Menggunakan helper baru
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.stdDev)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.stdDev)}</div>;
    },
  },
  {
    accessorKey: "q1",
    header: createTwoLineHeaderWithUnit("Kuartil 1 (Q1)"), // Menggunakan helper baru
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.q1)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.q1)}</div>;
    },
  },
  {
    accessorKey: "q3",
    header: createTwoLineHeaderWithUnit("Kuartil 3 (Q3)"), // Menggunakan helper baru
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.q3)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.q3)}</div>;
    },
  },
];