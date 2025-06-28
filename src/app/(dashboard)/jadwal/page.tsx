"use client";

import { useYear } from "@/context/YearContext";
import { useJadwalData } from "@/hooks/useJadwalData";
import { JadwalClient } from "./jadwal-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function JadwalPage() {
  const { selectedYear } = useYear();
  // DIUBAH: Ambil juga fungsi mutate dan beri nama alias 'refreshJadwal'
  const { jadwalData, isLoading, error, mutate: refreshJadwal } = useJadwalData(selectedYear);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Gagal memuat data jadwal: {error}</p>
      </div>
    );
  }

  // DIUBAH: Teruskan 'data', 'tahun', dan 'refreshJadwal' sebagai props
  return <JadwalClient data={jadwalData} tahun={selectedYear} refreshJadwal={refreshJadwal} />;
}