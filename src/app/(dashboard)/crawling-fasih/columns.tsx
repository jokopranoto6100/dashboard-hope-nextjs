// src/app/(dashboard)/crawling-fasih/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { FasihDataRow } from "./_actions"
import { Badge } from "@/components/ui/badge"

// Ini adalah contoh kolom, Anda bisa sesuaikan dengan `dataKey` yang ada di data FASIH
export const columns: ColumnDef<FasihDataRow>[] = [
  {
    accessorKey: "code_identity",
    header: "ID Sampel",
  },
  {
    accessorKey: "nama_petani",
    header: "Nama Petani",
  },
  {
    accessorKey: "nm_kab",
    header: "Kabupaten/Kota",
    cell: ({ row }) => <Badge variant="outline">{row.original.nm_kab}</Badge>,
  },
  {
    accessorKey: "nm_kec",
    header: "Kecamatan",
  },
   {
    accessorKey: "nm_desa",
    header: "Desa/Kelurahan",
  },
  {
    accessorKey: "id_assignment",
    header: "Assignment ID",
  },
]