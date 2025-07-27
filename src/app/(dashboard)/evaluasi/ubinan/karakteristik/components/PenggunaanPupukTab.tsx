// src/app/(dashboard)/evaluasi/ubinan/karakteristik/components/PenggunaanPupukTab.tsx

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Beaker, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { type CharacteristicsSummary } from '../types';

interface PenggunaanPupukTabProps {
  data: CharacteristicsSummary;
  isLoading: boolean;
}

export function PenggunaanPupukTab({ data, isLoading }: PenggunaanPupukTabProps) {
  const penggunaanPupukData = useMemo(() => {
    return data.penggunaanPupuk.map(item => ({
      kategori: item.label,
      jumlah: item.value,
      persentase: item.percentage.toFixed(1)
    }));
  }, [data]);

  const colors = {
    primary: '#3B82F6',
    secondary: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B'
  };

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

  const stats = [
    {
      label: 'Menggunakan Pupuk',
      value: `${penggunaanPupukData.find(item => item.kategori === 'Ya')?.persentase || '0'}%`,
      icon: Beaker,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Rata-rata Luas Lahan',
      value: `${data.rataRataLuas.toFixed(2)} ha`,
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Penggunaan Pupuk - Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Beaker className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <CardTitle>Distribusi Penggunaan Pupuk</CardTitle>
              </div>
              <CardDescription>
                Persentase petani berdasarkan penggunaan pupuk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={penggunaanPupukData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="jumlah"
                  >
                    {penggunaanPupukData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.kategori === 'Ya' ? colors.success : colors.secondary} 
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="mt-4 space-y-2">
                {penggunaanPupukData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.kategori === 'Ya' ? colors.success : colors.secondary }}
                      />
                      <span className="text-gray-600 dark:text-gray-400">{item.kategori}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {item.jumlah.toLocaleString('id-ID')} ({item.persentase}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Statistics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <CardTitle>Ringkasan Penggunaan Pupuk</CardTitle>
              </div>
              <CardDescription>
                Analisis penggunaan pupuk dalam pertanian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {penggunaanPupukData.find(item => item.kategori === 'Ya')?.persentase || '0'}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Menggunakan Pupuk</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {penggunaanPupukData.find(item => item.kategori === 'Tidak')?.persentase || '0'}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tidak Menggunakan</div>
                  </div>
                </div>

                {/* Analysis Text */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Analisis</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Dari total {data.totalSampel.toLocaleString('id-ID')} sampel yang dianalisis, 
                    mayoritas petani {penggunaanPupukData.find(item => item.kategori === 'Ya')?.persentase || '0'}% 
                    telah menggunakan pupuk dalam kegiatan pertanian mereka. Ini menunjukkan 
                    kesadaran yang baik dalam meningkatkan produktivitas pertanian.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
