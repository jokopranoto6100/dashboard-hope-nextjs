// Lokasi: src/app/(dashboard)/produksi-statistik/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

import { AugmentedAtapDataPoint } from "@/lib/types";

import { formatNumber } from "@/lib/utils";

export const getColumns = (
  selectedYear: number, 
  tahunPembanding: string,
  totalNilai: number,
  totalNilaiPembanding: number,
): ColumnDef<AugmentedAtapDataPoint>[] => {
  const hasPerbandingan = tahunPembanding !== 'tidak';

  const baseColumns: ColumnDef<AugmentedAtapDataPoint>[] = [
    {
      accessorKey: "nama_wilayah",
      header: "Kabupaten/Kota",
      cell: ({ row }) => <div className="font-medium">{row.getValue("nama_wilayah")}</div>,
      footer: () => <div className="text-left font-bold">Kalimantan Barat</div>,
    },
    {
      accessorKey: "nilai",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full justify-center px-0 hover:bg-transparent">
          <div className="text-center">
            <div className="font-semibold">Nilai</div>
            <div className="text-xs text-muted-foreground">({selectedYear})</div>
          </div>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-center font-mono">{formatNumber(row.getValue("nilai"))}</div>,
      footer: () => <div className="text-center font-mono">{formatNumber(totalNilai)}</div>,
    },
    {
      accessorKey: "kontribusi",
      header: () => (
        <div className="text-center">
          <div className="font-semibold">Kontribusi</div>
          <div className="text-xs text-muted-foreground">(%)</div>
        </div>
      ),
      cell: ({ row }) => {
        const kontribusi = row.getValue("kontribusi") as number | undefined;
        return <div className="text-center text-muted-foreground font-mono">{kontribusi?.toFixed(2) || '0.00'}%</div>
      },
      footer: () => <div className="text-center font-mono">100.00%</div>,
    },
  ];
  
  const perbandinganColumns: ColumnDef<AugmentedAtapDataPoint>[] = [
    {
      id: "nilaiTahunLalu",
      header: () => (
        <div className="text-center">
          <div className="font-semibold">Nilai</div>
          <div className="text-xs text-muted-foreground">({tahunPembanding})</div>
        </div>
      ),
      cell: ({ row }) => {
        const nilai = row.original.nilaiTahunLalu;
        return <div className="text-center font-mono text-muted-foreground">{nilai ? formatNumber(nilai) : '-'}</div>
      },
      footer: () => <div className="text-center font-mono">{totalNilaiPembanding > 0 ? formatNumber(totalNilaiPembanding) : '-'}</div>,
    },
    {
      id: "pertumbuhan",
      header: () => (
        <div className="text-center">
          <div className="font-semibold">Pertumbuhan</div>
          <div className="text-xs text-muted-foreground">(%)</div>
        </div>
      ),
      cell: ({ row }) => {
        const pertumbuhan = row.original.pertumbuhan;
        if (pertumbuhan === null || pertumbuhan === undefined || !isFinite(pertumbuhan)) {
          return <div className="text-center text-muted-foreground">-</div>;
        }
        return (
          <div className="flex justify-center">
            <Badge variant={pertumbuhan >= 0 ? "success" : "destructive"} className="text-xs">
              {pertumbuhan.toFixed(2)}%
            </Badge>
          </div>
        )
      },
      footer: () => null,
    }
  ];
  
  if (hasPerbandingan) {
    return [...baseColumns, ...perbandinganColumns];
  }
  
  return baseColumns;
};