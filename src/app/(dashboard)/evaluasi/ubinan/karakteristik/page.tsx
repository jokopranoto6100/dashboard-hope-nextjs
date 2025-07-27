// src/app/(dashboard)/evaluasi/ubinan/karakteristik/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, MapPin } from 'lucide-react';

import { CharacteristicsTabNavigation, type CharacteristicsTab } from './components/CharacteristicsTabNavigation';
import { KarakteristikLahanTab } from './components/KarakteristikLahanTab';
import { VarietasBenihTab } from './components/VarietasBenihTab';
import { PenggunaanPupukTab } from './components/PenggunaanPupukTab';
import { DukunganProgramTab } from './components/DukunganProgramTab';
import { RingkasanTab } from './components/RingkasanTab';
import { useUbinanCharacteristics } from '@/hooks/useUbinanCharacteristics';
import { useYear } from '@/context/YearContext';

export default function KarakteristikSampelUbinanPage() {
  const searchParams = useSearchParams();
  const { selectedYear } = useYear(); // Gunakan YearContext
  
  // State management
  const [activeTab, setActiveTab] = useState<CharacteristicsTab>('karakteristik-lahan');
  const [komoditas, setKomoditas] = useState<string>('Padi Sawah'); // Sesuaikan dengan RPC test
  const [subround, setSubround] = useState<string>('1');
  const [kabupaten, setKabupaten] = useState<number | 'all'>('all');

  // Initialize from URL params
  useEffect(() => {
    const komoditasParam = searchParams.get('komoditas');
    const subroundParam = searchParams.get('subround');
    const kabupatenParam = searchParams.get('kabupaten');

    if (komoditasParam) setKomoditas(komoditasParam);
    if (subroundParam) setSubround(subroundParam);
    if (kabupatenParam && kabupatenParam !== 'all') {
      setKabupaten(parseInt(kabupatenParam));
    }
  }, [searchParams]);

  // Fetch characteristics data
  const { data, isLoading, error } = useUbinanCharacteristics({
    tahun: selectedYear,
    komoditas,
    subround,
    kabupaten
  });

  const renderTabContent = () => {
    if (!data) return null;

    switch (activeTab) {
      case 'karakteristik-lahan':
        return <KarakteristikLahanTab data={data} isLoading={isLoading} />;
      case 'varietas-benih':
        return <VarietasBenihTab data={data} isLoading={isLoading} />;
      case 'penggunaan-pupuk':
        return <PenggunaanPupukTab data={data} isLoading={isLoading} />;
      case 'dukungan-program':
        return <DukunganProgramTab data={data} isLoading={isLoading} />;
      case 'ringkasan':
        return <RingkasanTab data={data} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title and Description */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Karakteristik Sampel Ubinan
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                    Analisis komprehensif karakteristik lahan, varietas benih, penggunaan pupuk, dan dukungan program
                  </p>
                </div>
              </div>

              {/* Quick Info Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedYear && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    <Calendar className="w-3 h-3" />
                    {selectedYear}
                  </div>
                )}
                {komoditas && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {komoditas}
                  </div>
                )}
                {subround && (
                  <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                    Subround {subround}
                  </div>
                )}
                {data && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                    <MapPin className="w-3 h-3" />
                    {data.totalSampel.toLocaleString('id-ID')} Sampel
                  </div>
                )}
              </div>
            </div>

            {/* Simple Controls */}
            <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
              <select 
                value={komoditas} 
                onChange={(e) => setKomoditas(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="Padi Sawah">Padi Sawah</option>
                <option value="Padi Ladang">Padi Ladang</option>
                <option value="Jagung">Jagung</option>
              </select>
              
              <select 
                value={subround} 
                onChange={(e) => setSubround(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="1">Subround 1</option>
                <option value="2">Subround 2</option>
                <option value="3">Subround 3</option>
              </select>
              
              <select 
                value={kabupaten} 
                onChange={(e) => setKabupaten(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Semua Kabupaten</option>
                <option value="1">Sambas</option>
                <option value="2">Bengkayang</option>
                <option value="3">Landak</option>
                <option value="4">Mempawah</option>
                <option value="5">Sanggau</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="text-red-600 dark:text-red-400 text-sm font-medium">
                Error: {error}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <CharacteristicsTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-6"
        />

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
}
