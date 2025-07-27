// src/app/(dashboard)/evaluasi/ubinan/karakteristik/components/VarietasBenihTab.tsx

'use client';

import { memo } from 'react';
import { CharacteristicsPieChart } from '@/components/charts/CharacteristicsPieChart';
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
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
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

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jenis Varietas Chart */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wheat className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Jenis Varietas Benih
            </h3>
          </div>
          <CharacteristicsPieChart
            data={data.jenisVarietas}
            title="Jenis Varietas"
            colorScheme="jenisVarietas"
          />
          <div className="mt-4 space-y-2">
            {data.jenisVarietas.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {item.count.toLocaleString('id-ID')} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bantuan Benih Chart */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Bantuan Benih
            </h3>
          </div>
          <CharacteristicsPieChart
            data={data.bantuanBenih}
            title="Bantuan Benih"
            colorScheme="bantuan"
          />
          <div className="mt-4 space-y-2">
            {data.bantuanBenih.map((item, index) => (
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

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Wheat className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            Ringkasan Varietas dan Bantuan Benih
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
              Distribusi Jenis Varietas:
            </h4>
            <div className="space-y-1">
              {data.jenisVarietas.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-amber-700 dark:text-amber-300">{item.label}</span>
                  <span className="font-medium text-amber-900 dark:text-amber-100">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
              Tingkat Bantuan Benih:
            </h4>
            <div className="space-y-1">
              {data.bantuanBenih.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-amber-700 dark:text-amber-300">{item.label}</span>
                  <span className="font-medium text-amber-900 dark:text-amber-100">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
