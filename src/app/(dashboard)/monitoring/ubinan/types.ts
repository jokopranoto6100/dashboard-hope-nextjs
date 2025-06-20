// src/app/(dashboard)/monitoring/ubinan/types.ts

// Tipe untuk Data Padi
export interface PadiDataRow {
  nmkab: string;
  kab_sort_key: string;
  targetUtama: number;
  cadangan: number;
  realisasi: number;
  lewatPanen: number;
  faseGeneratif_G1?: number;
  faseGeneratif_G2?: number;
  faseGeneratif_G3?: number;
  faseGeneratif?: number;
  anomali: number;
  persentase: number | string;
  statuses: { [key: string]: number };
}

export interface PadiTotals {
  targetUtama: number;
  cadangan: number;
  realisasi: number;
  lewatPanen: number;
  faseGeneratif?: number;
  faseGeneratif_G1?: number;
  faseGeneratif_G2?: number;
  faseGeneratif_G3?: number;
  anomali: number;
  persentase: number;
  statuses?: { [key: string]: number };
}

// Tipe untuk Data Palawija
export interface PalawijaDataRow {
  nmkab: string;
  kab_sort_key: string;
  target: number;
  realisasi: number;
  clean: number;
  warning: number;
  error: number;
  persentase: number | string;
}

export interface PalawijaTotals {
  target: number;
  realisasi: number;
  clean: number;
  warning: number;
  error: number;
  persentase: number;
}