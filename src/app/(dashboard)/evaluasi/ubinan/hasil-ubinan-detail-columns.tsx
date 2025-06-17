// src/app/(dashboard)/evaluasi/ubinan/hasil-ubinan-detail-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";

// DIUBAH: Tambahkan id_segmen dan subsegmen ke dalam interface
export interface HasilUbinanDetailRow {
  r111: string | null;
  r701: number | null;
  r702: number | null;
  id_segmen: string | null; // BARU
  subsegmen: string | null; // BARU
  total_records: number;
}

const formatNumber = (value: number | null | undefined, decimalPlaces: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return value.toFixed(decimalPlaces);
};

export const hasilUbinanDetailColumns: ColumnDef<HasilUbinanDetailRow>[] = [
  {
    accessorKey: "r111",
    header: () => <div className="text-left">Nama Responden</div>,
    cell: ({ row }) => <div className="text-left min-w-[150px] max-w-[250px] truncate" title={row.original.r111 || undefined}>{row.original.r111 || "-"}</div>,
    enableSorting: true,
  },
  // BARU: Kolom untuk ID Segmen
  {
    accessorKey: "id_segmen",
    header: () => <div className="text-center">ID Segmen</div>,
    cell: ({ row }) => <div className="text-center">{row.original.id_segmen || "-"}</div>,
    enableSorting: true,
  },
  // BARU: Kolom untuk Subsegmen
  {
    accessorKey: "subsegmen",
    header: () => <div className="text-center">Subsegmen</div>,
    cell: ({ row }) => <div className="text-center">{row.original.subsegmen || "-"}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "r701",
    header: () => ( <div className="text-center"> <div>Hasil Ubinan</div> <div className="text-xs font-normal text-muted-foreground">(kg/plot)</div> </div> ),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.r701, 2)}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "r702",
    header: () => ( <div className="text-center">Jumlah Rumpun</div> ),
    cell: ({ row }) => <div className="text-center">{formatNumber(row.original.r702, 0)}</div>,
    enableSorting: true,
  },
];