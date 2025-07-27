// src/components/charts/CharacteristicsPieChart.tsx

'use client';

import { memo } from 'react';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import ReactECharts from 'echarts-for-react';
import { CharacteristicsAggregated, COLOR_SCHEMES } from '@/app/(dashboard)/evaluasi/ubinan/karakteristik/types';

// Register ECharts components
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
  CanvasRenderer
]);

interface CharacteristicsPieChartProps {
  data: CharacteristicsAggregated[];
  title: string;
  colorScheme: keyof typeof COLOR_SCHEMES;
  className?: string;
}

export const CharacteristicsPieChart = memo(function CharacteristicsPieChart({
  data,
  title,
  colorScheme,
  className = ""
}: CharacteristicsPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 text-sm">
            Tidak ada data untuk ditampilkan
          </div>
        </div>
      </div>
    );
  }

  const colors = COLOR_SCHEMES[colorScheme];
  
  const option = {
    title: {
      text: title,
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151' // gray-700
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      left: 'center',
      itemGap: 15,
      textStyle: {
        fontSize: 11,
        color: '#6b7280' // gray-500
      },
      formatter: (name: string) => {
        const item = data.find(d => d.label === name);
        return item ? `${name} (${item.percentage.toFixed(1)}%)` : name;
      }
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 3,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#1f2937',
            formatter: '{b}\n{d}%'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        labelLine: {
          show: false
        },
        data: data.map((item, index) => ({
          value: item.value,
          name: item.label,
          itemStyle: {
            color: colors[index % colors.length]
          }
        }))
      }
    ],
    // Dark mode support
    backgroundColor: 'transparent',
    textStyle: {
      color: '#374151'
    }
  };

  // Dark mode option override
  const darkModeOption = {
    ...option,
    title: {
      ...option.title,
      textStyle: {
        ...option.title.textStyle,
        color: '#f3f4f6' // gray-100
      }
    },
    tooltip: {
      ...option.tooltip,
      backgroundColor: 'rgba(31, 41, 55, 0.95)', // gray-800
      borderColor: '#4b5563', // gray-600
      textStyle: {
        color: '#f3f4f6' // gray-100
      }
    },
    legend: {
      ...option.legend,
      textStyle: {
        ...option.legend.textStyle,
        color: '#9ca3af' // gray-400
      }
    },
    series: [
      {
        ...option.series[0],
        emphasis: {
          ...option.series[0].emphasis,
          label: {
            ...option.series[0].emphasis.label,
            color: '#f9fafb' // gray-50
          }
        }
      }
    ],
    textStyle: {
      color: '#f3f4f6'
    }
  };

  return (
    <div className={`w-full h-64 ${className}`}>
      <ReactECharts
        option={option}
        style={{ width: '100%', height: '100%' }}
        opts={{ renderer: 'canvas' }}
        className="[&_.dark_&]:hidden"
      />
      <ReactECharts
        option={darkModeOption}
        style={{ width: '100%', height: '100%' }}
        opts={{ renderer: 'canvas' }}
        className="hidden [&_.dark_&]:block"
      />
    </div>
  );
});
