// src/app/(dashboard)/evaluasi/ubinan/UbinanComparisonRechart.tsx
"use client";

import React from 'react';
import { DescriptiveStatsRow } from '@/hooks/useUbinanDescriptiveStatsData';
import BarChartWrapper from '@/app/(dashboard)/produksi-statistik/bar-chart-wrapper'; // Sesuaikan path jika perlu
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

interface UbinanComparisonRechartProps {
  data: DescriptiveStatsRow[];
  currentYear: number;
  comparisonYear: number | null;
  isLoading: boolean;
  // Kita bisa tambahkan fungsi onClick jika diperlukan nanti
}

export function UbinanComparisonChart({ data, currentYear, comparisonYear, isLoading }: UbinanComparisonRechartProps) {

  // 1. Transformasi data agar sesuai dengan BarChartWrapper
  const chartData = data.map(item => ({
    name: item.namaKabupaten,
    [String(currentYear)]: item.mean,
    ...(comparisonYear && { [String(comparisonYear)]: item.comparisonMean }),
  }));

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Grafik Perbandingan Hasil Ubinan</CardTitle>
                <CardDescription>Memuat data perbandingan rata-rata hasil ubinan...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full bg-gray-200 animate-pulse rounded-md"></div>
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