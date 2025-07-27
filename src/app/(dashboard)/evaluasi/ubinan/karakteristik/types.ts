// src/app/(dashboard)/evaluasi/ubinan/karakteristik/types.ts

// ===================================================================
// TYPE DEFINITIONS UNTUK KARAKTERISTIK SAMPEL UBINAN
// ===================================================================

export interface UbinanCharacteristicsData {
  // Karakteristik Lahan & Tanam
  luas_lahan_kategori: string;
  jenis_lahan: string;
  cara_penanaman: string;
  jajar_legowo: string;
  
  // Varietas Benih
  jenis_varietas: string;
  
  // Penggunaan Pupuk
  menggunakan_pupuk: string;
  
  // Dukungan Program
  bantuan_benih: string;
  bantuan_pupuk: string;
  anggota_poktan: string;
  
  // Summary data
  jumlah_sampel: number;
  rata_rata_luas: number;
  
  // Metadata
  kab: number;
  nama_kabupaten: string;
  komoditas: string;
  subround: number;
  tahun: number;
}

// Aggregated data untuk visualisasi
export interface CharacteristicsAggregated {
  label: string;
  value: number;
  percentage: number;
  count: number;
}

// Summary data per kategori
export interface CharacteristicsSummary {
  luasLahan: CharacteristicsAggregated[];
  jenisLahan: CharacteristicsAggregated[];
  caraPenanaman: CharacteristicsAggregated[];
  jajarLegowo: CharacteristicsAggregated[];
  jenisVarietas: CharacteristicsAggregated[];
  penggunaanPupuk: CharacteristicsAggregated[];
  bantuanBenih: CharacteristicsAggregated[];
  bantuanPupuk: CharacteristicsAggregated[];
  anggotaPoktan: CharacteristicsAggregated[];
  totalSampel: number;
  rataRataLuas: number;
}

// Props untuk komponen tabs
export interface CharacteristicsTabProps {
  data: CharacteristicsSummary;
  isLoading: boolean;
  error?: string | null;
  selectedKomoditas: string;
}

// Chart data format untuk ECharts
export interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
  itemStyle?: {
    color: string;
  };
}

// Color schemes untuk berbagai kategori
export const COLOR_SCHEMES = {
  luasLahan: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  jenisLahan: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
  caraPenanaman: ['#3b82f6', '#10b981'],
  jajarLegowo: ['#10b981', '#ef4444'],
  jenisVarietas: ['#3b82f6', '#10b981', '#f59e0b'],
  penggunaanPupuk: ['#10b981', '#ef4444'],
  bantuan: ['#10b981', '#f59e0b', '#ef4444'],
  poktan: ['#10b981', '#ef4444']
} as const;

// Export utilities
export const LUAS_LAHAN_ORDER = ['Gurem (<0.5 ha)', 'Kecil (0.5-1 ha)', 'Sedang (1-2 ha)', 'Besar (>2 ha)'];
export const JENIS_LAHAN_ORDER = ['Sawah Irigasi', 'Sawah Tadah Hujan', 'Sawah Rawa Pasang Surut', 'Sawah Rawa Lebak', 'Bukan Sawah'];
export const YA_TIDAK_ORDER = ['Ya', 'Tidak', 'Tidak Diketahui'];
export const BANTUAN_PUPUK_ORDER = ['Ya, Gratis', 'Ya, Subsidi Harga', 'Tidak', 'Tidak Diketahui'];
