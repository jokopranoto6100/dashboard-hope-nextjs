// src/app/(dashboard)/produksi-statistik/hooks/useExportHandlers.ts
import { useCallback } from 'react';
import { AugmentedAtapDataPoint } from '@/lib/types';
import { FULL_MONTH_NAMES } from '@/lib/utils';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface UseExportHandlersProps {
  selectedYear: number;
  filters: {
    indikatorNama: string;
    tahunPembanding: string;
  };
}

export const useExportHandlers = ({ selectedYear, filters }: UseExportHandlersProps) => {
  
  const handleExportChart = useCallback(async (
    ref: React.RefObject<HTMLDivElement>, 
    chartName: string
  ) => {
    if (!ref.current) {
      toast.error("Grafik tidak dapat ditemukan.");
      return;
    }
    
    toast.info("Membuat gambar grafik...");
    
    try {
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        backgroundColor: 'white',
        pixelRatio: 2
      });
      
      saveAs(dataUrl, `grafik_${chartName}_${filters.indikatorNama}_${selectedYear}.png`);
      toast.success("Grafik berhasil diunduh!");
    } catch (err) {
      toast.error("Gagal mengekspor grafik.", { 
        description: (err as Error).message 
      });
    }
  }, [selectedYear, filters.indikatorNama]);

  const handleExportData = useCallback((tableData: AugmentedAtapDataPoint[]) => {
    if (!tableData || tableData.length === 0) {
      toast.error("Tidak ada data untuk diekspor.");
      return;
    }

    type ExportRow = {
      "Nama Wilayah": string;
      "Nilai (Thn Ini)": number;
      "Kontribusi (%)": string | undefined;
      "Nilai (Thn Lalu)"?: number | null | undefined;
      "Pertumbuhan (%)"?: string | undefined;
      Indikator: string;
      Tahun: number;
      Bulan: string;
      Satuan: string | null;
    };

    const dataToExport: ExportRow[] = tableData.map((d: AugmentedAtapDataPoint) => ({
      "Nama Wilayah": d.nama_wilayah,
      "Nilai (Thn Ini)": d.nilai,
      "Kontribusi (%)": d.kontribusi?.toFixed(2),
      ...(filters.tahunPembanding !== 'tidak' && { "Nilai (Thn Lalu)": d.nilaiTahunLalu }),
      ...(filters.tahunPembanding !== 'tidak' && { "Pertumbuhan (%)": d.pertumbuhan?.toFixed(2) }),
      Indikator: d.indikator,
      Tahun: d.tahun,
      Bulan: d.bulan ? FULL_MONTH_NAMES[d.bulan.toString()][1] : 'Tahunan',
      Satuan: d.satuan,
    }));

    const columns = [
      "Nama Wilayah",
      "Nilai (Thn Ini)",
      "Kontribusi (%)",
      ...(filters.tahunPembanding !== 'tidak' ? ["Nilai (Thn Lalu)", "Pertumbuhan (%)"] : []),
      "Indikator",
      "Tahun",
      "Bulan",
      "Satuan"
    ] as const;

    // Export ke Excel (XLSX) - konsisten dengan halaman evaluasi/ksa
    const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header: Array.from(columns) });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Statistik');
    
    const fileName = `data_rinci_${filters.indikatorNama}_${selectedYear}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success("Data berhasil diekspor ke Excel!");
  }, [selectedYear, filters.indikatorNama, filters.tahunPembanding]);

  return {
    handleExportChart,
    handleExportData
  };
};
