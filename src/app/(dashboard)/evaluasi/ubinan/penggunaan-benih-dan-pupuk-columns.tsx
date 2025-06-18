// src/app/(dashboard)/evaluasi/ubinan/penggunaan-benih-dan-pupuk-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PupukDanBenihRow } from "./types"; // DIPERBARUI
import { ShieldAlert } from 'lucide-react';

const formatNumber = (value: number | null | undefined, decimalPlaces: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return value.toFixed(decimalPlaces);
};

const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return "-";
    const sign = value > 0 ? '+' : '';
    const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-destructive' : 'text-muted-foreground';
    return <span className={`font-bold ${color}`}>{`${sign}${value.toFixed(1)}%`}</span>
}

const AMBANG_BATAS = {
  BENIH_KG_HA: 100, UREA_KG_HA: 250, TSP_KG_HA: 250, KCL_KG_HA: 250,
  NPK_KG_HA: 250, ZA_KG_HA: 250, KOMPOS_KG_HA: 1000, ORGANIK_CAIR_LITER_HA: 20,
};

const createTwoLineHeader = (line1: string, line2: string) => {
  return () => (
    <div className="text-center">
      <div>{line1}</div>
      <div className="text-xs font-normal text-muted-foreground">{line2}</div>
    </div>
  );
};

const createDetailColumn = (
  accessorKey: keyof PupukDanBenihRow,
  headerText: string,
  unit: string,
  ambangBatas?: number,
  decimalPlaces: number = 1
): ColumnDef<PupukDanBenihRow> => ({
  accessorKey,
  header: createTwoLineHeader(headerText, `(${unit})`),
  cell: ({ row }) => {
    const value = row.original[accessorKey] as number | null;
    return (
      <div className="text-center flex items-center justify-center">
        <span>{formatNumber(value, decimalPlaces)}</span>
        {ambangBatas !== undefined && value !== null && value > ambangBatas && (
          <ShieldAlert className="ml-2 h-4 w-4 text-destructive" />
        )}
      </div>
    );
  },
  footer: ({ table }) => {
      const kalbarData = table.options.meta?.kalimantanBaratPupukDanBenih;
      const value = kalbarData ? (kalbarData[accessorKey] as number | null) : null;
      return <div className="text-center">{formatNumber(value, decimalPlaces)}</div>;
  },
});

const createComparisonColumnGroup = (
  baseKey: keyof PupukDanBenihRow,
  headerText: string,
  unit: string
): ColumnDef<PupukDanBenihRow>[] => {
  const comparisonKey = `comparison_${String(baseKey)}` as keyof PupukDanBenihRow;
  const changeKey = `change_${String(baseKey)}` as keyof PupukDanBenihRow;
  const decimalPlaces = unit === "m²" ? 0 : 1;

  return [
    {
      id: `${String(baseKey)}_this_year`,
      accessorKey: baseKey,
      header: createTwoLineHeader(`${headerText} (Thn Ini)`, `(${unit})`),
      cell: ({ row }) => <div className="text-center">{formatNumber(row.original[baseKey] as number, decimalPlaces)}</div>,
      footer: ({ table }) => {
        const value = table.options.meta?.kalimantanBaratPupukDanBenih?.[baseKey] as number;
        return <div className="text-center">{formatNumber(value, decimalPlaces)}</div>;
      },
    },
    {
      id: `${String(baseKey)}_last_year`,
      accessorKey: comparisonKey,
      header: createTwoLineHeader(`${headerText} (Thn Pembanding)`, `(${unit})`),
      cell: ({ row }) => <div className="text-center">{formatNumber(row.original[comparisonKey] as number, decimalPlaces)}</div>,
      footer: ({ table }) => {
        const value = table.options.meta?.kalimantanBaratPupukDanBenih?.[comparisonKey] as number;
        return <div className="text-center">{formatNumber(value, decimalPlaces)}</div>;
      },
    },
    {
      id: `${String(baseKey)}_change`,
      accessorKey: changeKey,
      header: createTwoLineHeader(headerText, "(Perubahan %)"),
      cell: ({ row }) => <div className="text-center">{formatPercentage(row.original[changeKey] as number)}</div>,
      footer: ({ table }) => {
        const value = table.options.meta?.kalimantanBaratPupukDanBenih?.[changeKey] as number;
        return <div className="text-center">{formatPercentage(value)}</div>;
      },
    },
  ];
};

export const detailFertilizerColumns: ColumnDef<PupukDanBenihRow>[] = [
  {
    accessorKey: "namaKabupaten",
    header: () => <div className="text-center">Kabupaten/Kota</div>,
    cell: ({ row }) => <div className="text-start min-w-[150px]">{row.original.namaKabupaten}</div>,
    footer: "Kalimantan Barat",
  },
  createDetailColumn('avgR604_m2', "Luas Tanam", "m²", undefined, 0),
  createDetailColumn('avgBenihPerHa_kg_ha', 'Benih', 'Kg/Ha', AMBANG_BATAS.BENIH_KG_HA, 1),
  createDetailColumn('avgUreaPerHa_kg_ha', 'Urea', 'Kg/Ha', AMBANG_BATAS.UREA_KG_HA),
  createDetailColumn('avgTSPerHa_kg_ha', 'TSP/SP36', 'Kg/Ha', AMBANG_BATAS.TSP_KG_HA),
  createDetailColumn('avgKCLperHa_kg_ha', 'KCL', 'Kg/Ha', AMBANG_BATAS.KCL_KG_HA),
  createDetailColumn('avgNPKPerHa_kg_ha', 'NPK', 'Kg/Ha', AMBANG_BATAS.NPK_KG_HA),
  createDetailColumn('avgKomposPerHa_kg_ha', 'Kompos', 'Kg/Ha', AMBANG_BATAS.KOMPOS_KG_HA, 0),
  createDetailColumn('avgOrganikCairPerHa_liter_ha', 'Organik Cair', 'Liter/Ha', AMBANG_BATAS.ORGANIK_CAIR_LITER_HA),
  createDetailColumn('avgZAPerHa_kg_ha', 'ZA', 'Kg/Ha', AMBANG_BATAS.ZA_KG_HA),
];

const variableMap: { [key: string]: { label: string; unit: string } } = {
  'avgBenihPerHa_kg_ha': { label: 'Benih', unit: 'Kg/Ha' },
  'avgUreaPerHa_kg_ha': { label: 'Urea', unit: 'Kg/Ha' },
  'avgTSPerHa_kg_ha': { label: 'TSP/SP36', unit: 'Kg/Ha' },
  'avgKCLperHa_kg_ha': { label: 'KCL', unit: 'Kg/Ha' },
  'avgNPKPerHa_kg_ha': { label: 'NPK', unit: 'Kg/Ha' },
  'avgKomposPerHa_kg_ha': { label: 'Kompos', unit: 'Kg/Ha' },
  'avgOrganikCairPerHa_liter_ha': { label: 'Organik Cair', unit: 'Liter/Ha' },
  'avgZAPerHa_kg_ha': { label: 'ZA', unit: 'Kg/Ha' },
};

export const getComparisonFertilizerColumns = (selectedVariables: string[]): ColumnDef<PupukDanBenihRow>[] => {
    const comparisonColumns = selectedVariables.flatMap(variableKey => {
        const config = variableMap[variableKey];
        if (!config) return [];
        return createComparisonColumnGroup(variableKey as keyof PupukDanBenihRow, config.label, config.unit);
    });

    return [
        {
            accessorKey: "namaKabupaten",
            header: () => <div className="text-center">Kabupaten/Kota</div>,
            cell: ({ row }) => <div className="text-start min-w-[150px]">{row.original.namaKabupaten}</div>,
            footer: "Kalimantan Barat",
        },
        ...comparisonColumns
    ];
};