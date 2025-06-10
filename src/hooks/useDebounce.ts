// Lokasi: src/hooks/useDebounce.ts
"use client";

import { useState, useEffect } from 'react';

// Custom hook untuk menunda pembaruan sebuah nilai
export function useDebounce<T>(value: T, delay: number): T {
  // State untuk menyimpan nilai yang sudah ditunda
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Atur timer untuk memperbarui nilai setelah 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Bersihkan timer setiap kali 'value' atau 'delay' berubah
    // Ini memastikan kita hanya menjalankan yang terakhir
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Hanya jalankan ulang efek jika value atau delay berubah

  return debouncedValue;
}