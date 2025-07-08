export interface Annotation {
  id: string;
  user_id: string;
  komentar: string;
  id_indikator: number;
  tahun: number;
  bulan: number | null;
  kode_wilayah: string | null;
  created_at: string;
  user_fullname?: string; // ✅ Pastikan optional
}

export interface AugmentedAtapDataPoint {
  indikator: string;
  tahun: number;
  bulan: number | null;
  kode_wilayah: string;
  level_wilayah: 'provinsi' | 'kabupaten';
  nama_wilayah: string;
  nilai: number;
  satuan: string | null;
  kontribusi?: number;
  nilaiTahunLalu?: number | null;
  pertumbuhan?: number | null;
}

export interface MonthlyDataPoint {
  bulan: number | null;
  nilai: number;
  kode_wilayah: string;
  level_wilayah?: string; // Added level_wilayah
}

export interface LineChartRawData {
  mainData: MonthlyDataPoint[];
  compareData: MonthlyDataPoint[];
}

export interface ChartDataPoint {
  name: string;
  nilai: number | null | undefined;
  kode_wilayah: string | null | undefined;
  annotations: Annotation[];
  [key: string]: string | number | null | undefined | Annotation[];
}

export interface RechartsDotProps {
  cx: number;
  cy: number;
  payload: ChartDataPoint;
  // Recharts might pass other properties, so we can add an index signature if needed
  [key: string]: string | number | ChartDataPoint;
}

export interface BarChartClickPayload {
  activePayload?: {
    payload: ChartDataPoint;
  }[];
}

export interface PieChartData {
  name: string;
  value: number;
}

export interface PieChartTooltipPayload {
  name: string;
  value: number;
}

export interface BahanProduksiLink {
  id: string;
  label: string;
  href: string | null;
  icon_name: string | null;
  description: string | null;
  urutan: number;
  sektor_id?: string;
}

export interface BahanProduksiSektor {
  id: string;
  nama: string;
  icon_name: string | null;
  bg_color_class: string | null;
  urutan: number;
  links: BahanProduksiLink[];
}