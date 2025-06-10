// Lokasi: src/app/(dashboard)/produksi-statistik/pie-chart-wrapper.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartWrapperProps {
  data: PieChartData[];
}

// Daftar warna yang akan digunakan untuk setiap irisan pie chart
const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', 
    '#FF4560', '#00E396', '#775DD0', '#FEB019', '#FF66C3',
    '#03A9F4', '#4CAF50', '#F9C802', '#F9A3A4'
];

const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

// Custom Tooltip untuk menampilkan persentase
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="p-2 text-sm bg-background/90 border rounded-md shadow-lg">
          <p className="font-semibold">{`${data.name}`}</p>
          <p className="text-muted-foreground">{`Nilai: ${formatNumber(data.value)}`}</p>
          <p className="text-muted-foreground">{`Kontribusi: ${(data.percent * 100).toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
};


export default function PieChartWrapper({ data }: PieChartWrapperProps) {
  // Hanya ambil 6 data teratas untuk ditampilkan di chart agar tidak terlalu ramai
  // Sisanya akan digabungkan menjadi "Lainnya"
  const topData = data.slice(0, 6);
  const otherValue = data.slice(6).reduce((sum, item) => sum + item.value, 0);

  const chartData = [...topData];
  if (otherValue > 0) {
    chartData.push({ name: 'Lainnya', value: otherValue });
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={60} // Ini yang membuatnya menjadi Donut Chart
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          paddingAngle={5}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
            iconSize={10} 
            layout="vertical" 
            verticalAlign="middle" 
            align="right" 
            wrapperStyle={{fontSize: '12px', lineHeight: '20px'}}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}