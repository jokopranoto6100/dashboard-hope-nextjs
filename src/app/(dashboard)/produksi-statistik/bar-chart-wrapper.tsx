// Lokasi: src/app/(dashboard)/produksi-statistik/bar-chart-wrapper.tsx
"use client";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatNumber } from "@/lib/utils";

import { ChartDataPoint, BarChartClickPayload } from "@/lib/types";

interface BarChartWrapperProps {
  data: ChartDataPoint[];
  dataKey1: string;
  dataKey2?: string;
  onClick: (payload: BarChartClickPayload) => void;
}

export default function BarChartWrapper({ data, dataKey1, dataKey2, onClick }: BarChartWrapperProps) {
  
  return (
    <>
      
      <div className="block lg:hidden">
        <ResponsiveContainer width="100%" height={data.length * 45}>
          <BarChart 
              data={data} 
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }} 
              onClick={onClick}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" fontSize={10} tickFormatter={(value) => formatNumber(value)} />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={80} 
              fontSize={10} 
              interval={0} 
              tick={{ textAnchor: 'end' }} 
            />
            <Tooltip formatter={(value: number) => formatNumber(value)} />
            <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}} />
            <Bar dataKey={dataKey1} fill="#8884d8" name={`Tahun ${dataKey1}`} radius={[0, 4, 4, 0]} />
            {dataKey2 && <Bar dataKey={dataKey2} fill="#82ca9d" name={`Tahun ${dataKey2}`} radius={[0, 4, 4, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </div>

      
      <div className="hidden lg:block">
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} onClick={onClick}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis fontSize={12} tickFormatter={(value) => `${formatNumber(value)}`} />
                <Tooltip formatter={(value: number) => formatNumber(value)} />
                <Legend wrapperStyle={{fontSize: "12px"}} />
                <Bar dataKey={dataKey1} fill="#8884d8" name={`Tahun ${dataKey1}`} radius={[4, 4, 0, 0]} />
                {dataKey2 && <Bar dataKey={dataKey2} fill="#82ca9d" name={`Tahun ${dataKey2}`} radius={[4, 4, 0, 0]} />}
            </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}