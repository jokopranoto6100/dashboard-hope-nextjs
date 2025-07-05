// src/hooks/useKpiCalculations.ts
import { useMemo } from 'react';
import { MonthlyDataPoint, LineChartRawData, ChartDataPoint } from "@/lib/types";

interface UseKpiCalculationsProps {
  totalNilai: number;
  totalNilaiPembanding: number;
  barChartData: ChartDataPoint[];
  lineChartRawData: LineChartRawData | undefined;
  filters: {
    tahunPembanding: string;
  };
}

export const useKpiCalculations = ({
  totalNilai,
  totalNilaiPembanding,
  barChartData,
  lineChartRawData,
  filters
}: UseKpiCalculationsProps) => {
  return useMemo(() => {
    const wilayahTertinggi = barChartData[0] || null;
    const wilayahTerendah = barChartData.length > 1 ? barChartData[barChartData.length - 1] : null;
    
    let percentageChange: number | null = null;
    if (filters.tahunPembanding !== 'tidak' && totalNilaiPembanding > 0) {
      percentageChange = ((totalNilai - totalNilaiPembanding) / totalNilaiPembanding) * 100;
    } else if (totalNilai > 0) {
      percentageChange = Infinity;
    }

    const subroundTotals = {
      sr1: { main: 0, compare: 0, change: null as number | null },
      sr2: { main: 0, compare: 0, change: null as number | null },
      sr3: { main: 0, compare: 0, change: null as number | null },
    };

    const processSubrounds = (data: MonthlyDataPoint[], type: 'main' | 'compare') => {
      data.forEach((item: MonthlyDataPoint) => {
        if (item.bulan !== null) {
          const nilaiToAdd = item.nilai ?? 0;
          if (item.bulan >= 1 && item.bulan <= 4) subroundTotals.sr1[type] += nilaiToAdd;
          else if (item.bulan >= 5 && item.bulan <= 8) subroundTotals.sr2[type] += nilaiToAdd;
          else if (item.bulan >= 9 && item.bulan <= 12) subroundTotals.sr3[type] += nilaiToAdd;
        }
      });
    };

    processSubrounds(lineChartRawData?.mainData || [], 'main');
    
    if (filters.tahunPembanding !== 'tidak') {
      processSubrounds(lineChartRawData?.compareData || [], 'compare');
      
      const calculateChange = (main: number, compare: number): number | null => {
        if (compare > 0) return ((main - compare) / compare) * 100;
        if (main > 0) return Infinity;
        return null;
      };
      
      subroundTotals.sr1.change = calculateChange(subroundTotals.sr1.main, subroundTotals.sr1.compare);
      subroundTotals.sr2.change = calculateChange(subroundTotals.sr2.main, subroundTotals.sr2.compare);
      subroundTotals.sr3.change = calculateChange(subroundTotals.sr3.main, subroundTotals.sr3.compare);
    }

    return {
      wilayahTertinggi,
      wilayahTerendah,
      percentageChange,
      subroundTotals
    };
  }, [totalNilai, totalNilaiPembanding, barChartData, lineChartRawData, filters.tahunPembanding]);
};
