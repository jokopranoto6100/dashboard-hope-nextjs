// src/hooks/usePalawijaMonitoringData.ts
import { useState, useEffect } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';

interface PalawijaMonitoringDataHook {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  palawijaData: any[] | null;
  loadingPalawija: boolean;
  errorPalawija: string | null;
}

export const usePalawijaMonitoringData = (selectedYear: number, selectedSubround: string): PalawijaMonitoringDataHook => {
  const supabase = createClientComponentSupabaseClient();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [palawijaData, setPalawijaData] = useState<any[] | null>(null);
  const [loadingPalawija, setLoadingPalawija] = useState(true);
  const [errorPalawija, setErrorPalawija] = useState<string | null>(null);

  useEffect(() => {
    const fetchPalawijaData = async () => {
      setLoadingPalawija(true);
      setErrorPalawija(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let allRawPalawijaData: any[] = [];
      let currentPagePalawija = 0;
      const itemsPerPagePalawija = 1000;

      while (true) {
        let queryPalawija = supabase.from('ubinan_raw').select('*');
        queryPalawija = queryPalawija.eq('tahun', selectedYear);
        if (selectedSubround !== 'all') {
            queryPalawija = queryPalawija.eq('subround', parseInt(selectedSubround));
        }

        const { data, error } = await queryPalawija
          .range(currentPagePalawija * itemsPerPagePalawija, (currentPagePalawija + 1) * itemsPerPagePalawija - 1);

        if (error) {
          setErrorPalawija(error.message);
          toast.error('Gagal memuat data Ubinan Palawija', { description: error.message });
          setLoadingPalawija(false);
          return;
        }

        if (data) {
          allRawPalawijaData = allRawPalawijaData.concat(data);
        }

        if (!data || data.length < itemsPerPagePalawija) {
          break;
        }
        currentPagePalawija++;
      }

      setPalawijaData(allRawPalawijaData);
      setLoadingPalawija(false);
    };

    fetchPalawijaData();
  }, [selectedYear, selectedSubround, supabase]); // Dependency array

  return { palawijaData, loadingPalawija, errorPalawija };
};