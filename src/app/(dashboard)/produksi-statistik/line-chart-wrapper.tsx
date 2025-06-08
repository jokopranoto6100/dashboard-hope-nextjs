/* eslint-disable @typescript-eslint/no-explicit-any */
// Lokasi: src/app/(dashboard)/produksi-statistik/line-chart-wrapper.tsx
"use client";
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

interface LineChartWrapperProps {
  data: any[];
  dataKey1: string;
  dataKey2?: string;
}

export default function LineChartWrapper({ data, dataKey1, dataKey2 }: LineChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis fontSize={12} tickFormatter={(value) => `${formatNumber(value)}`} />
        <Tooltip formatter={(value: number) => formatNumber(value)} />
        <Legend wrapperStyle={{fontSize: "12px"}} />
        <Line type="monotone" dataKey={dataKey1} stroke="#8884d8" name={`Tahun ${dataKey1}`} connectNulls />
        {dataKey2 && <Line type="monotone" dataKey={dataKey2} stroke="#82ca9d" name={`Tahun ${dataKey2}`} connectNulls />}
      </LineChart>
    </ResponsiveContainer>
  );
}