// src/app/(dashboard)/evaluasi/ubinan/karakteristik/components/VarietasBenihTab.tsx

'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CharacteristicsSummary } from '../types';
import { 
  Wheat, 
  Gift
} from 'lucide-react';

interface VarietasBenihTabProps {
  data: CharacteristicsSummary;
  isLoading: boolean;
}

export const VarietasBenihTab = memo(function VarietasBenihTab({
  data,
  isLoading
}: VarietasBenihTabProps) {
  const colors = {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
  };

  const COLORS = [colors.success, colors.warning, colors.danger, colors.secondary, colors.primary];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jenis Varietas Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wheat className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <CardTitle>Jenis Varietas Benih</CardTitle>
              </div>
              <CardDescription>
                Distribusi jenis varietas yang digunakan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.jenisVarietas.map(item => ({ name: item.label, value: item.value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.jenisVarietas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                {data.jenisVarietas.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {item.count.toLocaleString('id-ID')} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bantuan Benih Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-green-600 dark:text-green-400" />
                <CardTitle>Bantuan Benih</CardTitle>
              </div>
              <CardDescription>
                Status penerimaan bantuan benih
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.bantuanBenih.map(item => ({ name: item.label, value: item.value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.bantuanBenih.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                {data.bantuanBenih.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {item.count.toLocaleString('id-ID')} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
});
