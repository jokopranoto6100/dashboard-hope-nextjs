// src/app/(dashboard)/evaluasi/ubinan/karakteristik/components/KarakteristikLahanTab.tsx

'use client';

import { memo } from 'react';
import { CharacteristicsPieChart } from '@/components/charts/CharacteristicsPieChart';
import { CharacteristicsSummary } from '../types';
import { 
  MapPin, 
  Ruler, 
  Sprout,
  Grid3X3
} from 'lucide-react';

interface KarakteristikLahanTabProps {
  data: CharacteristicsSummary;
  isLoading: boolean;
}

export const KarakteristikLahanTab = memo(function KarakteristikLahanTab({
  data,
  isLoading
}: KarakteristikLahanTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Sampel',
      value: data.totalSampel.toLocaleString('id-ID'),
      icon: MapPin,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Rata-rata Luas Lahan',
      value: `${data.rataRataLuas.toFixed(2)} ha`,
      icon: Ruler,
      color: 'text-green-600 dark:text-green-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Luas Lahan Chart */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Ruler className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Distribusi Luas Lahan
            </h3>
          </div>
          <CharacteristicsPieChart
            data={data.luasLahan}
            title="Kategori Luas Lahan"
            colorScheme="luasLahan"
          />
          <div className="mt-4 space-y-2">
            {data.luasLahan.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {item.count.toLocaleString('id-ID')} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Jenis Lahan Chart */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Distribusi Jenis Lahan
            </h3>
          </div>
          <CharacteristicsPieChart
            data={data.jenisLahan}
            title="Jenis Lahan"
            colorScheme="jenisLahan"
          />
          <div className="mt-4 space-y-2">
            {data.jenisLahan.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {item.count.toLocaleString('id-ID')} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cara Penanaman Chart */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sprout className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Cara Penanaman
            </h3>
          </div>
          <CharacteristicsPieChart
            data={data.caraPenanaman}
            title="Cara Penanaman"
            colorScheme="caraPenanaman"
          />
          <div className="mt-4 space-y-2">
            {data.caraPenanaman.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {item.count.toLocaleString('id-ID')} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Jajar Legowo Chart */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Grid3X3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sistem Jajar Legowo
            </h3>
          </div>
          <CharacteristicsPieChart
            data={data.jajarLegowo}
            title="Jajar Legowo"
            colorScheme="jajarLegowo"
          />
          <div className="mt-4 space-y-2">
            {data.jajarLegowo.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {item.count.toLocaleString('id-ID')} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
