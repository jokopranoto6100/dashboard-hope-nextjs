import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/context/AuthContext";
import { type Kegiatan } from '@/app/(dashboard)/jadwal/jadwal.config';

// Helper function untuk sorting
const getKegiatanDateRange = (kegiatan: Kegiatan): { earliestStart: Date | null, latestEnd: Date | null } => {
    const allDates: Date[] = [];
    const collectDates = (k: Kegiatan) => {
      k.jadwal?.forEach(j => {
        allDates.push(new Date(j.startDate));
        allDates.push(new Date(j.endDate));
      });
      k.subKegiatan?.forEach(collectDates);
    };
    collectDates(kegiatan);
    if (allDates.length === 0) return { earliestStart: null, latestEnd: null };
    const earliestStart = new Date(Math.min(...allDates.map(d => d.getTime())));
    const latestEnd = new Date(Math.max(...allDates.map(d => d.getTime())));
    return { earliestStart, latestEnd };
};

// Definisikan tipe untuk return value hook ini
interface JadwalDataHook {
  jadwalData: Kegiatan[];
  isLoading: boolean;
  error: string | null;
  mutate: () => void; // Fungsi untuk me-refresh data
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
      
      const sortedData = [...rawData].sort((a, b) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const rangeA = getKegiatanDateRange(a);
          const rangeB = getKegiatanDateRange(b);
          if (!rangeA.earliestStart || !rangeB.earliestStart) return 0;
          const statusA = today > rangeA.latestEnd! ? 'finished' : (today >= rangeA.earliestStart! ? 'active' : 'upcoming');
          const statusB = today > rangeB.latestEnd! ? 'finished' : (today >= rangeB.earliestStart! ? 'active' : 'upcoming');
          const statusPriority = { active: 1, upcoming: 2, finished: 3 };
          if (statusA !== statusB) {
            return statusPriority[statusA] - statusPriority[statusB];
          }
          switch (statusA) {
            case 'active':
              return rangeA.latestEnd!.getTime() - rangeB.latestEnd!.getTime();
            case 'upcoming':
              return rangeA.earliestStart!.getTime() - rangeB.earliestStart!.getTime();
            case 'finished':
              return rangeB.latestEnd!.getTime() - rangeA.latestEnd!.getTime();
            default:
              return 0;
          }
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