"use client";

import { useState, useEffect } from "react";
import { useYear } from '@/context/YearContext';
// Pastikan path impor ini benar
import { getSimtpKpiData, SimtpKpiData } from "@/app/(dashboard)/_actions/getSimtpKpiAction";

// BARU: Definisikan tipe untuk nilai yang dikembalikan oleh hook
export interface SimtpKpiDataHook {
  data: SimtpKpiData | null;
  isLoading: boolean;
  error: string | null;
  kegiatanId: string | null; // Properti yang akan kita teruskan
}

export function useSimtpKpiData(): SimtpKpiDataHook {
  const { selectedYear } = useYear();
  const [data, setData] = useState<SimtpKpiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kegiatanId, setKegiatanId] = useState<string | null>(null); // BARU: State untuk menyimpan ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setKegiatanId(null); // Reset ID setiap kali fetch
        
        // Panggil server action
        const result = await getSimtpKpiData(selectedYear);

        // Cek jika hasilnya ada
        if (result) {
          setData(result);
          // ✅ DIUBAH: Ambil kegiatanId dari hasil dan simpan di state
          setKegiatanId(result.kegiatanId); 
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]); // Dijalankan ulang ketika selectedYear berubah

  // ✅ DIUBAH: Kembalikan kegiatanId bersama dengan data lainnya
  return { data, isLoading, error, kegiatanId };
}