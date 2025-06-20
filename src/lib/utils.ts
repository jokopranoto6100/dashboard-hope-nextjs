// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type VariantProps } from "class-variance-authority";
import { type badgeVariants } from "@/components/ui/badge"; // Pastikan path ini benar

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Definisikan tipe varian berdasarkan varian yang ada di badge.tsx
export type PercentageBadgeVariantType = VariantProps<
  typeof badgeVariants
>["variant"];

// Fungsi helper baru untuk mendapatkan varian Badge
export const getPercentageBadgeVariant = (
  percentage: number | string
): PercentageBadgeVariantType => {
  const value = parseFloat(percentage.toString());

  if (isNaN(value)) return "secondary"; // Varian 'secondary' untuk NaN (abu-abu)

  if (value < 50) return "destructive"; // Merah
  if (value < 75) return "warning"; // Kuning
  return "success"; // Hijau (untuk >= 75%)
};

// KABUPATEN_MAP untuk Kalimantan Barat
// Key adalah string untuk mengakomodasi kode seperti '71', '72'
// dan dicocokkan dengan output dari kolom 'kab' (integer) di DB
// yang akan dikonversi ke string di frontend saat lookup.
export const KABUPATEN_MAP: { [key: string]: string } = {
  '1': 'Sambas',
  '2': 'Bengkayang',
  '3': 'Landak',
  '4': 'Mempawah',
  '5': 'Sanggau',
  '6': 'Ketapang',
  '7': 'Sintang',
  '8': 'Kapuas Hulu',
  '9': 'Sekadau',
  '10': 'Melawi',
  '11': 'Kayong Utara',
  '12': 'Kubu Raya',
  '71': 'Kota Pontianak',
  '72': 'Kota Singkawang',
};

// Anda bisa menambahkan helper function di sini jika diperlukan, misalnya:
export const getNamaKabupaten = (kodeKab: number | string | null | undefined): string => {
  if (kodeKab === null || kodeKab === undefined) return "Tidak Diketahui";
  return KABUPATEN_MAP[String(kodeKab)] || "Kode Tidak Dikenal";
}

// Fungsi untuk mengurutkan array angka
const sortNumbers = (arr: number[]): number[] => arr.slice().sort((a, b) => a - b);

// Fungsi untuk menghitung median
export const calculateMedian = (arr: number[]): number | null => {
  if (!arr || arr.length === 0) return null;
  const sortedArr = sortNumbers(arr.filter(n => typeof n === 'number' && !isNaN(n)));
  if (sortedArr.length === 0) return null;
  const mid = Math.floor(sortedArr.length / 2);
  return sortedArr.length % 2 !== 0 ? sortedArr[mid] : (sortedArr[mid - 1] + sortedArr[mid]) / 2;
};

// Fungsi untuk menghitung kuartil (q=0.25 untuk Q1, q=0.75 untuk Q3)
export const calculateQuartile = (arr: number[], q: number): number | null => {
  if (!arr || arr.length === 0) return null;
  const sortedArr = sortNumbers(arr.filter(n => typeof n === 'number' && !isNaN(n)));
  if (sortedArr.length === 0) return null;
  
  const pos = (sortedArr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  
  if (sortedArr[base + 1] !== undefined) {
    return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
  } else {
    return sortedArr[base];
  }
};

// Fungsi untuk menghitung standar deviasi sampel
export const calculateStandardDeviation = (arr: number[]): number | null => {
  if (!arr || arr.length < 2) return null; // Perlu minimal 2 data point untuk std dev sampel
  const validArr = arr.filter(n => typeof n === 'number' && !isNaN(n));
  if (validArr.length < 2) return null;

  const mean = validArr.reduce((acc, val) => acc + val, 0) / validArr.length;
  const variance = validArr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (validArr.length - 1);
  return Math.sqrt(variance);
};

// Fungsi untuk menghitung rata-rata
export const calculateMean = (arr: number[]): number | null => {
  if (!arr || arr.length === 0) return null;
  const validArr = arr.filter(n => typeof n === 'number' && !isNaN(n));
  if (validArr.length === 0) return null;
  return validArr.reduce((acc, val) => acc + val, 0) / validArr.length;
};

// Fungsi untuk menghitung min
export const calculateMin = (arr: number[]): number | null => {
  if (!arr || arr.length === 0) return null;
  const validArr = arr.filter(n => typeof n === 'number' && !isNaN(n));
  if (validArr.length === 0) return null;
  return Math.min(...validArr);
};

// Fungsi untuk menghitung max
export const calculateMax = (arr: number[]): number | null => {
  if (!arr || arr.length === 0) return null;
  const validArr = arr.filter(n => typeof n === 'number' && !isNaN(n));
  if (validArr.length === 0) return null;
  return Math.max(...validArr);
};

export const formatNumber = (num: number | null | undefined, options?: Intl.NumberFormatOptions): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '-';
  }
  // Opsi default untuk menampilkan 2 digit desimal, bisa di-override.
  const defaultOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
  };
  // Jika angka adalah 0, tidak perlu desimal.
  if (num === 0) {
      defaultOptions.minimumFractionDigits = 0;
      defaultOptions.maximumFractionDigits = 0;
  }
  return new Intl.NumberFormat('id-ID', defaultOptions).format(num);
};