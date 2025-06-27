/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useBahanProduksiData.ts

import { useState, useEffect } from 'react';
import type { SektorItem } from '@/app/(dashboard)/bahan-produksi/page'; // Impor tipe dari page

export function useBahanProduksiData() {
  const [data, setData] = useState<SektorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/bahan-produksi/sektors');
        if (!response.ok) {
          throw new Error('Gagal mengambil data dari server.');
        }
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []); // Dijalankan sekali saat komponen mount

  return { data, isLoading, error };
}