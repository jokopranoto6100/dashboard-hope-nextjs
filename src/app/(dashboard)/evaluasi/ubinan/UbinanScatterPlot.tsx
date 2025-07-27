// src/app/(dashboard)/evaluasi/ubinan/UbinanScatterPlot.tsx
"use client";

import React, { useMemo, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { ScatterPlotDataRow } from './types';
import { getVariableLabel, getVariableUnit } from './scatter-plot-constants';

interface UbinanScatterPlotProps {
  data: ScatterPlotDataRow[];
  xVariable: string;
  yVariable: string;
  isLoading?: boolean;
}

// Hook to detect dark mode
function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ||
                          document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
      }
    };

    checkDarkMode();
    
    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);
    
    // Listen for class changes on html element
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      mediaQuery.removeEventListener('change', checkDarkMode);
      observer.disconnect();
    };
  }, []);

  return isDark;
}

export function UbinanScatterPlot({
  data,
  xVariable,
  yVariable,
  isLoading = false
}: UbinanScatterPlotProps) {
  
  const isDarkMode = useDarkMode();
  
  const chartOptions = useMemo(() => {
    const textColor = isDarkMode ? '#e5e7eb' : '#374151';
    const axisColor = isDarkMode ? '#6b7280' : '#9ca3af';
    const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
    
    if (!data || data.length === 0) {
      return {
        backgroundColor: 'transparent',
        title: {
          text: 'Tidak ada data untuk ditampilkan',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: textColor,
            fontSize: 14
          }
        }
      };
    }

    // Prepare data for scatter plot
    const scatterData = data.map(item => ({
      value: [item.x_value, item.y_value],
      name: item.nama_kabupaten,
      kab: item.kab,
      record_count: item.record_count,
      subround: item.subround,
      itemStyle: {
        color: getKabupatenColor(item.kab)
      },
      symbolSize: Math.max(8, Math.min(20, item.record_count / 2)), // Size based on record count
    }));

    // Calculate correlation coefficient
    const correlation = calculateCorrelation(data.map(d => d.x_value), data.map(d => d.y_value));
    
    // Generate trend line
    const trendLine = generateTrendLine(data);

    return {
      backgroundColor: 'transparent',
      title: {
        text: `Koefisien Korelasi: ${correlation.toFixed(3)}`,
        left: 'center',
        top: '2%',
        textStyle: {
          fontSize: 13,
          fontWeight: 'bold',
          color: correlation > 0.7 ? '#10b981' : correlation > 0.4 ? '#f59e0b' : '#ef4444'
        }
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'cross'
        },
        formatter: (params: { componentType: string; seriesType: string; data: { name: string; value: number[]; record_count: number; subround: number } }) => {
          if (params.componentType === 'series' && params.seriesType === 'scatter') {
            const item = params.data;
            
            // Helper function to format hasil ubinan with both ku/ha and kg/plot
            const formatHasilUbinan = (value: number, variable: string, label: string) => {
              if (variable === 'r701_per_ha') {
                const kuHa = Number(value).toLocaleString('id-ID', { maximumFractionDigits: 2 });
                const kgPlot = Number(value / 16).toLocaleString('id-ID', { maximumFractionDigits: 2 });
                return `
                  <div>${label}: ${kuHa} ku/ha</div>
                  <div>Hasil Ubinan per Plot: ${kgPlot} kg/plot</div>
                `;
              } else {
                return `<div>${label}: ${Number(value).toLocaleString('id-ID')} ${getVariableUnit(variable)}</div>`;
              }
            };
            
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${item.name}</div>
                ${formatHasilUbinan(item.value[0], xVariable, getVariableLabel(xVariable))}
                ${formatHasilUbinan(item.value[1], yVariable, getVariableLabel(yVariable))}
                <div>Subround: ${item.subround}</div>
              </div>
            `;
          }
          return String(params.data?.value || '');
        }
      },
      grid: {
        left: '12%',
        right: '8%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
        borderColor: gridColor,
        show: true
      },
      xAxis: {
        type: 'value',
        name: `${getVariableLabel(xVariable)} (${getVariableUnit(xVariable)})`,
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          color: textColor,
          fontSize: 12
        },
        axisLabel: {
          formatter: (value: number) => value.toLocaleString('id-ID'),
          color: axisColor
        },
        axisLine: {
          lineStyle: {
            color: axisColor
          }
        },
        splitLine: {
          lineStyle: {
            color: gridColor,
            opacity: 0.3
          }
        }
      },
      yAxis: {
        type: 'value',
        name: `${getVariableLabel(yVariable)} (${getVariableUnit(yVariable)})`,
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: textColor,
          fontSize: 12
        },
        axisLabel: {
          formatter: (value: number) => value.toLocaleString('id-ID'),
          color: axisColor
        },
        axisLine: {
          lineStyle: {
            color: axisColor
          }
        },
        splitLine: {
          lineStyle: {
            color: gridColor,
            opacity: 0.3
          }
        }
      },
      series: [
        {
          name: 'Data Ubinan',
          type: 'scatter',
          data: scatterData,
          emphasis: {
            focus: 'series'
          },
          markLine: {
            animation: false,
            lineStyle: {
              type: 'dashed',
              color: '#64748b',
              width: 2
            },
            tooltip: {
              formatter: 'Garis Trend'
            },
            data: [trendLine]
          }
        }
      ],
      legend: {
        show: false
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0
        },
        {
          type: 'inside',
          yAxisIndex: 0
        }
      ]
    };
  }, [data, xVariable, yVariable, isDarkMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Memuat data scatter plot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ReactECharts 
        option={chartOptions} 
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        opts={{ renderer: 'canvas' }}
        lazyUpdate={true}
      />
    </div>
  );
}

// Helper function to get consistent colors for kabupaten
function getKabupatenColor(kabCode: number): string {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6', '#f43f5e', '#22c55e', '#a855f7'
  ];
  return colors[kabCode % colors.length];
}

// Calculate Pearson correlation coefficient
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) return 0;
  return numerator / denominator;
}

// Generate trend line using linear regression
function generateTrendLine(data: ScatterPlotDataRow[]): { coord: [number, number] }[] | null {
  if (data.length < 2) return null;
  
  const x = data.map(d => d.x_value);
  const y = data.map(d => d.y_value);
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const minX = Math.min(...x);
  const maxX = Math.max(...x);
  
  return [
    { coord: [minX, slope * minX + intercept] },
    { coord: [maxX, slope * maxX + intercept] }
  ];
}
