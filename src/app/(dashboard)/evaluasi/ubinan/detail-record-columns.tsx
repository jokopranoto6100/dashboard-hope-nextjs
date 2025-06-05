// src/app/(dashboard)/evaluasi/ubinan/detail-record-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CircleX } from 'lucide-react'; // Impor ikon

// Tipe data untuk baris tabel detail (nilai mentah yang diterima dari modal content)
// Nama field di sini HARUS SAMA dengan yang di-SELECT dari Supabase
export interface DetailRecordRawData {
  r111: string | null;
  r604: number | null;
  r608: number | null; // Bibit (Kg) - Nama field dari DB
  r610_1: number | null; // Urea (kg) - Nama field dari DB
  r610_2: number | null; // TSP (kg) - Nama field dari DB
  r610_3: number | null; // KCL (kg) - Nama field dari DB
  r610_4: number | null; // NPK (kg) - Nama field dari DB
  r610_5: number | null; // Kompos (kg) - Nama field dari DB
  r610_6: number | null; // Organik Cair (liter) - Nama field dari DB
  r610_7: number | null; // ZA (kg) - Nama field dari DB
}

// Tipe data untuk baris tabel yang sudah diproses (dengan nilai per hektar)
// Ini yang akan digunakan oleh useReactTable di modal content
export interface DetailRecordRowProcessed {
  r111: string | null;
  r604: number | null;
  // Menyimpan nilai mentah juga, jika diperlukan untuk referensi atau debugging di kolom
  r608_bibit_kg_mentah: number | null;
  r610_1_urea_kg_mentah: number | null;
  r610_2_tsp_kg_mentah: number | null;
  r610_3_kcl_kg_mentah: number | null;
  r610_4_npk_kg_mentah: number | null;
  r610_5_kompos_kg_mentah: number | null;
  r610_6_organik_cair_liter_mentah: number | null;
  r610_7_za_kg_mentah: number | null;

  // Field yang sudah dihitung per hektar
  benih_kg_ha: number | null;
  urea_kg_ha: number | null;
  tsp_kg_ha: number | null;
  kcl_kg_ha: number | null;
  npk_kg_ha: number | null;
  kompos_kg_ha: number | null;
  organik_cair_liter_ha: number | null;
  za_kg_ha: number | null;
}


const formatNumber = (value: number | null | undefined, decimalPlaces: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return value.toFixed(decimalPlaces);
};

const AMBANG_BATAS = {
  BENIH_KG_HA: 100,
  UREA_KG_HA: 200,
  TSP_KG_HA: 100,
  KCL_KG_HA: 100,
  NPK_KG_HA: 200,
  ZA_KG_HA: 100,
  KOMPOS_KG_HA: 1000,
  ORGANIK_CAIR_LITER_HA: 20,
};

// Helper untuk membuat kolom yang menampilkan nilai per hektar dan ikon badge
const createPerHaColumnWithIcon = (
  dataKeyPerHa: keyof DetailRecordRowProcessed, // Kunci untuk data per hektar
  headerText: string,
  unitPerHa: 'Kg/Ha' | 'Liter/Ha',
  ambangBatasPerHa: number,
  decimalPlacesRender: number = 1
): ColumnDef<DetailRecordRowProcessed> => {
  return {
    accessorKey: dataKeyPerHa, // Sorting akan dilakukan berdasarkan nilai per hektar ini
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
            <CircleX className="ml-2 h-4 w-4 text-destructive" />
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
    header: () => (
        <div className="text-center">
            <div>Luas Tanam</div>
            <div className="text-xs font-normal text-muted-foreground">(m²)</div>
        </div>
    ),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.r604, 0)}</div>,
    enableSorting: true,
  },
  // Kolom Benih per Hektar dengan Ikon
  createPerHaColumnWithIcon('benih_kg_ha', 'Benih', 'Kg/Ha', AMBANG_BATAS.BENIH_KG_HA),
  // Kolom Pupuk per Hektar dengan Ikon
  createPerHaColumnWithIcon('urea_kg_ha', 'Urea', 'Kg/Ha', AMBANG_BATAS.UREA_KG_HA),
  createPerHaColumnWithIcon('tsp_kg_ha', 'TSP/SP36', 'Kg/Ha', AMBANG_BATAS.TSP_KG_HA),
  createPerHaColumnWithIcon('kcl_kg_ha', 'KCL', 'Kg/Ha', AMBANG_BATAS.KCL_KG_HA),
  createPerHaColumnWithIcon('npk_kg_ha', 'NPK', 'Kg/Ha', AMBANG_BATAS.NPK_KG_HA),
  createPerHaColumnWithIcon('kompos_kg_ha', 'Kompos', 'Kg/Ha', AMBANG_BATAS.KOMPOS_KG_HA, 0),
  createPerHaColumnWithIcon('organik_cair_liter_ha', 'Organik Cair', 'Liter/Ha', AMBANG_BATAS.ORGANIK_CAIR_LITER_HA),
  createPerHaColumnWithIcon('za_kg_ha', 'ZA', 'Kg/Ha', AMBANG_BATAS.ZA_KG_HA),
];