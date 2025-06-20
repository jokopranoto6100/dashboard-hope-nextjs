/* eslint-disable @typescript-eslint/no-explicit-any */
// Lokasi: src/hooks/useProcessedStatistikData.ts
"use client";

import { useMemo } from 'react';
import { KABUPATEN_MAP, MONTH_NAMES } from '@/app/(dashboard)/produksi-statistik/config';
import { AugmentedAtapDataPoint } from '@/app/(dashboard)/produksi-statistik/columns';

// Tipe Data
type TimeDataView = 'bulanan' | 'subround';

interface Annotation {
  id: number;
  created_at: string;
  komentar: string;
  user_fullname: string | null;
  bulan: number | null;
  kode_wilayah: string | null;
}

interface RawData {
  mainData: any[] | null;
  compareData: any[] | null;
  annotations: Annotation[] | undefined;
  lineChartRawData: { mainData: any[]; compareData: any[] } | undefined;
}

interface Filters {
  bulan: string;
  tahunPembanding: string;
}

// --- PERBAIKAN DI SINI (1) ---
// Definisikan bentuk default untuk KPI agar tidak pernah hanya berupa object kosong
const initialKpiState = {
  total: 0,
  totalPembanding: 0,
  satuan: '',
  wilayahTertinggi: null,
  wilayahTerendah: null,
  jumlahWilayah: 0,
  percentageChange: null,
};

export function useProcessedStatistikData(
    rawData: RawData, 
    filters: Filters,
    selectedYear: number, 
    selectedKabupaten: string | null,
    timeDataView: TimeDataView
) {
  return useMemo(() => {
    // --- PERBAIKAN DI SINI (2) ---
    // Jika data belum siap, kembalikan state dengan bentuk yang lengkap, bukan objek kosong
    if (!rawData || !rawData.mainData) {
        return {
            kpi: initialKpiState,
            barChart: [],
            lineChart: [],
            pieChart: [],
            tableData: []
        };
    }

    const mainData = rawData.mainData || []; 
    const compareData = rawData.compareData || []; 
    const annotations = rawData.annotations || [];
    const lineChartRawData = rawData.lineChartRawData;

    const totalNilai = mainData.reduce((sum: number, item: any) => sum + item.nilai, 0);
    const totalNilaiPembanding = compareData.reduce((sum: number, item: any) => sum + item.nilai, 0);
    
    const augmentedTableData: AugmentedAtapDataPoint[] = mainData.map((d: any) => { 
        const nilaiTahunIni = d.nilai; 
        const nilaiTahunLalu = compareData.find((p: any) => p.kode_wilayah === d.kode_wilayah)?.nilai; 
        const kontribusi = totalNilai > 0 ? (nilaiTahunIni / totalNilai) * 100 : 0; 
        let pertumbuhan: number | null = null; 
        if (nilaiTahunLalu != null && nilaiTahunLalu > 0) { 
            pertumbuhan = ((nilaiTahunIni - nilaiTahunLalu) / nilaiTahunLalu) * 100; 
        } else if (nilaiTahunLalu != null && nilaiTahunIni > 0) { 
            pertumbuhan = Infinity; 
        } 
        return { ...d, nama_wilayah: KABUPATEN_MAP[d.kode_wilayah] || 'Provinsi', kontribusi, nilaiTahunLalu, pertumbuhan }; 
    }).sort((a: AugmentedAtapDataPoint, b: AugmentedAtapDataPoint) => b.nilai - a.nilai);
    
    const pieChartData = augmentedTableData.map(d => ({ name: d.nama_wilayah, value: d.nilai || 0 }));
    
    const barChartData = augmentedTableData.map(d => { 
      const barAnnotations = annotations.filter(
        (a: Annotation) => a.kode_wilayah === d.kode_wilayah && (filters.bulan === 'tahunan' ? a.bulan === null : a.bulan === parseInt(filters.bulan))
      ); 
      return { 
        name: d.nama_wilayah, 
        kode_wilayah: d.kode_wilayah, 
        nilai: d.nilai,
        [selectedYear.toString()]: d.nilai, 
        ...(d.nilaiTahunLalu && { [filters.tahunPembanding]: d.nilaiTahunLalu }), 
        annotations: barAnnotations 
      }; 
    });
    
    const monthlyLineChartData = Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => { 
      const monthStr = monthNum.toString(); 
      const mainDataPoint = lineChartRawData?.mainData?.find(d => d.bulan?.toString() === monthStr); 
      const compareDataPoint = lineChartRawData?.compareData?.find(d => d.bulan?.toString() === monthStr); 
      const monthAnnotations = annotations.filter((a: Annotation) => a.bulan === monthNum && a.kode_wilayah === (selectedKabupaten || null)); 
      
      return { 
        name: MONTH_NAMES[monthStr],
        [selectedYear.toString()]: mainDataPoint?.nilai ?? null, 
        ...(filters.tahunPembanding !== 'tidak' && { [filters.tahunPembanding]: compareDataPoint?.nilai ?? null }), 
        annotations: monthAnnotations, 
        kode_wilayah: selectedKabupaten 
      }; 
    });

    const subroundTemplate: { name: string; main: number; compare: number; annotations: Annotation[] }[] = [ { name: 'Subround 1', main: 0, compare: 0, annotations: [] }, { name: 'Subround 2', main: 0, compare: 0, annotations: [] }, { name: 'Subround 3', main: 0, compare: 0, annotations: [] }, ];
    const subroundResult = JSON.parse(JSON.stringify(subroundTemplate));
    const aggregateData = (sourceData: any[], target: typeof subroundTemplate, key: 'main' | 'compare') => { (sourceData || []).forEach(d => { if (!d.bulan) return; if (d.bulan <= 4) target[0][key] += d.nilai || 0; else if (d.bulan <= 8) target[1][key] += d.nilai || 0; else if (d.bulan <= 12) target[2][key] += d.nilai || 0; }); };
    aggregateData(lineChartRawData?.mainData || [], subroundResult, 'main');
    aggregateData(lineChartRawData?.compareData || [], subroundResult, 'compare');
    const subroundChartData = subroundResult.map((d: { name: string; main: number; compare: number; annotations: Annotation[] }) => ({ name: d.name, [selectedYear.toString()]: d.main, ...(filters.tahunPembanding !== 'tidak' && { [filters.tahunPembanding]: d.compare }), annotations: d.annotations }));

    const lineChartData = timeDataView === 'subround' ? subroundChartData : monthlyLineChartData;
    
    const wilayahTertinggi = barChartData[0] || null; 
    const wilayahTerendah = barChartData.length > 1 ? barChartData[barChartData.length - 1] : null; 
    let percentageChange: number | null = null; 
    if (filters.tahunPembanding !== 'tidak' && totalNilaiPembanding > 0) { 
        percentageChange = ((totalNilai - totalNilaiPembanding) / totalNilaiPembanding) * 100; 
    } else if (filters.tahunPembanding !== 'tidak' && totalNilai > 0) { 
        percentageChange = Infinity; 
    }
    
    const kpi = { 
        total: totalNilai, 
        totalPembanding: totalNilaiPembanding, 
        satuan: mainData[0]?.satuan || '', 
        wilayahTertinggi, 
        wilayahTerendah, 
        jumlahWilayah: new Set(mainData.map((d: any) => d.kode_wilayah)).size, 
        percentageChange 
    };
    
    return { kpi, barChart: barChartData, lineChart: lineChartData, pieChart: pieChartData, tableData: augmentedTableData };
  }, [rawData, filters, selectedYear, selectedKabupaten, timeDataView]);
}