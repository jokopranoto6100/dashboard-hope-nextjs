// src/app/(dashboard)/evaluasi/ubinan/types.ts

// Dari useUbinanDescriptiveStatsData.ts
export interface DescriptiveStatsRow {
  kab?: number;
  namaKabupaten: string;
  kodeKabupaten: string; // Added kodeKabupaten
  count: number;
  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  stdDev: number | null;
  q1: number | null;
  q3: number | null;
  comparisonCount?: number | null;
  comparisonMean?: number | null;
  meanChange?: number | null;
}

export interface BoxPlotStatsRow {
  kab?: number;
  namaKabupaten: string;
  boxPlotData: (number | null)[];
  outliers: (number | null)[][];
  count: number;
}

export interface UbinanDescriptiveStatsOutput {
  descriptiveStats: DescriptiveStatsRow[];
  boxPlotStats: BoxPlotStatsRow[];
  kalimantanBaratData: DescriptiveStatsRow | null;
}


// Dari usePenggunaanBenihDanPupukData.ts
export interface PupukDanBenihRow {
  kab?: number;
  namaKabupaten: string;
  avgR604_m2: number | null;
  avgBenihPerHa_kg_ha: number | null;
  avgUreaPerHa_kg_ha: number | null;
  avgTSPerHa_kg_ha: number | null;
  avgKCLperHa_kg_ha: number | null;
  avgNPKPerHa_kg_ha: number | null;
  avgKomposPerHa_kg_ha: number | null;
  avgOrganikCairPerHa_liter_ha: number | null;
  avgZAPerHa_kg_ha: number | null;
  comparison_avgR604_m2?: number | null;
  comparison_avgBenihPerHa_kg_ha?: number | null;
  comparison_avgUreaPerHa_kg_ha?: number | null;
  comparison_avgTSPerHa_kg_ha?: number | null;
  comparison_avgKCLperHa_kg_ha?: number | null;
  comparison_avgNPKPerHa_kg_ha?: number | null;
  comparison_avgKomposPerHa_kg_ha?: number | null;
  comparison_avgOrganikCairPerHa_liter_ha?: number | null;
  comparison_avgZAPerHa_kg_ha?: number | null;
  change_avgBenihPerHa_kg_ha?: number | null;
  change_avgUreaPerHa_kg_ha?: number | null;
  change_avgTSPerHa_kg_ha?: number | null;
  change_avgKCLperHa_kg_ha?: number | null;
  change_avgNPKPerHa_kg_ha?: number | null;
  change_avgKomposPerHa_kg_ha?: number | null;
  change_avgOrganikCairPerHa_liter_ha?: number | null;
  change_avgZAPerHa_kg_ha?: number | null;
}

// Dari detail-record-columns.tsx
export interface DetailRecordRowProcessed {
  r111: string | null;
  r604: number | null;
  r608_bibit_kg_mentah: number | null;
  r610_1_urea_kg_mentah: number | null;
  r610_2_tsp_kg_mentah: number | null;
  r610_3_kcl_kg_mentah: number | null;
  r610_4_npk_kg_mentah: number | null;
  r610_5_kompos_kg_mentah: number | null;
  r610_6_organik_cair_liter_mentah: number | null;
  r610_7_za_kg_mentah: number | null;
  benih_kg_ha: number | null;
  urea_kg_ha: number | null;
  tsp_kg_ha: number | null;
  kcl_kg_ha: number | null;
  npk_kg_ha: number | null;
  kompos_kg_ha: number | null;
  organik_cair_liter_ha: number | null;
  za_kg_ha: number | null;
  total_records: number;
}

// Dari hasil-ubinan-detail-columns.tsx
export interface HasilUbinanDetailRow {
  r111: string | null;
  r701: number | null;
  r702: number | null;
  id_segmen: string | null;
  subsegmen: string | null;
  total_records: number;
}

// For Dynamic Scatter Plot
export interface ScatterPlotDataRow {
  kab: number;
  nama_kabupaten: string;
  x_value: number;
  y_value: number;
  record_count: number;
  komoditas: string;
  subround: number;
  tahun: number;
}

export interface VariableOption {
  value: string;
  label: string;
  description?: string;
  unit?: string;
}

export interface ScatterPlotConfig {
  xVariable: string;
  yVariable: string;
  xLabel: string;
  yLabel: string;
  title: string;
}