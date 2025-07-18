// src/app/(dashboard)/evaluasi/ksa/MemoizedCharts.tsx
"use client";

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';

interface MemoizedAreaChartProps {
  data: Record<string, number | string>[];
  keys: string[];
  colors: string[];
  monthNames: string[];
  dynamicXAxis?: boolean;
  selectedYear?: number;
}

export const MemoizedAreaChart = React.memo(({ data, keys, colors, monthNames, dynamicXAxis = false, selectedYear }: MemoizedAreaChartProps) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  // Mapping fase ke label yang lebih deskriptif
  const phaseLabels: Record<string, string> = {
    'Fase 1': 'V1',
    'Fase 2': 'V2', 
    'Fase 3': 'Generatif',
    'Fase 4': 'Panen',
    'Fase 5': 'Persiapan Lahan',
    'Fase 6': 'Puso',
    'Fase 7': 'Sawah Bukan Padi',
    'Fase 8': 'Bukan Sawah'
  };
  
  // Only apply dynamic filtering if it's enabled AND we're viewing the current year
  const shouldFilter = dynamicXAxis && selectedYear === currentYear;
  
  const filteredData = shouldFilter ? data.filter(item => {
    const monthIndex = Number(item.bulan) - 1;
    return monthIndex <= currentMonth;
  }) : data;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={filteredData} stackOffset="expand" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="bulan" 
          tickFormatter={(tick) => monthNames[tick - 1]} 
          fontSize={11} 
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`} 
          fontSize={11} 
          width={40}
        />
        <Tooltip 
          formatter={(value: number, name: string, props) => {
            const payload = props.payload || {};
            const total = Object.keys(payload)
              .filter(key => key !== 'bulan')
              .reduce((sum, key) => sum + (payload[key] || 0), 0);
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const displayName = phaseLabels[name] || name;
            return [
              `${value.toLocaleString('id-ID')} (${percentage.toFixed(1)}%)`, 
              displayName
            ];
          }} 
          labelFormatter={(label) => `Bulan ${monthNames[label - 1]}`}
        />
        <Legend 
          wrapperStyle={{ fontSize: '10px' }} 
          formatter={(value) => phaseLabels[value] || value}
        />
        {keys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stackId="1"
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
});

interface MemoizedLineChartProps {
  data: { name: string; Tanam: number; Panen: number }[];
  dynamicXAxis?: boolean;
  fullMonthNames?: string[];
  selectedYear?: number;
}

export const MemoizedLineChart = React.memo(({ data, dynamicXAxis = false, fullMonthNames, selectedYear }: MemoizedLineChartProps) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  // Only apply dynamic filtering if it's enabled AND we're viewing the current year
  const shouldFilter = dynamicXAxis && selectedYear === currentYear;
  const filteredData = shouldFilter ? data.filter((item, index) => index <= currentMonth) : data;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={filteredData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          fontSize={11}
          angle={-45}
          textAnchor="end"
          height={60}
          interval={0}
          tickFormatter={(value) => {
            if (fullMonthNames) {
              const monthIndex = monthNames.indexOf(value);
              return monthIndex !== -1 ? fullMonthNames[monthIndex].substring(0, 3) : value;
            }
            return value;
          }}
        />
        <YAxis fontSize={11} width={40} />
        <Tooltip 
          labelFormatter={(value) => {
            if (fullMonthNames) {
              const monthIndex = monthNames.indexOf(value as string);
              return monthIndex !== -1 ? fullMonthNames[monthIndex] : value;
            }
            return value;
          }}
        />
        <Legend wrapperStyle={{ fontSize: '10px' }} />
        <Line 
          type="monotone" 
          name="Tanam" 
          dataKey="Tanam" 
          stroke="#3b82f6" 
          strokeWidth={2} 
        />
        <Line 
          type="monotone" 
          name="Panen" 
          dataKey="Panen" 
          stroke="#22c55e" 
          strokeWidth={2} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

MemoizedAreaChart.displayName = 'MemoizedAreaChart';
MemoizedLineChart.displayName = 'MemoizedLineChart';
