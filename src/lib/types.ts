export interface Annotation {
  id: number; created_at: string; user_id: string; komentar: string; id_indikator: number;
  tahun: number; bulan: number | null; kode_wilayah: string | null; user_fullname: string | null;
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
}

export interface LineChartRawData {
  mainData: MonthlyDataPoint[];
  compareData: MonthlyDataPoint[];
}

export interface ChartDataPoint {
  name: string;
  nilai?: number;
  kode_wilayah?: string;
  annotations: Annotation[]; // Made mandatory
  [key: string]: any; // Keep this for now as recharts payload can be complex
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