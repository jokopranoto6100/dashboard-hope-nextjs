// Lokasi: src/app/(dashboard)/produksi-statistik/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AtapDataPoint } from "@/hooks/useAtapStatistikData"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const KABUPATEN_MAP: { [key: string]: string } = {
    "6101": "Sambas", "6102": "Bengkayang", "6103": "Landak", "6104": "Mempawah",
    "6105": "Sanggau", "6106": "Ketapang", "6107": "Sintang", "6108": "Kapuas Hulu",
    "6109": "Sekadau", "6110": "Melawi", "6111": "Kayong Utara", "6112": "Kubu Raya",
    "6171": "Pontianak", "6172": "Singkawang"
};

// Fungsi helper untuk memformat angka dengan pemisah ribuan
const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("id-ID").format(value);
};

export const getAtapColumns = (level: 'provinsi' | 'kabupaten'): ColumnDef<AtapDataPoint>[] => {
  
  const baseColumns: ColumnDef<AtapDataPoint>[] = [
    {
      accessorKey: "tahun",
      header: "Tahun",
    },
    {
      accessorKey: "bulan",
      header: "Bulan",
      cell: ({ row }) => {
        const bulan = row.getValue("bulan") as number | null;
        return bulan ? new Date(0, bulan - 1).toLocaleString('id-ID', { month: 'long' }) : "Tahunan";
      },
    },
    // Kolom ini akan muncul jika levelnya adalah kabupaten
    {
      accessorKey: "kode_kab",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Kabupaten/Kota
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
          const kode_kab = row.getValue("kode_kab") as string | null;
          return kode_kab ? KABUPATEN_MAP[kode_kab] || kode_kab : "N/A";
      },
      // Aktifkan kolom ini hanya jika levelnya 'kabupaten'
      enableHiding: level !== 'kabupaten', 
    },
    {
      accessorKey: "indikator",
      header: "Indikator",
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
        return <div className="text-right font-medium">{formatNumber(nilai)}</div>;
      },
    },
    {
      accessorKey: "satuan",
      header: "Satuan",
    },
  ];

  // Filter kolom berdasarkan level yang dipilih
  return baseColumns.filter(column => {
      if (level === 'provinsi' && 'accessorKey' in column && column.accessorKey === 'kode_kab') {
          return false; // Sembunyikan kolom kode_kab jika level provinsi
      }
      return true;
  });
};