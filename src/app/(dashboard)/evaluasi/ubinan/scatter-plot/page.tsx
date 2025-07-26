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
      {/* Header */}
      <div className="flex items-center space-x-3">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analisis Scatter Plot Ubinan</h1>
          <p className="text-gray-600 mt-1">
            Analisis korelasi antar variabel dalam data ubinan
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Filter Data</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Komoditas Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Komoditas</label>
              <Select 
                value={selectedKomoditas} 
                onValueChange={setSelectedKomoditas}
                disabled={isLoadingKomoditas || komoditasOptions.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    isLoadingKomoditas ? "Memuat komoditas..." : 
                    komoditasOptions.length === 0 ? "Tidak ada komoditas" :
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subround</label>
              <Select 
                value={selectedSubround} 
                onValueChange={setSelectedSubround}
                disabled={isLoadingSubround || subroundOptions.length === 0 || !selectedKomoditas}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    !selectedKomoditas ? "Pilih komoditas dulu" :
                    isLoadingSubround ? "Memuat subround..." : 
                    subroundOptions.length === 0 ? "Tidak ada subround" :
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kabupaten</label>
              <Select 
                value={selectedKabupaten.toString()} 
                onValueChange={(value) => setSelectedKabupaten(value === 'all' ? 'all' : parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Kabupaten" />
                </SelectTrigger>
                <SelectContent>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
              <div className="w-full px-3 py-2 bg-gray-50 border rounded-md text-sm">
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
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Scatter Plot: {chartTitle}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UbinanScatterPlot
              data={scatterData}
              xVariable={xVariable}
              yVariable={yVariable}
              title={chartTitle}
              isLoading={isLoadingData}
            />
          </CardContent>
        </Card>
      )}

      {/* Data Summary */}
      {scatterData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ringkasan Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {scatterData.length}
                </div>
                <div className="text-sm text-blue-800">Total Data Points</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(scatterData.map(d => d.kab)).size}
                </div>
                <div className="text-sm text-green-800">Kabupaten Terwakili</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {scatterData.reduce((sum, d) => sum + d.record_count, 0).toLocaleString('id-ID')}
                </div>
                <div className="text-sm text-purple-800">Total Record Ubinan</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
