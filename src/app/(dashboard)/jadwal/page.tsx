"use client";

import { useYear } from "@/context/YearContext";
import { useJadwalData } from "@/hooks/useJadwalData";
import { JadwalClient } from "./jadwal-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function JadwalPage() {
  const { selectedYear } = useYear();
  // 'page.tsx' bertanggung jawab mengambil semua data yang dibutuhkan
  const { jadwalData, isLoading, error, mutate: refreshJadwal } = useJadwalData(selectedYear);

  // Menangani state loading di sini dengan enhanced UX
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-80" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-40" />
            </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
        <div className="text-center text-muted-foreground text-sm">
          Memuat jadwal kegiatan...
        </div>
      </div>
    );
  }

  // Menangani state error di sini dengan enhanced UX
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] border rounded-lg bg-muted/30">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-destructive mb-2">Gagal Memuat Data Jadwal</h3>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <button 
              onClick={() => refreshJadwal()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
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