// src/app/(dashboard)/jadwal/jadwal-mobile.tsx (Dengan Badge Status Dinamis)
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Kegiatan, type JadwalItem } from "./jadwal.config";
import { useMemo, useRef } from "react";
import { CalendarDays, CalendarClock } from "lucide-react";

// --- [PENAMBAHAN] Palet warna untuk Badge Status ---
const badgeColorVariants = {
  success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80",
  warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 hover:bg-amber-100/80",
  muted: "border-transparent bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-100/80",
};

// --- [PENAMBAHAN] Fungsi Helper untuk menghitung status kegiatan ---
function getActivityStatus(startDateStr: string, endDateStr: string): { text: string; color: keyof typeof badgeColorVariants } | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalisasi tanggal hari ini

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Helper untuk menghitung selisih hari
  const getDiffInDays = (date1: Date, date2: Date) => {
    return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (today > endDate) {
    return { text: "Sudah Selesai", color: "muted" };
  }

  if (today >= startDate && today <= endDate) {
    const daysLeft = getDiffInDays(today, endDate);
    if (daysLeft === 0) {
      return { text: "Berakhir Hari Ini", color: "success" };
    }
    return { text: `Berakhir dalam ${daysLeft} hari`, color: "success" };
  }

  if (today < startDate) {
    const daysUntil = getDiffInDays(today, startDate);
    if (daysUntil === 0) {
      // Ini secara teknis tidak akan terjadi karena sudah ditangani oleh blok "sedang berjalan"
      return { text: "Dimulai Hari Ini", color: "warning" };
    }
    if (daysUntil === 1) {
      return { text: "Dimulai Besok", color: "warning" };
    }
    return { text: `Dimulai dalam ${daysUntil} hari`, color: "warning" };
  }

  return null; // Fallback jika tidak ada kondisi yang cocok
}


// --- Komponen Utama (tetap sama, hanya ada tambahan kecil di dalam render) ---
interface JadwalMobileProps {
  data: Kegiatan[];
  tahun: number;
  onBlockClick: (item: JadwalItem) => void;
}

type MergedJadwalItem = JadwalItem & { parentKegiatan: string; subKegiatan?: string };

const colorMap: Record<JadwalItem['warna'], string> = {
  blue: 'hsl(var(--blue-500, 221 83% 53%))',
  green: 'hsl(var(--green-500, 142 71% 45%))',
  amber: 'hsl(var(--amber-500, 48 96% 51%))',
  sky: 'hsl(var(--sky-500, 199 91% 51%))',
  slate: 'hsl(var(--slate-500, 215 20% 65%))',
};

export function JadwalListMobile({ data, tahun, onBlockClick }: JadwalMobileProps) {
  const monthRefs = useRef<Record<string, HTMLHeadingElement | null>>({});

  const groupedByMonth = useMemo(() => {
    // ... Logika useMemo tidak berubah
    const allJadwal: MergedJadwalItem[] = [];
    data.forEach(kegiatan => {
      if (kegiatan.jadwal) {
        kegiatan.jadwal.forEach(j => {
          if (new Date(j.startDate).getFullYear() === tahun) {
            allJadwal.push({ ...j, parentKegiatan: kegiatan.kegiatan });
          }
        });
      }
      if (kegiatan.subKegiatan) {
        kegiatan.subKegiatan.forEach(sub => {
          if (sub.jadwal) {
            sub.jadwal.forEach(j => {
              if (new Date(j.startDate).getFullYear() === tahun) {
                allJadwal.push({ ...j, parentKegiatan: kegiatan.kegiatan, subKegiatan: sub.kegiatan });
              }
            });
          }
        });
      }
    });
    allJadwal.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const grouped = allJadwal.reduce((acc, item) => {
      const monthKey = new Date(item.startDate).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(item);
      return acc;
    }, {} as Record<string, MergedJadwalItem[]>);
    return grouped;
  }, [data, tahun]);

  const months = Object.keys(groupedByMonth);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthKey = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  const showScrollButton = tahun === currentYear && months.includes(currentMonthKey);

  const scrollToCurrentMonth = () => {
    const targetElement = monthRefs.current[currentMonthKey];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="p-3 sm:p-4 relative">
      {months.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">Tidak ada jadwal kegiatan untuk tahun {tahun}.</p>
          </CardContent>
        </Card>
      ) : (
        months.map(month => (
          <div key={month} className="mb-8">
            <h2 
              ref={(el) => {
                monthRefs.current[month] = el;
              }}
              className="text-xl font-bold sticky top-0 bg-background/80 backdrop-blur-sm py-3 z-10"
            >
              {month}
            </h2>
            <div className="relative pl-5">
              <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2 ml-2.5"></div>
              {groupedByMonth[month].map((item, idx) => {
                // --- [PENAMBAHAN] Panggil fungsi status di sini ---
                const status = getActivityStatus(item.startDate, item.endDate);

                return (
                  <div key={idx} className="relative mb-6">
                    <div 
                      className="absolute left-0 top-2 h-3 w-3 rounded-full border-2 border-background"
                      style={{ backgroundColor: colorMap[item.warna], marginLeft: '-2px' }}
                    ></div>
                    <Card 
                      onClick={() => onBlockClick(item)} 
                      className="cursor-pointer hover:shadow-md transition-shadow duration-300"
                      style={{ borderLeft: `5px solid ${colorMap[item.warna]}` }}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-base text-card-foreground flex-1">{item.nama}</p>
                          {/* --- [PENAMBAHAN] Render Badge Status di sini --- */}
                          {status && (
                            <Badge className={badgeColorVariants[status.color]}>
                              {status.text}
                            </Badge>
                          )}
                        </div>
                        
                        <Badge variant="secondary">{item.parentKegiatan} {item.subKegiatan ? `> ${item.subKegiatan}` : ''}</Badge>
                        
                        <div className="flex items-center text-sm text-muted-foreground pt-2">
                          <CalendarDays className="h-4 w-4 mr-2 shrink-0" />
                          <span>
                            {new Date(item.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {new Date(item.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
      
      {showScrollButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="rounded-full shadow-lg"
            onClick={scrollToCurrentMonth}
          >
            <CalendarClock className="h-5 w-5 mr-2" />
            Bulan Ini
          </Button>
        </div>
      )}
    </div>
  );
}