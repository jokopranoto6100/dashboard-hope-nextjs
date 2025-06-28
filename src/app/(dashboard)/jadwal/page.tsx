"use client";

import { useYear } from "@/context/YearContext";
import { useJadwalData } from "@/hooks/useJadwalData";
import { JadwalClient } from "./jadwal-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function JadwalPage() {
  const { selectedYear } = useYear();
  // 'page.tsx' bertanggung jawab mengambil semua data yang dibutuhkan
  const { jadwalData, isLoading, error, mutate: refreshJadwal } = useJadwalData(selectedYear);

  // Menangani state loading di sini
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-80" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-40" />
            </div>
        </div>
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }

  // Menangani state error di sini
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] border rounded-lg bg-muted/30">
        <h3 className="text-xl font-semibold text-destructive mb-2">Gagal Memuat Data</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Jika sukses, teruskan semua data dan fungsi ke JadwalClient
  return (
    <JadwalClient
      data={jadwalData}
      tahun={selectedYear}
      refreshJadwal={refreshJadwal}
    />
  );
}