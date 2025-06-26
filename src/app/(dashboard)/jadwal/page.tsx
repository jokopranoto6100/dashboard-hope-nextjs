// src/app/(dashboard)/jadwal/page.tsx
"use client";

import { useMemo } from 'react';
import { dataJadwalHarian } from "./jadwal.config";
import { JadwalClient } from "./jadwal-client";
import { useYear } from '@/context/YearContext';
// 'JadwalItem' dihapus dari import karena tidak digunakan secara langsung di file ini
import { type Kegiatan } from './jadwal.config';

/**
 * Helper function untuk mendapatkan rentang tanggal paling awal dan paling akhir
 * dari sebuah kegiatan, termasuk semua sub-kegiatannya.
 */
const getKegiatanDateRange = (kegiatan: Kegiatan): { earliestStart: Date | null, latestEnd: Date | null } => {
  // Menggunakan 'const' karena variabel 'allDates' tidak pernah di-assign ulang
  const allDates: Date[] = [];

  // Kumpulkan semua tanggal dari jadwal utama dan sub-kegiatan
  const collectDates = (k: Kegiatan) => {
    // Ambil tanggal dari jadwal utama kegiatan
    k.jadwal?.forEach(j => {
      allDates.push(new Date(j.startDate));
      allDates.push(new Date(j.endDate));
    });
    // Lakukan rekursi untuk setiap sub-kegiatan
    k.subKegiatan?.forEach(collectDates);
  };

  collectDates(kegiatan);

  if (allDates.length === 0) {
    return { earliestStart: null, latestEnd: null };
  }

  const earliestStart = new Date(Math.min(...allDates.map(d => d.getTime())));
  const latestEnd = new Date(Math.max(...allDates.map(d => d.getTime())));

  return { earliestStart, latestEnd };
};


export default function JadwalPage() {
  const { selectedYear } = useYear();

  // Gunakan useMemo untuk mengurutkan data hanya sekali saat komponen dimuat
  const sortedData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalisasi waktu ke awal hari

    return [...dataJadwalHarian].sort((a, b) => {
      const rangeA = getKegiatanDateRange(a);
      const rangeB = getKegiatanDateRange(b);

      // Jika salah satu kegiatan tidak punya jadwal, jangan diurutkan
      if (!rangeA.earliestStart || !rangeB.earliestStart) return 0;

      // --- Tentukan Status Setiap Kegiatan ---
      const statusA = today > rangeA.latestEnd! ? 'finished' : (today >= rangeA.earliestStart! ? 'active' : 'upcoming');
      const statusB = today > rangeB.latestEnd! ? 'finished' : (today >= rangeB.earliestStart! ? 'active' : 'upcoming');
      
      const statusPriority = { active: 1, upcoming: 2, finished: 3 };

      // 1. Urutkan berdasarkan status (Aktif -> Mendatang -> Selesai)
      if (statusA !== statusB) {
        return statusPriority[statusA] - statusPriority[statusB];
      }

      // 2. Jika statusnya sama, gunakan logika pengurutan sekunder
      switch (statusA) {
        // Jika sama-sama 'aktif', urutkan berdasarkan tanggal selesai terdekat
        case 'active':
          return rangeA.latestEnd!.getTime() - rangeB.latestEnd!.getTime();
        
        // Jika sama-sama 'mendatang', urutkan berdasarkan tanggal mulai terdekat
        case 'upcoming':
          return rangeA.earliestStart!.getTime() - rangeB.earliestStart!.getTime();

        // Jika sama-sama 'selesai', urutkan berdasarkan yang paling baru selesai
        case 'finished':
          return rangeB.latestEnd!.getTime() - rangeA.latestEnd!.getTime();
        
        default:
          return 0;
      }
    });
  }, []); // Dependensi kosong agar hanya berjalan sekali

  // Hanya tampilkan jadwal untuk tahun yang dipilih
  const filteredAndSortedData = useMemo(() => {
      return sortedData.filter(kegiatan => {
        const range = getKegiatanDateRange(kegiatan);
        if (!range.earliestStart) return false;
        return range.earliestStart.getFullYear() === selectedYear || range.latestEnd!.getFullYear() === selectedYear;
      });
  }, [sortedData, selectedYear]);


  return <JadwalClient data={filteredAndSortedData} tahun={selectedYear} />;
}