// Lokasi File: src/hooks/useAtapStatistikData.ts
import { createClientComponentSupabaseClient } from "@/lib/supabase";
import useSWR from 'swr';
import { useYear } from "@/context/YearContext";

// Definisikan tipe data yang akan kita terima dari view
export interface AtapDataPoint {
  indikator: string;
  satuan: string;
  deskripsi: string | null;
  tahun: number;
  bulan: number | null; // Null untuk data tahunan
  kode_kab: string | null; // Null untuk data provinsi
  nilai: number;
  level_data: string;
  level_wilayah: 'provinsi' | 'kabupaten';
  kode_wilayah: string;
}

// Tipe untuk state filter
interface FilterState {
  bulan: string; // "tahunan" atau "1"-"12"
  indikatorNama: string; // Kita akan pakai nama resmi untuk query
  level: 'provinsi' | 'kabupaten';
  tahunPembanding?: number | null; // Opsional untuk Fase 2
}

const supabase = createClientComponentSupabaseClient();

// Fungsi fetcher yang akan digunakan oleh SWR
const fetchAtapData = async (
  key: string, // SWR menggunakan key untuk caching
  filters: FilterState,
  selectedYear: number
) => {
  if (!filters.indikatorNama || !selectedYear) {
    return { dataUtama: [], dataPembanding: [] };
  }

  // Fungsi untuk membangun query berdasarkan tahun
  const buildQuery = (year: number) => {
    let query = supabase
      .from('laporan_atap_lengkap')
      .select('*')
      .eq('tahun', year)
      .eq('indikator', filters.indikatorNama)
      .eq('level_wilayah', filters.level);
    
    // Tentukan level_data berdasarkan pilihan bulan
    if (filters.bulan === 'tahunan') {
      query = query.like('level_data', 'Tahunan%'); // Mencocokkan "Tahunan Kabupaten" atau "Tahunan Provinsi"
    } else {
      query = query.like('level_data', 'Bulanan%'); // Mencocokkan "Bulanan Kabupaten" atau "Bulanan Provinsi"
      query = query.eq('bulan', parseInt(filters.bulan));
    }
    return query;
  };

  // Ambil data utama (tahun yang dipilih)
  const { data: dataUtama, error: errorUtama } = await buildQuery(selectedYear);
  if (errorUtama) throw errorUtama;
  
  // Ambil data pembanding jika ada
  let dataPembanding: AtapDataPoint[] = [];
  if (filters.tahunPembanding) {
    const { data: dataPembandingResult, error: errorPembanding } = await buildQuery(filters.tahunPembanding);
    if (errorPembanding) throw errorPembanding;
    dataPembanding = dataPembandingResult || [];
  }

  return { dataUtama: dataUtama || [], dataPembanding };
};

// Custom Hook utama
export function useAtapStatistikData(filters: FilterState) {
  const { selectedYear } = useYear();

  // Buat key unik untuk SWR agar query di-cache berdasarkan filter
  const swrKey = `atap_data_${selectedYear}_${filters.indikatorNama}_${filters.bulan}_${filters.level}_${filters.tahunPembanding || ''}`;

  const { data, error, isLoading } = useSWR(
    swrKey, // Key untuk caching
    () => fetchAtapData(swrKey, filters, selectedYear), // Fungsi fetcher
    {
      revalidateOnFocus: false, // Tidak perlu re-fetch saat window di-fokus
      shouldRetryOnError: false, // Tidak perlu coba lagi jika error
    }
  );

  return {
    data: data?.dataUtama,
    dataPembanding: data?.dataPembanding,
    isLoading,
    error,
  };
}