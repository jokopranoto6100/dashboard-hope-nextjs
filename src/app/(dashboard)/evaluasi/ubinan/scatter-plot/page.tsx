// src/app/(dashboard)/evaluasi/ubinan/scatter-plot/page.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { UbinanScatterPlot } from '../UbinanScatterPlot';
import { ScatterPlotVariableSelector } from '../ScatterPlotVariableSelector';
import { useUbinanScatterPlotData } from '@/hooks/useUbinanScatterPlotData';
import { useKomoditasOptions } from '@/hooks/useKomoditasOptions';
import { useSubroundOptions } from '@/hooks/useSubroundOptions';
import { useYear } from '@/context/YearContext';
import { generateScatterPlotTitle } from '../scatter-plot-constants';

export default function UbinanScatterPlotPage() {
  const { selectedYear } = useYear();
  const { komoditasOptions, isLoading: isLoadingKomoditas } = useKomoditasOptions();
  
  // Independent filters for scatter plot page
  const [selectedKomoditas, setSelectedKomoditas] = useState<string>('');
  const [selectedSubround, setSelectedSubround] = useState<string>('all');
  const [xVariable, setXVariable] = useState('r702'); // Default: Jumlah Rumpun per plot
  const [yVariable, setYVariable] = useState('r701_per_ha'); // Default: Hasil Ubinan per ha
  const [selectedKabupaten, setSelectedKabupaten] = useState<number | 'all'>('all');

  // Get subround options based on selected komoditas
  const { subroundOptions, isLoading: isLoadingSubround } = useSubroundOptions(selectedKomoditas);

  // Set default komoditas when options are loaded
  React.useEffect(() => {
    if (komoditasOptions.length > 0 && !selectedKomoditas) {
      // Default ke Padi Sawah jika ada, atau komoditas pertama
      const defaultKomoditas = komoditasOptions.find(opt => opt.value.includes('Padi Sawah')) || komoditasOptions[0];
      setSelectedKomoditas(defaultKomoditas.value);
    }
  }, [komoditasOptions, selectedKomoditas]);
  
  const { scatterData, isLoadingData, error } = useUbinanScatterPlotData(
    xVariable, 
    yVariable, 
    selectedKabupaten,
    selectedKomoditas,
    selectedSubround
  );

  const chartTitle = useMemo(() => 
    generateScatterPlotTitle(xVariable, yVariable), 
    [xVariable, yVariable]
  );

  return (
    <div className="space-y-4">
      {/* Header - following produksi-statistik pattern with dark mode */}
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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">Analisis Scatter Plot</h1>
                <div className="flex items-center gap-1 sm:gap-2 mt-1">
                  <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-white/60 dark:bg-white/50 rounded-full" />
                  <div className="h-0.5 sm:h-1 w-6 sm:w-8 bg-white/40 dark:bg-white/30 rounded-full" />
                  <div className="h-0.5 sm:h-1 w-3 sm:w-4 bg-white/20 dark:bg-white/15 rounded-full" />
                </div>
              </div>
            </div>
            <p className="text-white/90 dark:text-white/85 text-sm sm:text-base lg:text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
              <span>Analisis korelasi antar variabel dalam data ubinan</span>
              <span className="font-bold bg-white/20 dark:bg-white/15 px-2 py-1 rounded-lg text-white text-sm sm:text-base">{selectedYear || 'Pilih Tahun'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="mt-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: Stack filters vertically */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Komoditas Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Komoditas</label>
              <Select 
                value={selectedKomoditas} 
                onValueChange={setSelectedKomoditas}
                disabled={isLoadingKomoditas || komoditasOptions.length === 0}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder={
                    isLoadingKomoditas ? "Memuat..." : 
                    komoditasOptions.length === 0 ? "Tidak ada data" :
                    "Pilih Komoditas"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {komoditasOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subround Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subround</label>
              <Select 
                value={selectedSubround} 
                onValueChange={setSelectedSubround}
                disabled={isLoadingSubround || subroundOptions.length === 0 || !selectedKomoditas}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder={
                    !selectedKomoditas ? "Pilih komoditas dulu" :
                    isLoadingSubround ? "Memuat..." : 
                    subroundOptions.length === 0 ? "Tidak ada data" :
                    "Pilih Subround"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {subroundOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kabupaten Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kabupaten</label>
              <Select 
                value={selectedKabupaten.toString()} 
                onValueChange={(value) => setSelectedKabupaten(value === 'all' ? 'all' : parseInt(value))}
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

      {/* Variable Selector */}
      <ScatterPlotVariableSelector
        xVariable={xVariable}
        yVariable={yVariable}
        onXVariableChange={setXVariable}
        onYVariableChange={setYVariable}
      />

      {/* Loading Alert */}
      {(isLoadingData || isLoadingKomoditas || isLoadingSubround) && selectedYear && (
        <Alert>
          <TrendingUp className="h-4 w-4 animate-spin" />
          <AlertDescription>
            {isLoadingKomoditas ? 
              'Memuat daftar komoditas...' : 
              isLoadingSubround ?
              'Memuat daftar subround...' :
              'Memuat data scatter plot... Mengambil semua data dari database (dapat memakan waktu untuk dataset besar).'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Missing Filter Alert */}
      {(!selectedYear || !selectedKomoditas) && !isLoadingData && !isLoadingKomoditas && !isLoadingSubround && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {!selectedYear ? 
              'Silakan pilih tahun dari dropdown tahun di header.' :
              'Silakan pilih komoditas untuk melihat scatter plot.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Scatter Plot */}
      {selectedYear && selectedKomoditas && (
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-base sm:text-lg">Scatter Plot: {chartTitle}</span>
              </div>
              {/* Filter badges for mobile */}
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded">
                  {selectedKomoditas.includes('Padi') ? 'Padi Sawah' : selectedKomoditas}
                </span>
                {selectedSubround !== 'all' && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded">
                    SR {selectedSubround}
                  </span>
                )}
                {selectedKabupaten !== 'all' && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded">
                    {/* Find kabupaten name */}
                    {selectedKabupaten === 1 ? 'Sambas' :
                     selectedKabupaten === 2 ? 'Bengkayang' :
                     selectedKabupaten === 3 ? 'Landak' :
                     selectedKabupaten === 4 ? 'Mempawah' :
                     selectedKabupaten === 5 ? 'Sanggau' :
                     selectedKabupaten === 6 ? 'Ketapang' :
                     selectedKabupaten === 7 ? 'Sintang' :
                     selectedKabupaten === 8 ? 'Kapuas Hulu' :
                     selectedKabupaten === 9 ? 'Sekadau' :
                     selectedKabupaten === 10 ? 'Melawi' :
                     selectedKabupaten === 11 ? 'Kayong Utara' :
                     selectedKabupaten === 12 ? 'Kubu Raya' :
                     selectedKabupaten === 71 ? 'Pontianak' :
                     selectedKabupaten === 72 ? 'Singkawang' : 'Unknown'}
                  </span>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-4 px-4 sm:px-6">
            <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px]">
              <UbinanScatterPlot
                data={scatterData}
                xVariable={xVariable}
                yVariable={yVariable}
                isLoading={isLoadingData}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Summary */}
      {scatterData.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              Ringkasan Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {scatterData.length}
                </div>
                <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 font-medium">Data Points</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                  {new Set(scatterData.map(d => d.kab)).size}
                </div>
                <div className="text-xs sm:text-sm text-green-800 dark:text-green-300 font-medium">Kabupaten</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800 sm:col-span-2 lg:col-span-1">
                <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {scatterData.reduce((sum, d) => sum + d.record_count, 0).toLocaleString('id-ID')}
                </div>
                <div className="text-xs sm:text-sm text-purple-800 dark:text-purple-300 font-medium">Total Record</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
