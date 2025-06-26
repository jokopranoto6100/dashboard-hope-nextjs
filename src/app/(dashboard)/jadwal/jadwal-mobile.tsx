// src/app/(dashboard)/jadwal/jadwal-mobile.tsx (Logika Anti-Duplikasi)
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Kegiatan, type JadwalItem } from "./jadwal.config";
import { useMemo, useRef } from "react";
import { CalendarDays, CalendarClock } from "lucide-react";

// ... (badgeColorVariants dan getActivityStatus tetap sama)
const badgeColorVariants = {
    success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100/80",
    warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 hover:bg-amber-100/80",
    muted: "border-transparent bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-100/80",
};

function getActivityStatus(startDateStr: string, endDateStr: string): { text: string; color: keyof typeof badgeColorVariants } | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
  
    const getDiffInDays = (date1: Date, date2: Date) => {
      return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
    };
  
    if (today > endDate) return null;
  
    if (today >= startDate && today <= endDate) {
      const daysLeft = getDiffInDays(today, endDate);
      if (daysLeft === 0) {
        return { text: "Berakhir Hari Ini", color: "success" };
      }
      return { text: `Berakhir dalam ${daysLeft} hari`, color: "success" };
    }
  
    if (today < startDate) {
      const daysUntil = getDiffInDays(today, startDate);
      if (daysUntil === 1) {
        return { text: "Dimulai Besok", color: "warning" };
      }
      return { text: `Dimulai dalam ${daysUntil} hari`, color: "warning" };
    }
  
    return null;
}

// ... (Interface, colorMap tetap sama)
interface JadwalMobileProps {
    data: Kegiatan[];
    tahun: number;
    onBlockClick: (item: JadwalItem) => void;
}
  
type MergedJadwalItem = JadwalItem & { 
    parentKegiatan: string; 
    subKegiatan?: string;
    // [PERUBAHAN] Penanda status tampilan, bukan lagi 'type'
    isStarting: boolean; 
};
  
const colorMap: Record<JadwalItem['warna'], string> = {
    blue: 'hsl(var(--blue-500, 221 83% 53%))',
    green: 'hsl(var(--green-500, 142 71% 45%))',
    amber: 'hsl(var(--amber-500, 48 96% 51%))',
    sky: 'hsl(var(--sky-500, 199 91% 51%))',
    slate: 'hsl(var(--slate-500, 215 20% 65%))',
};


export function JadwalListMobile({ data, tahun, onBlockClick }: JadwalMobileProps) {
  const monthRefs = useRef<Record<string, HTMLHeadingElement | null>>({});

  // [PERUBAHAN BESAR] Logika `useMemo` dirombak total menjadi lebih sederhana dan akurat
  const timelineByMonth = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Kumpulkan semua kegiatan yang relevan (belum selesai) ke dalam satu array
    const allRelevantJadwal: MergedJadwalItem[] = [];
    data.forEach(kegiatan => {
        const processJadwal = (j: JadwalItem, sub?: Kegiatan) => {
            if (new Date(j.endDate) < today) return; // Filter kegiatan yang sudah lewat
            if (new Date(j.startDate).getFullYear() > tahun || new Date(j.endDate).getFullYear() < tahun) return; // Filter kegiatan di luar tahun

            allRelevantJadwal.push({
                ...j,
                parentKegiatan: kegiatan.kegiatan,
                subKegiatan: sub?.kegiatan,
                isStarting: false, // Default value, akan di-update nanti
            });
        };
        kegiatan.jadwal?.forEach(j => processJadwal(j));
        kegiatan.subKegiatan?.forEach(sub => sub.jadwal?.forEach(j => processJadwal(j, sub)));
    });

    // 2. Buat struktur data per bulan
    const grouped: Record<string, MergedJadwalItem[]> = {};
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthStart = new Date(tahun, monthIndex, 1);
        const monthEnd = new Date(tahun, monthIndex + 1, 0);
        const monthKey = monthStart.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

        grouped[monthKey] = [];

        // 3. Cek setiap kegiatan, apakah aktif di bulan ini?
        allRelevantJadwal.forEach(item => {
            const itemStart = new Date(item.startDate);
            const itemEnd = new Date(item.endDate);

            // Kondisi: kegiatan tumpang tindih dengan rentang bulan ini
            if (itemStart <= monthEnd && itemEnd >= monthStart) {
                grouped[monthKey].push({
                    ...item,
                    // Tentukan apakah ini 'starting' atau 'ongoing' untuk bulan INI
                    isStarting: itemStart.getMonth() === monthIndex && itemStart.getFullYear() === tahun
                });
            }
        });

        // Urutkan item di dalam bulan
        grouped[monthKey].sort((a,b) => (a.isStarting === b.isStarting) ? 0 : a.isStarting ? -1 : 1);
    }

    // Hapus bulan yang kosong
    Object.keys(grouped).forEach(key => {
        if (grouped[key].length === 0) delete grouped[key];
    });

    return grouped;
  }, [data, tahun]);
  
  // ... Sisa komponen tetap sama
  const months = Object.keys(timelineByMonth);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthKey = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const showScrollButton = tahun === currentYear && months.includes(currentMonthKey);

  const scrollToCurrentMonth = () => {
    monthRefs.current[currentMonthKey]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


  return (
    <div className="p-3 sm:p-4 relative">
      {months.length === 0 ? (
        <Card><CardContent className="p-6"><p className="text-muted-foreground text-center">Tidak ada jadwal yang aktif atau akan datang untuk tahun {tahun}.</p></CardContent></Card>
      ) : (
        months.map(month => (
          <div key={month} className="mb-8">
            <h2 ref={(el) => { monthRefs.current[month] = el; }} className="text-xl font-bold sticky top-0 bg-background/80 backdrop-blur-sm py-3 z-10">{month}</h2>
            
            <div className="relative pl-5">
              <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2 ml-2.5"></div>
              
              {timelineByMonth[month].map((item, idx) => {
                const status = getActivityStatus(item.startDate, item.endDate);
                // [PERUBAHAN] Menggunakan properti `isStarting`
                const isOngoing = !item.isStarting;

                return (
                  <div key={idx} className="relative mb-6">
                    <div 
                      className="absolute left-0 top-2 h-3 w-3 rounded-full border-2 border-background"
                      style={{ 
                        backgroundColor: isOngoing ? 'transparent' : colorMap[item.warna],
                        borderColor: isOngoing ? colorMap[item.warna] : 'var(--background)',
                        marginLeft: '-2px'
                      }}
                    ></div>
                    
                    <Card 
                      onClick={() => onBlockClick(item)} 
                      className={`cursor-pointer hover:shadow-md transition-shadow duration-300 ${isOngoing ? 'border-dashed bg-muted/40' : ''}`}
                      style={{ 
                        borderLeft: isOngoing ? `2px dashed ${colorMap[item.warna]}` : `5px solid ${colorMap[item.warna]}`
                      }}
                    >
                      <CardContent className="p-3 space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`font-bold text-base flex-1 ${isOngoing ? 'text-muted-foreground' : 'text-card-foreground'}`}>{item.nama}</p>
                          {status && (<Badge className={badgeColorVariants[status.color]}>{status.text}</Badge>)}
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <Badge variant={isOngoing ? "outline" : "secondary"} className="text-xs">{item.parentKegiatan} {item.subKegiatan ? `> ${item.subKegiatan}` : ''}</Badge>
                          <div className="flex items-center text-muted-foreground">
                            <CalendarDays className="h-4 w-4 mr-1.5 shrink-0" />
                            <span>{new Date(item.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {new Date(item.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
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
          <Button size="lg" className="rounded-full shadow-lg" onClick={scrollToCurrentMonth}><CalendarClock className="h-5 w-5 mr-2" />Bulan Ini</Button>
        </div>
      )}
    </div>
  );
}