// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fungsi yang dipindahkan dan diekspor
export const getPercentageBadgeClass = (percentage: number | string): string => {
  const value = parseFloat(percentage.toString());
  if (isNaN(value)) return "bg-gray-200 text-gray-800"; // Default untuk NaN

  if (value < 50) return "bg-red-500 text-white"; // Merah
  if (value < 75) return "bg-yellow-500 text-yellow-900"; // Kuning (gunakan text lebih gelap untuk kontras)
  return "bg-green-500 text-white"; // Hijau (untuk >= 75%)
};