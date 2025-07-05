// src/hooks/useChartDataProcessor.ts
import { useMemo } from 'react';
import { Annotation, AugmentedAtapDataPoint, MonthlyDataPoint, LineChartRawData } from "@/lib/types";
import { MONTH_NAMES, FULL_MONTH_NAMES } from "@/lib/utils";
import { kabMap } from "@/lib/satker-data";

const KABUPATEN_MAP: { [key: string]: string } = kabMap.reduce((acc, curr) => {
  acc[curr.value] = curr.label;
  return acc;
}, {} as { [key: string]: string });

interface UseChartDataProcessorProps {
  data: MonthlyDataPoint[] | undefined;
  dataPembanding: MonthlyDataPoint[] | undefined;
  lineChartRawData: LineChartRawData | undefined;
  annotations: Annotation[] | undefined;
  filters: {
    bulan: string;
    tahunPembanding: string;
    indikatorNama: string;
  };
  selectedYear: number;
  selectedKabupaten: string | null;
  timeDataView: 'bulanan' | 'subround';
  satuan: string | null; // Tambahkan prop satuan
}

export const useChartDataProcessor = ({
  data,
  dataPembanding,
  lineChartRawData,
  annotations,
  filters,
  selectedYear,
  selectedKabupaten,
  timeDataView,
  satuan
}: UseChartDataProcessorProps) => {
  return useMemo(() => {
    const mainData = data || [];
    const compareData = dataPembanding || [];
    const totalNilai = mainData.reduce((sum: number, item: MonthlyDataPoint) => sum + (item.nilai ?? 0), 0);
    const totalNilaiPembanding = compareData.reduce((sum: number, item: MonthlyDataPoint) => sum + (item.nilai ?? 0), 0);
    
    // Process table data
    const augmentedTableData: AugmentedAtapDataPoint[] = mainData.map((d: MonthlyDataPoint) => {
      const nilaiTahunIni = d.nilai;
      const nilaiTahunLalu = compareData.find((p: MonthlyDataPoint) => p.kode_wilayah === d.kode_wilayah)?.nilai;
      const kontribusi = totalNilai > 0 ? (nilaiTahunIni / totalNilai) * 100 : 0;
      
      let pertumbuhan: number | null = null;
      if (nilaiTahunLalu !== undefined && nilaiTahunLalu > 0) {
        pertumbuhan = ((nilaiTahunIni - nilaiTahunLalu) / nilaiTahunLalu) * 100;
      } else if (nilaiTahunLalu !== undefined && nilaiTahunIni > 0) {
        pertumbuhan = Infinity;
      }
      
      const nama_wilayah = d.level_wilayah === 'provinsi' 
        ? 'Provinsi' 
        : KABUPATEN_MAP[d.kode_wilayah] || d.kode_wilayah;

      return { 
        indikator: filters.indikatorNama,
        tahun: selectedYear,
        bulan: d.bulan,
        kode_wilayah: d.kode_wilayah,
        level_wilayah: d.level_wilayah || 'kabupaten',
        nama_wilayah, 
        nilai: d.nilai,
        satuan: null, // Will be set later from main data
        kontribusi, 
        nilaiTahunLalu, 
        pertumbuhan 
      } as AugmentedAtapDataPoint;
    }).sort((a: AugmentedAtapDataPoint, b: AugmentedAtapDataPoint) => b.nilai - a.nilai);

    // Process chart data
    const pieChartData = augmentedTableData.map(d => ({ name: d.nama_wilayah, value: d.nilai || 0 }));
    
    const barChartData = augmentedTableData.map((d: AugmentedAtapDataPoint) => {
      const barAnnotations = annotations?.filter(
        (a: Annotation) => a.kode_wilayah === d.kode_wilayah && 
        (filters.bulan === 'tahunan' ? a.bulan === null : a.bulan === parseInt(filters.bulan))
      ) || [];
      
      return {
        name: d.nama_wilayah,
        kode_wilayah: d.kode_wilayah,
        nilai: d.nilai ?? 0,
        [selectedYear.toString()]: d.nilai,
        ...(d.nilaiTahunLalu && { [filters.tahunPembanding]: d.nilaiTahunLalu }),
        annotations: barAnnotations
      };
    });

    // Process line chart data
    const monthlyLineChartData = Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => {
      const monthStr = monthNum.toString();
      const mainDataPoint = lineChartRawData?.mainData?.find((d: MonthlyDataPoint) => d.bulan?.toString() === monthStr);
      const compareDataPoint = lineChartRawData?.compareData?.find((d: MonthlyDataPoint) => d.bulan?.toString() === monthStr);
      const monthAnnotations = annotations?.filter(
        (a: Annotation) => a.bulan === monthNum && a.kode_wilayah === (selectedKabupaten ? selectedKabupaten : null)
      ) || [];
      
      return {
        name: MONTH_NAMES[monthStr],
        [selectedYear.toString()]: (mainDataPoint?.nilai ?? null) as number | null,
        ...(filters.tahunPembanding !== 'tidak' && { 
          [filters.tahunPembanding]: (compareDataPoint?.nilai ?? null) as number | null 
        }),
        annotations: monthAnnotations,
        kode_wilayah: (selectedKabupaten || null) as string | null
      };
    });

    // Process subround data
    const subroundTemplate = [
      { name: 'Subround 1', main: 0, compare: 0, annotations: [] },
      { name: 'Subround 2', main: 0, compare: 0, annotations: [] },
      { name: 'Subround 3', main: 0, compare: 0, annotations: [] },
    ];
    
    const subroundResult = JSON.parse(JSON.stringify(subroundTemplate));
    
    const aggregateData = (sourceData: MonthlyDataPoint[], target: typeof subroundTemplate, key: 'main' | 'compare') => {
      sourceData.forEach((d: MonthlyDataPoint) => {
        if (!d.bulan) return;
        if (d.bulan <= 4) target[0][key] += d.nilai || 0;
        else if (d.bulan <= 8) target[1][key] += d.nilai || 0;
        else if (d.bulan <= 12) target[2][key] += d.nilai || 0;
      });
    };
    
    aggregateData(lineChartRawData?.mainData || [], subroundResult, 'main');
    aggregateData(lineChartRawData?.compareData || [], subroundResult, 'compare');
    
    const subroundChartData = subroundResult.map((d: { name: string; main: number; compare: number; annotations: Annotation[] }) => ({
      name: d.name,
      [selectedYear.toString()]: d.main as number | null,
      ...(filters.tahunPembanding !== 'tidak' && { [filters.tahunPembanding]: d.compare as number | null }),
      annotations: d.annotations,
      kode_wilayah: (selectedKabupaten || null) as string | null
    }));

    const lineChartData = timeDataView === 'subround' ? subroundChartData : monthlyLineChartData;

    // Calculate range text
    const availableMonths = lineChartRawData?.mainData
      ?.filter((d: MonthlyDataPoint) => d.bulan !== null && d.nilai !== null)
      .map((d: MonthlyDataPoint) => d.bulan as number) || [];

    const minMonth = availableMonths.length > 0 ? Math.min(...availableMonths) : null;
    const maxMonth = availableMonths.length > 0 ? Math.max(...availableMonths) : null;

    const bulanRangeText = (minMonth !== null && maxMonth !== null && minMonth <= maxMonth)
      ? ` (Data Bulan ${FULL_MONTH_NAMES[minMonth.toString()][1]} - ${FULL_MONTH_NAMES[maxMonth.toString()][1]})`
      : '';

    return {
      augmentedTableData,
      barChartData,
      lineChartData,
      pieChartData,
      totalNilai,
      totalNilaiPembanding,
      bulanRangeText,
      satuan: satuan || 'unit' // Gunakan satuan dari props atau default
    };
  }, [
    data,
    dataPembanding,
    lineChartRawData,
    annotations,
    selectedYear,
    filters.bulan,
    filters.tahunPembanding,
    selectedKabupaten,
    timeDataView,
    satuan
  ]);
};
