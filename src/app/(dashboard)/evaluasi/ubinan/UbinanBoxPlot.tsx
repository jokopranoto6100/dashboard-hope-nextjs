// src/app/(dashboard)/evaluasi/ubinan/UbinanBoxPlot.tsx
'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { BoxPlotStatsRow } from '@/hooks/useUbinanDescriptiveStatsData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface UbinanBoxPlotProps {
  data: BoxPlotStatsRow[];
  currentUnit: string;
  isLoading: boolean;
}

export function UbinanBoxPlot({ data, currentUnit, isLoading }: UbinanBoxPlotProps) {
  const getOption = () => {
    // Siapkan data untuk ECharts
    const axisData = data.map(item => item.namaKabupaten);
    const boxPlotChartData = data.map(item => item.boxPlotData);
    const outliersData = data.flatMap((item, index) => 
        item.outliers.map(outlier => [index, outlier[1]])
    );

    return {
      title: {
        text: 'Sebaran Data Hasil Ubinan per Kabupaten/Kota',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: axisData,
        boundaryGap: true,
        nameGap: 30,
        axisLabel: {
            interval: 0,
            rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: `Hasil Ubinan (${currentUnit})`,
        splitArea: {
          show: true
        }
      },
      series: [
        {
          name: 'BoxPlot',
          type: 'boxplot',
          data: boxPlotChartData,
          tooltip: {
            formatter: (param: any) => {
              const values = param.value;
              return [
                `<strong>${param.name}</strong><br/>`,
                `Max: ${values[5].toFixed(2)}<br/>`,
                `Q3: ${values[4].toFixed(2)}<br/>`,
                `Median: ${values[3].toFixed(2)}<br/>`,
                `Q1: ${values[2].toFixed(2)}<br/>`,
                `Min: ${values[1].toFixed(2)}`
              ].join('');
            }
          }
        },
        {
          name: 'Outlier',
          type: 'scatter',
          data: outliersData
        }
      ]
    };
  };

  if (isLoading) {
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Box Plot Sebaran Data</CardTitle>
                <CardDescription>Memuat data sebaran hasil ubinan per kabupaten...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full bg-gray-200 animate-pulse rounded-md"></div>
            </CardContent>
        </Card>
    );
  }

  if (!data || data.length === 0) {
    return null; // Jangan tampilkan apa-apa jika tidak ada data
  }

  return (
    <Card className="mt-6">
        <CardHeader>
            <CardTitle>Box Plot Sebaran Data</CardTitle>
            <CardDescription>Visualisasi sebaran data hasil ubinan, menunjukkan median, kuartil, dan pencilan (outlier) untuk setiap kabupaten.</CardDescription>
        </CardHeader>
        <CardContent>
            <ReactECharts option={getOption()} style={{ height: '500px', width: '100%' }} />
        </CardContent>
    </Card>
  );
}