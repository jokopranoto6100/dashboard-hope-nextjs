// Lokasi: src/app/(dashboard)/produksi-statistik/line-chart-wrapper.tsx
"use client";

import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from 'recharts';

import { formatNumber, formatNumberInThousands } from "@/lib/utils";
import { ChartDataPoint } from "@/lib/types";

interface LineChartWrapperProps {
  data: ChartDataPoint[];
  dataKey1: string; // Misal: "2024"
  dataKey2?: string; // Misal: "2023"
  onPointClick: (payload: ChartDataPoint) => void;
  showLabels: boolean;
}

const CustomActiveDot = ({ cx, cy, payload, onPointClick }: { cx?: number; cy?: number; payload?: ChartDataPoint; onPointClick: (payload: ChartDataPoint) => void; }) => {
  if (typeof cx !== 'number' || typeof cy !== 'number' || !payload) {
    return null;
  }
  const hasAnnotations = payload.annotations && payload.annotations.length > 0;
  return (
    <g onClick={() => onPointClick(payload)} style={{ cursor: 'pointer' }}>
      <circle cx={cx} cy={cy} r={10} fill="#8884d8" fillOpacity={0.2} />
      <circle cx={cx} cy={cy} r={4} fill="#8884d8" />
      {hasAnnotations && (
        <foreignObject x={cx - 12} y={cy - 28} width={24} height={24} style={{ overflow: 'visible' }}>
          <div className="flex items-center justify-center w-full h-full">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md">
              {payload.annotations.length}
            </span>
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default function LineChartWrapper({ data, dataKey1, dataKey2, onPointClick, showLabels }: LineChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart 
        data={data}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis 
          fontSize={12} 
          tickFormatter={(value) => formatNumberInThousands(value)}
          width={45}
        />
        <Tooltip 
            formatter={(value: number) => formatNumber(value)}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend wrapperStyle={{fontSize: "12px"}} />
        <Line 
            type="monotone" 
            dataKey={dataKey1} 
            stroke="#8884d8" 
            strokeWidth={3}
            name={`Tahun ${dataKey1}`} 
            connectNulls 
            dot={false}
            activeDot={(props: unknown) => {
              const { cx, cy, payload } = props as { cx?: number; cy?: number; payload?: ChartDataPoint };
              return <CustomActiveDot cx={cx} cy={cy} payload={payload} onPointClick={onPointClick} />;
            }}
        >
          {showLabels && <LabelList dataKey={dataKey1} position="top" offset={10} formatter={(value: number) => formatNumber(value)} fontSize={10} />}
        </Line>
        {dataKey2 && (
            <Line 
                type="monotone" 
                dataKey={dataKey2} 
                stroke="#82ca9d" 
                strokeWidth={3}
                name={`Tahun ${dataKey2}`} 
                connectNulls 
                dot={false}
                activeDot={(props: unknown) => {
                  const { cx, cy, payload } = props as { cx?: number; cy?: number; payload?: ChartDataPoint };
                  return <CustomActiveDot cx={cx} cy={cy} payload={payload} onPointClick={onPointClick} />;
                }}
            >
                 {showLabels && <LabelList dataKey={dataKey2} position="top" offset={10} formatter={(value: number) => formatNumber(value)} fontSize={10} />}
            </Line>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}