// src/app/(dashboard)/evaluasi/ubinan/karakteristik/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, MapPin, AlertCircle } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [subround, setSubround] = useState<string>('all');
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
    <div className="space-y-4">
      {/* Header - following scatter-plot pattern with gradient */}
      <div 
        className="relative overflow-hidden rounded-xl p-4 sm:p-6 text-white shadow-xl"
        style={{
          background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 50%, rgb(29, 78, 216) 100%)'
        }}
      >
        {/* Background pattern dengan dark mode adaptif */}
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent dark:from-white/3 dark:to-transparent" />
        
        {/* Decorative circles dengan dark mode adaptif */}
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 dark:bg-white/5 blur-xl" />
        <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5 dark:bg-white/3 blur-2xl" />
        
        <div className="relative flex flex-col gap-4 sm:gap-6 sm:flex-row sm:justify-between sm:items-center">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-white/20 dark:bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">Karakteristik Sampel Ubinan</h1>
                <div className="flex items-center gap-1 sm:gap-2 mt-1">
                  <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-white/60 dark:bg-white/50 rounded-full" />
                  <div className="h-0.5 sm:h-1 w-6 sm:w-8 bg-white/40 dark:bg-white/30 rounded-full" />
                  <div className="h-0.5 sm:h-1 w-3 sm:w-4 bg-white/20 dark:bg-white/15 rounded-full" />
                </div>
              </div>
            </div>
            <p className="text-white/90 dark:text-white/85 text-sm sm:text-base lg:text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
              <span>Analisis karakteristik lahan, varietas benih, penggunaan pupuk, dan dukungan program</span>
              <span className="font-bold bg-white/20 dark:bg-white/15 px-2 py-1 rounded-lg text-white text-sm sm:text-base">{selectedYear || 'Pilih Tahun'}</span>
            </p>
            
            {/* Quick Info Badges - moved here in header */}
            <div className="flex flex-wrap gap-2 pt-2">
              {komoditas && (
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 dark:bg-white/15 rounded-lg text-white text-xs font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {komoditas}
                </div>
              )}
              {subround && (
                <div className="px-2 py-1 bg-white/20 dark:bg-white/15 rounded-lg text-white text-xs font-medium">
                  {subround === 'all' ? 'Semua Subround' : `Subround ${subround}`}
                </div>
              )}
              {data && (
                <div className="flex items-center gap-1 px-2 py-1 bg-white/20 dark:bg-white/15 rounded-lg text-white text-xs font-medium">
                  <MapPin className="w-3 h-3" />
                  {data.totalSampel.toLocaleString('id-ID')} Sampel
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter grid layout following scatter-plot pattern */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Komoditas Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Komoditas</label>
              <Select value={komoditas} onValueChange={setKomoditas}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Pilih Komoditas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Padi Sawah">Padi Sawah</SelectItem>
                  <SelectItem value="Padi Ladang">Padi Ladang</SelectItem>
                  <SelectItem value="Jagung">Jagung</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Subround Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subround</label>
              <Select value={subround} onValueChange={setSubround}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Pilih Subround" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Subround</SelectItem>
                  <SelectItem value="1">Subround 1</SelectItem>
                  <SelectItem value="2">Subround 2</SelectItem>
                  <SelectItem value="3">Subround 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Kabupaten Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kabupaten</label>
              <Select 
                value={kabupaten.toString()} 
                onValueChange={(value) => setKabupaten(value === 'all' ? 'all' : parseInt(value))}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Pilih Kabupaten" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">Semua Kabupaten</SelectItem>
                  <SelectItem value="1">Sambas</SelectItem>
                  <SelectItem value="2">Bengkayang</SelectItem>
                  <SelectItem value="3">Landak</SelectItem>
                  <SelectItem value="4">Mempawah</SelectItem>
                  <SelectItem value="5">Sanggau</SelectItem>
                  <SelectItem value="6">Ketapang</SelectItem>
                  <SelectItem value="7">Sintang</SelectItem>
                  <SelectItem value="8">Kapuas Hulu</SelectItem>
                  <SelectItem value="9">Sekadau</SelectItem>
                  <SelectItem value="10">Melawi</SelectItem>
                  <SelectItem value="11">Kayong Utara</SelectItem>
                  <SelectItem value="12">Kubu Raya</SelectItem>
                  <SelectItem value="71">Pontianak</SelectItem>
                  <SelectItem value="72">Singkawang</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tahun Display */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tahun</label>
              <div className="w-full px-3 py-2 h-10 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-md text-sm flex items-center dark:text-gray-300">
                {selectedYear || 'Tahun belum dipilih'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Tab Navigation */}
      <CharacteristicsTabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
  );
}
