// src/app/(dashboard)/evaluasi/ubinan/UbinanBoxPlot.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useDarkMode } from '@/context/DarkModeContext'; // Pastikan path ini benar
import ReactECharts from 'echarts-for-react';
import { BoxPlotStatsRow } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

interface UbinanBoxPlotProps {
  data: BoxPlotStatsRow[];
  currentUnit: string;
  isLoading: boolean;
}

interface TooltipParam {
  name: string;
  value: number[];
}

export function UbinanBoxPlot({ data, currentUnit, isLoading }: UbinanBoxPlotProps) {
  const { isDark } = useDarkMode();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chartOption = useMemo(() => {
    // Definisikan warna dinamis berdasarkan tema
    const textColor = isDark ? 'hsl(210 40% 96.1%)' : 'hsl(222.2 47.4% 11.2%)';
    const subtleTextColor = isDark ? 'hsl(215 20.2% 65.1%)' : 'hsl(215.4 16.3% 46.9%)';
    const gridLineColor = isDark ? 'hsl(214.3 31.8% 15.1%)' : 'hsl(214.3 31.8% 91.4%)';
    const boxFillColor = isDark ? 'hsl(224 71.4% 4.1%)' : '#FFFFFF';
    
    // =======================================================================
    // [WARNA BOX PLOT DIUBAH] Mengganti warna border/garis box plot
    // =======================================================================
    const boxBorderColor = isDark ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)'; // Putih di dark mode, Hitam di light mode

    const axisData = data.map(item => item.namaKabupaten);
    const boxPlotChartData = data.map(item => item.boxPlotData);

    return {
      title: {
        text: 'Sebaran Data Hasil Ubinan per Kabupaten/Kota',
        left: 'center',
        textStyle: { 
          color: textColor, 
          fontSize: isMobile ? 14 : 18, 
          fontWeight: 'bold' 
        }
      },
      tooltip: { 
        trigger: 'item', 
        axisPointer: { type: 'shadow' },
        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(50,50,50,0.7)',
        borderColor: gridLineColor,
        textStyle: { color: '#fff' }
      },
      grid: { left: '10%', right: '10%', bottom: '15%' },
      xAxis: {
        type: 'category', data: axisData, boundaryGap: true, nameGap: 30,
        axisLabel: { interval: 0, rotate: 30, color: subtleTextColor },
        axisLine: { lineStyle: { color: gridLineColor } }
      },
      yAxis: { 
        type: 'value', name: `Hasil Ubinan (${currentUnit})`, 
        nameTextStyle: { color: textColor, fontWeight: 'bold', fontSize: 14 },
        axisLabel: { color: subtleTextColor },
        splitArea: { show: false },
        splitLine: { lineStyle: { type: 'dashed', color: gridLineColor } }
      },
      series: [
        {
          name: 'BoxPlot', type: 'boxplot', data: boxPlotChartData,
          itemStyle: { 
            color: boxFillColor, 
            borderColor: boxBorderColor // Menggunakan variabel warna yang baru
          },
          tooltip: {
            formatter: (param: TooltipParam) => {
              if (!param.value || param.value.length < 6) return '';
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
      ]
    };
  }, [data, currentUnit, isDark, isMobile]);

  if (isLoading) {
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Box Plot Sebaran Data</CardTitle>
                <CardDescription>Memuat data sebaran hasil ubinan per kabupaten...</CardDescription>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[500px] w-full" />
            </CardContent>
        </Card>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
        <CardHeader>
            <CardTitle>Box Plot Sebaran Data</CardTitle>
            <CardDescription>Visualisasi sebaran data hasil ubinan menurut kabupaten.</CardDescription>
        </CardHeader>
        <CardContent>
            <ReactECharts option={chartOption} style={{ height: '500px', width: '100%' }} />
        </CardContent>
    </Card>
  );
}