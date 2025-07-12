import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/context/AuthContext";
import { type Kegiatan } from '@/app/(dashboard)/jadwal/jadwal.config';

// FUNGSI HELPER BARU YANG LEBIH CERDAS
const getKegiatanPriority = (kegiatan: Kegiatan, today: Date): { priority: number, date: Date } => {
  // Kumpulkan semua item jadwal dari kegiatan utama dan sub-kegiatannya
  const allJadwalItems = [
    ...(kegiatan.jadwal || []),
    ...(kegiatan.subKegiatan?.flatMap(sub => sub.jadwal || []) || [])
  ].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  if (allJadwalItems.length === 0) {
    return { priority: 9, date: new Date() }; // Prioritas terendah jika tidak ada jadwal
  }

  // Cari segmen jadwal yang sedang aktif atau berikutnya yang akan datang
  const currentOrNextSegment = allJadwalItems.find(item => today <= new Date(item.endDate));

  // KASUS 1: Semua segmen sudah selesai
  if (!currentOrNextSegment) {
    const lastEndDate = new Date(Math.max(...allJadwalItems.map(item => new Date(item.endDate).getTime())));
    return { priority: 4, date: lastEndDate }; // Prioritas: Selesai
  }

  const segmentStart = new Date(currentOrNextSegment.startDate);
  const segmentEnd = new Date(currentOrNextSegment.endDate);

  // KASUS 2: Sedang Aktif
  if (today >= segmentStart && today <= segmentEnd) {
    return { priority: 1, date: segmentEnd }; // Prioritas: Aktif (urutkan berdasarkan tanggal selesai terdekat)
  }

  // KASUS 3: Akan Datang
  if (today < segmentStart) {
    return { priority: 2, date: segmentStart }; // Prioritas: Akan Datang (urutkan berdasarkan tanggal mulai terdekat)
  }

  // Fallback, seharusnya tidak pernah tercapai
  return { priority: 9, date: new Date() };
};

interface JadwalDataHook {
  jadwalData: Kegiatan[];
  isLoading: boolean;
  error: string | null;
  mutate: () => void;
}

export const useJadwalData = (selectedYear: number): JadwalDataHook => {
  const { supabase } = useAuth();
  const [jadwalData, setJadwalData] = useState<Kegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJadwal = useCallback(async () => {
    if (!supabase) return;

    setIsLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc('get_jadwal_by_year', {
      target_year: selectedYear,
    });

    if (rpcError) {
      console.error("Error fetching schedule data:", rpcError);
      setError(rpcError.message);
    } else {
      const rawData = (data || []) as Kegiatan[];
      
      // DEBUG: Log raw data untuk melihat struktur yang diterima
      console.log('🔍 useJadwalData - Raw data received:', rawData);
      console.log('🔍 useJadwalData - Looking for kegiatan with ID b0b0b0b0-0002-4002-8002-000000000002');
      const targetKegiatan = rawData.find(k => k.id === 'b0b0b0b0-0002-4002-8002-000000000002');
      if (targetKegiatan) {
        console.log('🎯 useJadwalData - Found target kegiatan:', {
          id: targetKegiatan.id,
          kegiatan: targetKegiatan.kegiatan,
          jadwal: targetKegiatan.jadwal,
          jadwalLength: targetKegiatan.jadwal?.length
        });
      } else {
        console.log('❌ useJadwalData - Target kegiatan NOT FOUND in raw data');
        console.log('🔍 useJadwalData - Available kegiatan IDs:', rawData.map(k => k.id));
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // ✅ LOGIKA SORTING BARU DI SINI
      const sortedData = [...rawData].sort((a, b) => {
        const priorityA = getKegiatanPriority(a, today);
        const priorityB = getKegiatanPriority(b, today);

        // 1. Urutkan berdasarkan skor prioritas utama
        if (priorityA.priority !== priorityB.priority) {
          return priorityA.priority - priorityB.priority;
        }

        // 2. Jika prioritas sama (misal sama-sama "Aktif"), urutkan berdasarkan tanggal relevannya
        // Untuk yang sudah selesai, urutkan descending (yang baru selesai di atas)
        if (priorityA.priority === 4) { // Angka 4 adalah prioritas 'Selesai'
            return priorityB.date.getTime() - priorityA.date.getTime();
        }
        // Untuk yang lain, urutkan ascending (yang paling dekat di atas)
        return priorityA.date.getTime() - priorityB.date.getTime();
      });

      setJadwalData(sortedData);
    }
    setIsLoading(false);
  }, [selectedYear, supabase]);

  useEffect(() => {
    fetchJadwal();
  }, [fetchJadwal]);

  return { jadwalData, isLoading, error, mutate: fetchJadwal };
};