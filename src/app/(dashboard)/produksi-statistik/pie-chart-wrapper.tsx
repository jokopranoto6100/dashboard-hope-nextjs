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

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', 
    '#FF4560', '#00E396', '#775DD0', '#FEB019', '#FF66C3',
    '#03A9F4', '#4CAF50', '#F9C802', '#F9A3A4'
];

const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number }[];
  total: number;
}

const CustomTooltip = ({ active, payload, total }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? (data.value / total) * 100 : 0;
      return (
        <div className="p-2 text-sm bg-background/90 border rounded-md shadow-lg">
          <p className="font-semibold">{`${data.name}`}</p>
          <p className="text-muted-foreground">{`Nilai: ${formatNumber(data.value)}`}</p>
          <p className="text-muted-foreground">{`Kontribusi: ${percentage.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
};

export default function PieChartWrapper({ data }: PieChartWrapperProps) {
  const topData = data.slice(0, 6);
  const otherValue = data.slice(6).reduce((sum, item) => sum + item.value, 0);

  const chartData = [...topData];
  if (otherValue > 0) {
    chartData.push({ name: 'Lainnya', value: otherValue });
  }

  const totalForPie = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          paddingAngle={5}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip total={totalForPie} />} />
        
        <Legend 
            iconSize={10} 
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
                fontSize: '12px',
                paddingTop: '20px'
            }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}