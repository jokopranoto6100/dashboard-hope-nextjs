// src/app/(dashboard)/evaluasi/ubinan/descriptive-stats-columns.tsx
"use client";

import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";
import { DescriptiveStatsRow } from './types'; // DIPERBARUI
import { ShieldAlert } from 'lucide-react';

const AMBANG_BATAS = {
  KG_PER_PLOT: 5,
  KU_PER_HA: 80, 
};

const formatNumber = (value: number | null | undefined, decimalPlaces: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return value.toFixed(decimalPlaces);
};

const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return "-";
    const sign = value > 0 ? '+' : '';
    const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-destructive' : 'text-muted-foreground';
    return <span className={`font-bold ${color}`}>{`${sign}${value.toFixed(1)}%`}</span>
}

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

const meanCell = ({ row, table }: { row: { original: DescriptiveStatsRow }, table: TanstackTable<DescriptiveStatsRow> }) => {
    const meanValue = row.original.mean;
    const komoditas = getSelectedKomoditas(table);
    let melebihiAmbang = false;
    if (komoditas === '1 - Padi Sawah' || komoditas === '3 - Padi Ladang') {
      const unit = getUnit(table);
      const ambangBatas = unit === 'ku/ha' ? AMBANG_BATAS.KU_PER_HA : AMBANG_BATAS.KG_PER_PLOT;
      melebihiAmbang = meanValue !== null && meanValue > ambangBatas;
    }
    return (
      <div className="text-center flex items-center justify-center">
        <span>{formatNumber(meanValue)}</span>
        {melebihiAmbang && (<ShieldAlert className="ml-2 h-4 w-4 text-destructive" />)}
      </div>
    );
};

// --- SET KOLOM UNTUK MODE DETAIL --- (SUDAH BENAR)
export const detailStatsColumns: ColumnDef<DescriptiveStatsRow>[] = [
  {
    accessorKey: "namaKabupaten",
    header: "Kabupaten/Kota",
    cell: ({ row }) => <div className="text-start min-w-[150px]">{row.original.namaKabupaten}</div>,
    footer: "Kalimantan Barat", 
  },
  {
    accessorKey: "count",
    header: "Jumlah Sampel",
    cell: ({ row }) => <div className="text-center">{row.original.count}</div>,
    footer: ({ table }) => {
        const total = table.options.meta?.kalimantanBaratData?.count;
        return <div className="text-center">{total ?? '-'}</div>
    },
  },
  {
    accessorKey: "mean",
    header: createTwoLineHeaderWithUnit("Mean"),
    cell: meanCell,
    footer: ({ table }) => {
        const mean = table.options.meta?.kalimantanBaratData?.mean;
        return <div className="text-center">{formatNumber(mean)}</div>
    },
  },
  {
    accessorKey: "median",
    header: createTwoLineHeaderWithUnit("Median"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.median)}</div>,
    footer: ({ table }) => {
        const median = table.options.meta?.kalimantanBaratData?.median;
        return <div className="text-center">{formatNumber(median)}</div>
    },
  },
  {
    accessorKey: "min",
    header: createTwoLineHeaderWithUnit("Min"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.min)}</div>,
    footer: ({ table }) => {
        const min = table.options.meta?.kalimantanBaratData?.min;
        return <div className="text-center">{formatNumber(min)}</div>
    },
  },
  {
    accessorKey: "max",
    header: createTwoLineHeaderWithUnit("Max"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.max)}</div>,
    footer: ({ table }) => {
        const max = table.options.meta?.kalimantanBaratData?.max;
        return <div className="text-center">{formatNumber(max)}</div>
    },
  },
  {
    accessorKey: "stdDev",
    header: createTwoLineHeaderWithUnit("Standar Deviasi"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.stdDev)}</div>,
    footer: ({ table }) => {
        const stdDev = table.options.meta?.kalimantanBaratData?.stdDev;
        return <div className="text-center">{formatNumber(stdDev)}</div>
    },
  },
  {
    accessorKey: "q1",
    header: createTwoLineHeaderWithUnit("Kuartil 1 (Q1)"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.q1)}</div>,
    footer: ({ table }) => {
        const q1 = table.options.meta?.kalimantanBaratData?.q1;
        return <div className="text-center">{formatNumber(q1)}</div>
    },
  },
  {
    accessorKey: "q3",
    header: createTwoLineHeaderWithUnit("Kuartil 3 (Q3)"),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.q3)}</div>,
    footer: ({ table }) => {
        const q3 = table.options.meta?.kalimantanBaratData?.q3;
        return <div className="text-center">{formatNumber(q3)}</div>
    },
  },
];

// --- SET KOLOM UNTUK MODE PERBANDINGAN --- (DIPERBAIKI)
export const createComparisonStatsColumns = (currentYear: number, comparisonYear: number): ColumnDef<DescriptiveStatsRow>[] => [
    {
        accessorKey: "namaKabupaten",
        header: "Kabupaten/Kota",
        cell: ({ row }) => <div className="text-start min-w-[150px]">{row.original.namaKabupaten}</div>,
        footer: "Kalimantan Barat",
    },
    {
        accessorKey: "count",
        header: `Sampel (${currentYear})`,
        cell: ({ row }) => <div className="text-center">{row.original.count}</div>,
        footer: ({ table }) => {
            const kalbarData = table.options.meta?.kalimantanBaratData;
            return <div className="text-center">{kalbarData?.count ?? '-'}</div>;
        },
    },
    {
        accessorKey: "comparisonCount",
        header: `Sampel (${comparisonYear})`,
        cell: ({ row }) => <div className="text-center">{row.original.comparisonCount ?? '-'}</div>,
        footer: ({ table }) => {
            const kalbarData = table.options.meta?.kalimantanBaratData;
            return <div className="text-center">{kalbarData?.comparisonCount ?? '-'}</div>;
        },
    },
    {
        accessorKey: "mean",
        header: ({ table }) => (
            <div className="text-center">
                <div>Mean ({currentYear})</div>
                <div className="text-xs font-normal text-muted-foreground">({(table.options.meta?.currentUnit as string) || 'kg/plot'})</div>
            </div>
        ),
        cell: meanCell,
        footer: ({ table }) => {
            const kalbarData = table.options.meta?.kalimantanBaratData;
            return <div className="text-center">{formatNumber(kalbarData?.mean)}</div>;
        },
    },
    {
        accessorKey: "comparisonMean",
        header: ({ table }) => (
            <div className="text-center">
                <div>Mean ({comparisonYear})</div>
                <div className="text-xs font-normal text-muted-foreground">({(table.options.meta?.currentUnit as string) || 'kg/plot'})</div>
            </div>
        ),
        cell: ({ row }) => <div className="text-center">{formatNumber(row.original.comparisonMean)}</div>,
        footer: ({ table }) => {
            const kalbarData = table.options.meta?.kalimantanBaratData;
            return <div className="text-center">{formatNumber(kalbarData?.comparisonMean)}</div>;
        },
    },
    {
        accessorKey: "meanChange",
        header: "Perubahan (%)",
        cell: ({ row }) => <div className="text-center">{formatPercentage(row.original.meanChange)}</div>,
        footer: ({ table }) => {
            const kalbarData = table.options.meta?.kalimantanBaratData;
            return <div className="text-center">{formatPercentage(kalbarData?.meanChange)}</div>;
        },
    },
];

// Legacy static columns for backward compatibility
export const comparisonStatsColumns: ColumnDef<DescriptiveStatsRow>[] = [
    {
        accessorKey: "namaKabupaten",
        header: "Kabupaten/Kota",
        cell: ({ row }) => <div className="text-start min-w-[150px]">{row.original.namaKabupaten}</div>,
        footer: "Kalimantan Barat",
    },
    {
        accessorKey: "count",
        header: "Sampel (Thn Ini)",
        cell: ({ row }) => <div className="text-center">{row.original.count}</div>,
        footer: ({ table }) => {
            const kalbarData = table.options.meta?.kalimantanBaratData;
            return <div className="text-center">{kalbarData?.count ?? '-'}</div>;
        },
    },
    {
        accessorKey: "comparisonCount",
        header: "Sampel (Thn Pembanding)",
        cell: ({ row }) => <div className="text-center">{row.original.comparisonCount ?? '-'}</div>,
        footer: ({ table }) => {
            const kalbarData = table.options.meta?.kalimantanBaratData;
            return <div className="text-center">{kalbarData?.comparisonCount ?? '-'}</div>;
        },
    },
    {
        accessorKey: "mean",
        header: createTwoLineHeaderWithUnit("Mean (Thn Ini)"),
        cell: meanCell,
        footer: ({ table }) => {
            const kalbarData = table.options.meta?.kalimantanBaratData;
            return <div className="text-center">{formatNumber(kalbarData?.mean)}</div>;
        },
    },
    {
        accessorKey: "comparisonMean",
        header: createTwoLineHeaderWithUnit("Mean (Thn Pembanding)"),
        cell: ({ row }) => <div className="text-center">{formatNumber(row.original.comparisonMean)}</div>,
        footer: ({ table }) => {
            const kalbarData = table.options.meta?.kalimantanBaratData;
            return <div className="text-center">{formatNumber(kalbarData?.comparisonMean)}</div>;
        },
    },
    {
        accessorKey: "meanChange",
        header: "Perubahan (%)",
        cell: ({ row }) => <div className="text-center">{formatPercentage(row.original.meanChange)}</div>,
        footer: ({ table }) => {
            const kalbarData = table.options.meta?.kalimantanBaratData;
            return <div className="text-center">{formatPercentage(kalbarData?.meanChange)}</div>;
        },
    },
];