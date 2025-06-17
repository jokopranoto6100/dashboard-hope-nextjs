// src/app/(dashboard)/evaluasi/ubinan/descriptive-stats-columns.tsx
"use client";

import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";
import { DescriptiveStatsRow } from "@/hooks/useUbinanDescriptiveStatsData"; 
import { ShieldAlert } from 'lucide-react';

const AMBANG_BATAS = {
  KG_PER_PLOT: 5,
  KU_PER_HA: 80, 
};

const formatNumber = (value: number | null | undefined, decimalPlaces: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return value.toFixed(decimalPlaces);
};

const getUnit = (table: TanstackTable<DescriptiveStatsRow>): string => {
  return table.options.meta?.currentUnit as string || 'kg/plot';
};

const getSelectedKomoditas = (table: TanstackTable<DescriptiveStatsRow>): string | null => {
    return table.options.meta?.selectedKomoditas as string | null;
};

const createTwoLineHeaderWithUnit = (line1: string) => {
  return ({ table }: { table: TanstackTable<DescriptiveStatsRow> }) => (
    <div className="text-center">
      <div>{line1}</div>
      <div className="text-xs font-normal text-muted-foreground">({getUnit(table)})</div>
    </div>
  );
};

export const columns: ColumnDef<DescriptiveStatsRow>[] = [
  // ... (kolom namaKabupaten dan count tetap sama) ...
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
    header: () => <div className="text-center">Jumlah Sampel</div>,
    cell: ({ row }) => <div className="text-center">{row.original.count}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{kalbarData?.count ?? "-"}</div>;
    },
  },
  
  // --- DIUBAH: Modifikasi kondisi pengecekan komoditas pada kolom 'mean' ---
  {
    accessorKey: "mean",
    header: createTwoLineHeaderWithUnit("Rata-rata (Mean)"),
    cell: ({ row, table }) => {
      const meanValue = row.original.mean;
      const komoditas = getSelectedKomoditas(table);
      let melebihiAmbang = false;

      // Logika anomali hanya berjalan jika komoditas adalah salah satu dari jenis padi
      if (komoditas === '1 - Padi Sawah' || komoditas === '3 - Padi Ladang') {
        const unit = getUnit(table);
        const ambangBatas = unit === 'ku/ha' ? AMBANG_BATAS.KU_PER_HA : AMBANG_BATAS.KG_PER_PLOT;
        melebihiAmbang = meanValue !== null && meanValue > ambangBatas;
      }

      return (
        <div className="text-center flex items-center justify-center">
          <span>{formatNumber(meanValue)}</span>
          {melebihiAmbang && (
            <ShieldAlert className="ml-2 h-4 w-4 text-destructive" />
          )}
        </div>
      );
    },
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        const meanValue = kalbarData?.mean;
        const komoditas = getSelectedKomoditas(table);
        let melebihiAmbang = false;

        // Logika anomali hanya berjalan jika komoditas adalah salah satu dari jenis padi
        if (komoditas === '1 - Padi Sawah' || komoditas === '3 - Padi Ladang') {
            const unit = getUnit(table);
            const ambangBatas = unit === 'ku/ha' ? AMBANG_BATAS.KU_PER_HA : AMBANG_BATAS.KG_PER_PLOT;
            melebihiAmbang = meanValue !== null && meanValue !== undefined && meanValue > ambangBatas;
        }

        return (
          <div className="text-center flex items-center justify-center font-bold">
            <span>{formatNumber(meanValue)}</span>
            {melebihiAmbang && (
              <ShieldAlert className="ml-2 h-4 w-4 text-destructive" />
            )}
          </div>
        );
    },
  },
  // ... (sisa kolom lainnya tetap sama) ...
  {
    accessorKey: "median",
    header: createTwoLineHeaderWithUnit("Median"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.median)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.median)}</div>;
    },
  },
  {
    accessorKey: "min",
    header: createTwoLineHeaderWithUnit("Min"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.min)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.min)}</div>;
    },
  },
  {
    accessorKey: "max",
    header: createTwoLineHeaderWithUnit("Max"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.max)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.max)}</div>;
    },
  },
  {
    accessorKey: "stdDev",
    header: createTwoLineHeaderWithUnit("Standar Deviasi"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.stdDev)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.stdDev)}</div>;
    },
  },
  {
    accessorKey: "q1",
    header: createTwoLineHeaderWithUnit("Kuartil 1 (Q1)"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.q1)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.q1)}</div>;
    },
  },
  {
    accessorKey: "q3",
    header: createTwoLineHeaderWithUnit("Kuartil 3 (Q3)"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.q3)}</div>,
    footer: ({ table }) => {
        const kalbarData = table.options.meta?.kalimantanBaratData as DescriptiveStatsRow | null;
        return <div className="text-center font-bold">{formatNumber(kalbarData?.q3)}</div>;
    },
  },
];