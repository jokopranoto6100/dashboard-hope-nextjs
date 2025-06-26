"use client"; // Tambahkan ini karena kita pakai hook

import { dataJadwalHarian } from "./jadwal.config";
import { JadwalClient } from "./jadwal-client";
import { useYear } from '@/context/YearContext';

export default function JadwalPage() {
  const { selectedYear } = useYear();

  return <JadwalClient data={dataJadwalHarian} tahun={selectedYear} />;
}
