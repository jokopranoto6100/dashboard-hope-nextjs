// Lokasi: src/app/(dashboard)/produksi-statistik/atap-charts.tsx
"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AtapDataPoint } from "@/hooks/useAtapStatistikData";
import { BarChart3, LineChart as LineChartIcon } from "lucide-react";

interface ChartProps {
  data: AtapDataPoint[];
  level: 'provinsi' | 'kabupaten';
}

const KABUPATEN_MAP: { [key: string]: string } = {
    "6101": "Sambas", "6102": "Bengkayang", "6103": "Landak", "6104": "Mempawah",
    "6105": "Sanggau", "6106": "Ketapang", "6107": "Sintang", "6108": "Kapuas Hulu",
    "6109": "Sekadau", "6110": "Melawi", "6111": "Kayong Utara", "6112": "Kubu Raya",
    "6171": "Pontianak", "6172": "Singkawang"
};
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function AtapTimeSeriesChart({ data, level }: ChartProps) {
  // Logika baru: Hanya tampil jika filter level adalah 'provinsi'
  if (level !== 'provinsi') {
    return null; // Jangan render apapun jika bukan level provinsi
  }

  const chartData = data
    .sort((a, b) => (a.bulan || 0) - (b.bulan || 0))
    .map(d => ({
        name: d.bulan ? MONTH_NAMES[d.bulan - 1] : '',
        nilai: d.nilai
    }));
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Tren Bulanan Provinsi</CardTitle>
        <LineChartIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="nilai" name={data[0]?.indikator || 'Nilai'} stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function AtapComparisonChart({ data, level }: ChartProps) {
  // Logika baru: Hanya tampil jika filter level adalah 'kabupaten'
  if (level !== 'kabupaten') {
    return null; // Jangan render apapun jika bukan level kabupaten
  }

  const chartData = data.map(d => ({
    name: d.kode_kab ? (KABUPATEN_MAP[d.kode_kab] || d.kode_kab) : 'N/A',
    nilai: d.nilai
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Perbandingan Antar Kabupaten/Kota</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar dataKey="nilai" name={data[0]?.indikator || 'Nilai'} fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}