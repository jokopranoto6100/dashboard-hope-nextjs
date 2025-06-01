// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type VariantProps } from "class-variance-authority"; // Impor jika diperlukan untuk tipe
import { type badgeVariants } from "@/components/ui/badge"; // Impor badgeVariants untuk tipenya

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Definisikan tipe varian berdasarkan varian yang ada di badge.tsx
// Ini akan membantu type-safety.
export type PercentageBadgeVariantType = VariantProps<typeof badgeVariants>["variant"];

// Fungsi helper baru untuk mendapatkan varian Badge
export const getPercentageBadgeVariant = (percentage: number | string): PercentageBadgeVariantType => {
  const value = parseFloat(percentage.toString());
  
  if (isNaN(value)) return "secondary"; // Varian 'secondary' untuk NaN (abu-abu)

  if (value < 50) return "destructive"; // Merah
  if (value < 75) return "warning";     // Kuning
  return "success";                     // Hijau (untuk >= 75%)
};

// Fungsi lama getPercentageBadgeClass bisa dihapus jika tidak digunakan lagi.
// export const getPercentageBadgeClass = (percentage: number | string): string => { ... };