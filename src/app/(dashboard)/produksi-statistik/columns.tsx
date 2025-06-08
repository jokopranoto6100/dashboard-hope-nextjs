// Lokasi: src/app/(dashboard)/produksi-statistik/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AtapDataPoint } from "@/hooks/useAtapStatistikData" // Asumsi path ini benar
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const KABUPATEN_MAP: { [key: string]: string } = { "6101": "Sambas", "6102": "Bengkayang", "6103": "Landak", "6104": "Mempawah", "6105": "Sanggau", "6106": "Ketapang", "6107": "Sintang", "6108": "Kapuas Hulu", "6109": "Sekadau", "6110": "Melawi", "6111": "Kayong Utara", "6112": "Kubu Raya", "6171": "Pontianak", "6172": "Singkawang" };
const MONTH_NAMES: { [key: string]: string } = { "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "Mei", "6": "Jun", "7": "Jul", "8": "Agu", "9": "Sep", "10": "Okt", "11": "Nov", "12": "Des" };

// Fungsi untuk format angka
const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

export const columns: ColumnDef<AtapDataPoint>[] = [
  {
    accessorKey: "indikator",
    header: "Indikator",
  },
  {
    accessorKey: "tahun",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tahun
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "bulan",
    header: "Bulan",
    cell: ({ row }) => {
      const bulan = row.getValue("bulan") as number | null;
      return bulan ? MONTH_NAMES[bulan.toString()] : "Tahunan";
    },
  },
  {
    accessorKey: "kode_wilayah",
    header: "Nama Wilayah",
    cell: ({ row }) => {
        const kodeWilayah = row.original.kode_wilayah;
        const level = row.original.level_wilayah;
        return level === 'provinsi' ? 'Provinsi Kalimantan Barat' : (KABUPATEN_MAP[kodeWilayah] || kodeWilayah);
    }
  },
  {
    accessorKey: "nilai",
    header: ({ column }) => {
      return (
        <div className="text-right">
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Nilai
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      )
    },
    cell: ({ row }) => {
        const nilai = parseFloat(row.getValue("nilai"));
        return <div className="text-right font-medium">{formatNumber(nilai)}</div>
    }
  },
  {
    accessorKey: "satuan",
    header: "Satuan",
  },
]