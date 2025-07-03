// src/app/(dashboard)/evaluasi/ubinan/UbinanComparisonChart.tsx
"use client";

import React, { useMemo } from 'react'; // DIPERBARUI
import { DescriptiveStatsRow } from './types';
import BarChartWrapper from '@/app/(dashboard)/produksi-statistik/bar-chart-wrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

interface UbinanComparisonRechartProps {
  data: DescriptiveStatsRow[];
  currentYear: number;
  comparisonYear: number | null;
  isLoading: boolean;
}

export function UbinanComparisonChart({ data, currentYear, comparisonYear, isLoading }: UbinanComparisonRechartProps) {

  // DIPERBARUI: Transformasi data dibungkus dengan useMemo
  const chartData = useMemo(() => data.map(item => ({
    name: item.namaKabupaten,
    [String(currentYear)]: item.mean,
    ...(comparisonYear && { [String(comparisonYear)]: item.comparisonMean }),
    annotations: [], // Add empty annotations array
  })), [data, currentYear, comparisonYear]); // Dependensi: hanya kalkulasi ulang jika input berubah

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Grafik Perbandingan Hasil Ubinan</CardTitle>
                <CardDescription>Memuat data perbandingan rata-rata hasil ubinan...</CardDescription>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[300px] w-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Perbandingan Hasil Ubinan</CardTitle>
        <CardDescription>
          {`Perbandingan rata-rata hasil ubinan antara tahun ${currentYear}` + (comparisonYear ? ` dan ${comparisonYear}.` : '.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BarChartWrapper
          data={chartData}
          dataKey1={String(currentYear)}
          dataKey2={comparisonYear ? String(comparisonYear) : undefined}
          onClick={() => { /* Belum ada aksi */ }}
        />
      </CardContent>
    </Card>
  );
}