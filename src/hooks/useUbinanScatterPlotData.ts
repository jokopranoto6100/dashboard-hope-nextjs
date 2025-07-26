// src/hooks/useUbinanScatterPlotData.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';
import { ScatterPlotDataRow } from '../app/(dashboard)/evaluasi/ubinan/types';

export const useUbinanScatterPlotData = (
  xVariable: string,
  yVariable: string,
  selectedKabupaten: number | 'all' = 'all',
  selectedKomoditas: string = 'Padi Sawah',
  selectedSubround: string = 'all'
) => {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  
  const [scatterData, setScatterData] = useState<ScatterPlotDataRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScatterData = useCallback(async () => {
    if (!selectedYear || !selectedKomoditas || !selectedSubround || !xVariable || !yVariable) {
      setScatterData([]);
      return;
    }
    
    setIsLoadingData(true);
    setError(null);

    try {
      // Format komoditas untuk LIKE query - gunakan exact match dulu, jika tidak ada baru partial match
      const komoditasFilter = `%${selectedKomoditas}%`;
      
      // Fetch data dengan pagination untuk mengatasi limit 1000 default Supabase
      console.log(`Fetching scatter plot data for ${selectedYear} ${selectedKomoditas}...`);
      
      const allData = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;
      
      while (hasMore && page < 100) { // Max 100 pages = 100k records untuk safety
        const { data: pageData, error: pageError } = await supabase
          .rpc('get_ubinan_scatter_plot_data', {
            tahun_val: selectedYear,
            komoditas_val: komoditasFilter,
            subround_filter: selectedSubround === 'all' ? 'all' : String(selectedSubround),
            x_variable: xVariable,
            y_variable: yVariable,
          })
          .range(page * pageSize, (page + 1) * pageSize - 1);
          
        if (pageError) throw pageError;
        
        if (pageData && pageData.length > 0) {
          allData.push(...pageData);
          hasMore = pageData.length === pageSize;
          page++;
          
          // Log progress untuk page yang besar
          if (page % 5 === 0 || !hasMore) {
            console.log(`Fetched ${page} pages, total: ${allData.length} records`);
          }
        } else {
          hasMore = false;
        }
      }
      
      const rpcData = allData;
      console.log(`Successfully fetched ${rpcData.length} total data points from RPC`);
      
      let processedData = (rpcData || []).map((d: {
        kab: number;
        nama_kabupaten: string;
        x_value: number;
        y_value: number;
        record_count: number;
        komoditas: string;
        subround: number;
        tahun: number;
      }) => ({
        kab: d.kab,
        nama_kabupaten: d.nama_kabupaten,
        x_value: Number(d.x_value),
        y_value: Number(d.y_value),
        record_count: d.record_count,
        komoditas: d.komoditas,
        subround: d.subround,
        tahun: d.tahun,
      })) as ScatterPlotDataRow[];

      // Filter berdasarkan kabupaten jika dipilih
      if (selectedKabupaten && selectedKabupaten !== 'all') {
        const beforeFilterCount = processedData.length;
        processedData = processedData.filter(d => d.kab === selectedKabupaten);
        console.log(`Kabupaten filter applied: ${beforeFilterCount} -> ${processedData.length} records`);
      }

      console.log(`Final scatter plot data: ${processedData.length} points ready for visualization`);
      setScatterData(processedData);

    } catch (err: unknown) {
      console.error("Error fetching scatter plot data:", err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data scatter plot.';
      setError(errorMessage);
      setScatterData([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedYear, selectedSubround, selectedKomoditas, supabase, xVariable, yVariable, selectedKabupaten]);

  useEffect(() => {
    fetchScatterData();
  }, [fetchScatterData]);

  return { 
    scatterData,
    isLoadingData, 
    error,
    refreshData: fetchScatterData
  };
};
