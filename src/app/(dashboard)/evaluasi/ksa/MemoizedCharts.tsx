// src/app/(dashboard)/evaluasi/ksa/MemoizedCharts.tsx
"use client";

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';

interface MemoizedAreaChartProps {
  data: Record<string, number | string>[];
  keys: string[];
  colors: string[];
  monthNames: string[];
}

export const MemoizedAreaChart = React.memo(({ data, keys, colors, monthNames }: MemoizedAreaChartProps) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data} stackOffset="expand" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="bulan" 
        tickFormatter={(tick) => monthNames[tick - 1]} 
        fontSize={12} 
      />
      <YAxis 
        tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`} 
        fontSize={12} 
        width={45}
      />
      <Tooltip 
        formatter={(value: number, name: string, props) => {
          const payload = props.payload || {};
          const total = Object.keys(payload)
            .filter(key => key !== 'bulan')
            .reduce((sum, key) => sum + (payload[key] || 0), 0);
          const percentage = total > 0 ? (value / total) * 100 : 0;
          return [`${percentage.toFixed(2)}%`, name];
        }} 
      />
      <Legend wrapperStyle={{ fontSize: '12px' }} />
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
));

interface MemoizedLineChartProps {
  data: { name: string; Tanam: number; Panen: number }[];
}

export const MemoizedLineChart = React.memo(({ data }: MemoizedLineChartProps) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" fontSize={12} />
      <YAxis fontSize={12} width={45} />
      <Tooltip />
      <Legend wrapperStyle={{ fontSize: '12px' }} />
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
));

MemoizedAreaChart.displayName = 'MemoizedAreaChart';
MemoizedLineChart.displayName = 'MemoizedLineChart';
