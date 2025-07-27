// src/app/(dashboard)/evaluasi/ubinan/karakteristik/components/DukunganProgramTab.tsx

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Gift, TrendingUp, Handshake } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { type CharacteristicsSummary } from '../types';

interface DukunganProgramTabProps {
  data: CharacteristicsSummary;
  isLoading: boolean;
}

export function DukunganProgramTab({ data, isLoading }: DukunganProgramTabProps) {
  const bantuanBenihData = useMemo(() => {
    return data.bantuanBenih.map(item => ({
      kategori: item.label,
      jumlah: item.value,
      persentase: item.percentage.toFixed(1)
    }));
  }, [data]);

  const bantuanPupukData = useMemo(() => {
    return data.bantuanPupuk.map(item => ({
      kategori: item.label,
      jumlah: item.value,
      persentase: item.percentage.toFixed(1)
    }));
  }, [data]);

  const anggotaPoktanData = useMemo(() => {
    return data.anggotaPoktan.map(item => ({
      kategori: item.label,
      jumlah: item.value,
      persentase: item.percentage.toFixed(1)
    }));
  }, [data]);

  const overviewStats = useMemo(() => {
    const totalBantuanBenih = bantuanBenihData.find(item => item.kategori === 'Ya')?.persentase || '0';
    const totalBantuanPupuk = bantuanPupukData.filter(item => 
      item.kategori !== 'Tidak' && item.kategori !== 'Tidak Diketahui'
    ).reduce((sum, item) => sum + parseFloat(item.persentase), 0).toFixed(1);
    const totalAnggotaPoktan = anggotaPoktanData.find(item => item.kategori === 'Ya')?.persentase || '0';

    return {
      bantuanBenih: totalBantuanBenih,
      bantuanPupuk: totalBantuanPupuk,
      anggotaPoktan: totalAnggotaPoktan
    };
  }, [bantuanBenihData, bantuanPupukData, anggotaPoktanData]);

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
        {[1, 2, 3].map((i) => (
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
      label: 'Bantuan Benih',
      value: `${overviewStats.bantuanBenih}%`,
      icon: Gift,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Bantuan Pupuk',
      value: `${overviewStats.bantuanPupuk}%`,
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Anggota Poktan',
      value: `${overviewStats.anggotaPoktan}%`,
      icon: Handshake,
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bantuan Benih */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-green-600 dark:text-green-400" />
                <CardTitle>Bantuan Benih</CardTitle>
              </div>
              <CardDescription>
                Distribusi penerima bantuan benih
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={bantuanBenihData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="jumlah"
                  >
                    {bantuanBenihData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                {bantuanBenihData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
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

        {/* Bantuan Pupuk */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <CardTitle>Bantuan Pupuk</CardTitle>
              </div>
              <CardDescription>
                Jenis bantuan pupuk yang diterima
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={bantuanPupukData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="jumlah"
                  >
                    {bantuanPupukData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                {bantuanPupukData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
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

        {/* Anggota Poktan */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <CardTitle>Keanggotaan Poktan</CardTitle>
              </div>
              <CardDescription>
                Status keanggotaan kelompok tani
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={anggotaPoktanData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="jumlah"
                  >
                    {anggotaPoktanData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                {anggotaPoktanData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
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
      </div>
    </div>
  );
}
