// src/hooks/useCountdown.ts
"use client";

import * as React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { type Kegiatan } from '@/app/(dashboard)/jadwal/jadwal.config';

// Helper function untuk menghitung selisih hari
const getDiffInDays = (d1: Date, d2: Date): number => {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

export interface CountdownStatus {
  text: string;
  color: string;
  icon: React.ElementType;
}

/**
 * Custom hook untuk menghitung status countdown berdasarkan jadwal kegiatan.
 * @param jadwal Objek kegiatan yang berisi jadwal.
 * @returns {CountdownStatus | null} Objek berisi teks, warna, dan ikon status, atau null jika tidak ada jadwal.
 */
export function useCountdown(jadwal?: Kegiatan): CountdownStatus | null {
  return React.useMemo(() => {
    if (!jadwal) return null;

    const allJadwalItems = [
      ...(jadwal.jadwal || []),
      ...(jadwal.subKegiatan?.flatMap(sub => sub.jadwal || []) || []),
    ];

    if (allJadwalItems.length === 0) return null;

    const allStartDates = allJadwalItems.map(j => new Date(j.startDate));
    const allEndDates = allJadwalItems.map(j => new Date(j.endDate));

    const earliestStart = new Date(Math.min(...allStartDates.map(d => d.getTime())));
    const latestEnd = new Date(Math.max(...allEndDates.map(d => d.getTime())));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today > latestEnd) {
      return { text: "Jadwal Telah Berakhir", color: "text-gray-500", icon: CheckCircle };
    }

    if (today >= earliestStart && today <= latestEnd) {
      const daysLeft = getDiffInDays(today, latestEnd);
      if (daysLeft === 0) {
        return { text: "Berakhir Hari Ini", color: "text-red-600 font-bold", icon: Clock };
      }
      return { text: `Berakhir dalam ${daysLeft} hari`, color: "text-green-600", icon: Clock };
    }

    if (today < earliestStart) {
      const daysUntil = getDiffInDays(today, earliestStart);
      if (daysUntil === 1) {
        return { text: "Dimulai Besok", color: "text-blue-600", icon: Clock };
      }
      return { text: `Dimulai dalam ${daysUntil} hari`, color: "text-blue-600", icon: Clock };
    }

    return null;
  }, [jadwal]);
}
