// src/app/(dashboard)/evaluasi/ubinan/detail-record-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ShieldAlert } from 'lucide-react';

// Tipe ini HARUS SESUAI dengan struktur yang dikembalikan oleh RPC get_ubinan_detail_sorted_paginated
export interface DetailRecordRowProcessed {
  r111: string | null;
  r604: number | null;
  r608_bibit_kg_mentah: number | null;
  r610_1_urea_kg_mentah: number | null;
  r610_2_tsp_kg_mentah: number | null;
  r610_3_kcl_kg_mentah: number | null;
  r610_4_npk_kg_mentah: number | null;
  r610_5_kompos_kg_mentah: number | null;
  r610_6_organik_cair_liter_mentah: number | null;
  r610_7_za_kg_mentah: number | null;
  benih_kg_ha: number | null; // Ini adalah alias benih_kg_ha_calc dari RPC
  urea_kg_ha: number | null;   // Ini adalah alias urea_kg_ha_calc dari RPC
  tsp_kg_ha: number | null;    // dst.
  kcl_kg_ha: number | null;
  npk_kg_ha: number | null;
  kompos_kg_ha: number | null;
  organik_cair_liter_ha: number | null;
  za_kg_ha: number | null;
  total_records: number; // Ini juga dikembalikan oleh RPC
}

const formatNumber = (value: number | null | undefined, decimalPlaces: number = 1): string => { // Default desimal 1
  if (value === null || value === undefined || isNaN(value)) return "-";
  return value.toFixed(decimalPlaces);
};

const AMBANG_BATAS = {
  BENIH_KG_HA: 100, UREA_KG_HA: 250, TSP_KG_HA: 250, KCL_KG_HA: 250,
  NPK_KG_HA: 250, ZA_KG_HA: 250, KOMPOS_KG_HA: 1000, ORGANIK_CAIR_LITER_HA: 20,
};

const createPerHaColumnWithIcon = (
  dataKeyPerHa: keyof DetailRecordRowProcessed,
  headerText: string,
  unitPerHa: 'Kg/Ha' | 'Liter/Ha',
  ambangBatasPerHa: number,
  decimalPlacesRender?: number // Opsional, default dari formatNumber
): ColumnDef<DetailRecordRowProcessed> => {
  return {
    accessorKey: dataKeyPerHa,
    header: () => (
      <div className="text-center">
        <div>{headerText}</div>
        <div className="text-xs font-normal text-muted-foreground">({unitPerHa})</div>
      </div>
    ),
    cell: ({ row }) => {
      const nilaiPerHa = row.original[dataKeyPerHa] as number | null;
      return (
        <div className="text-center flex items-center justify-center">
          <span>{formatNumber(nilaiPerHa, decimalPlacesRender)}</span>
          {nilaiPerHa !== null && nilaiPerHa > ambangBatasPerHa && (
            <ShieldAlert className="ml-2 h-4 w-4 text-destructive" />
          )}
        </div>
      );
    },
    enableSorting: true,
  };
};

export const detailRecordColumns: ColumnDef<DetailRecordRowProcessed>[] = [
  {
    accessorKey: "r111",
    header: () => <div className="text-left">Nama Responden</div>,
    cell: ({ row }) => <div className="text-left min-w-[150px] max-w-[250px] truncate" title={row.original.r111 || undefined}>{row.original.r111 || "-"}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "r604",
    header: () => ( <div className="text-center"> <div>Luas Tanam</div> <div className="text-xs font-normal text-muted-foreground">(m²)</div> </div> ),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.r604, 0)}</div>,
    enableSorting: true,
  },
  createPerHaColumnWithIcon('benih_kg_ha', 'Benih', 'Kg/Ha', AMBANG_BATAS.BENIH_KG_HA),
  createPerHaColumnWithIcon('urea_kg_ha', 'Urea', 'Kg/Ha', AMBANG_BATAS.UREA_KG_HA),
  createPerHaColumnWithIcon('tsp_kg_ha', 'TSP/SP36', 'Kg/Ha', AMBANG_BATAS.TSP_KG_HA),
  createPerHaColumnWithIcon('kcl_kg_ha', 'KCL', 'Kg/Ha', AMBANG_BATAS.KCL_KG_HA),
  createPerHaColumnWithIcon('npk_kg_ha', 'NPK', 'Kg/Ha', AMBANG_BATAS.NPK_KG_HA),
  createPerHaColumnWithIcon('kompos_kg_ha', 'Kompos', 'Kg/Ha', AMBANG_BATAS.KOMPOS_KG_HA, 0),
  createPerHaColumnWithIcon('organik_cair_liter_ha', 'Organik Cair', 'Liter/Ha', AMBANG_BATAS.ORGANIK_CAIR_LITER_HA),
  createPerHaColumnWithIcon('za_kg_ha', 'ZA', 'Kg/Ha', AMBANG_BATAS.ZA_KG_HA),
];