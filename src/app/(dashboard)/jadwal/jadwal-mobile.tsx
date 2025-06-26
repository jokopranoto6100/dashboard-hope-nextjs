"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type JadwalItem, type Kegiatan } from "./jadwal.config";
import { useMemo, useRef } from "react";
import { CalendarClock } from "lucide-react";

interface GanttMiniProps {
  data: Kegiatan[];
  tahun: number;
  onBlockClick: (item: JadwalItem) => void;
}

const badgeColorVariants = {
  success: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  muted: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const colorMap: Record<JadwalItem['warna'], string> = {
  blue: '#3b82f6',
  green: '#22c55e',
  amber: '#f59e0b',
  sky: '#0ea5e9',
  slate: '#64748b',
};

// --- OPTIMALISASI: Helper function diekstrak agar bisa dipakai ulang ---
function getDiffInDays(d1: Date, d2: Date): number {
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function getActivityStatus(startDateStr: string, endDateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (today > endDate) return null;

  if (today >= startDate && today <= endDate) {
    const daysLeft = getDiffInDays(today, endDate);
    return { text: daysLeft === 0 ? "Berakhir Hari Ini" : `Berakhir dalam ${daysLeft} hari`, color: "success" };
  }

  const daysUntil = getDiffInDays(today, startDate);
  return { text: daysUntil === 1 ? "Dimulai Besok" : `Dimulai dalam ${daysUntil} hari`, color: "warning" };
}

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

type MergedItem = JadwalItem & { parentKegiatan: string; subKegiatan?: string };

export function GanttMiniMobile({ data, tahun, onBlockClick }: GanttMiniProps) {
  const monthRefs = useRef<Record<string, HTMLHeadingElement | null>>({});

  const groupedData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const items: MergedItem[] = [];

    data.forEach(k => {
      k.jadwal?.forEach(j => {
        if (new Date(j.endDate) < today) return;
        if (new Date(j.startDate).getFullYear() !== tahun && new Date(j.endDate).getFullYear() !== tahun) return;
        items.push({ ...j, parentKegiatan: k.kegiatan });
      });
      k.subKegiatan?.forEach(sub => {
        sub.jadwal?.forEach(j => {
          if (new Date(j.endDate) < today) return;
          if (new Date(j.startDate).getFullYear() !== tahun && new Date(j.endDate).getFullYear() !== tahun) return;
          items.push({ ...j, parentKegiatan: k.kegiatan, subKegiatan: sub.kegiatan });
        });
      });
    });

    const result: Record<string, MergedItem[]> = {};
    for (let m = 0; m < 12; m++) {
      const key = new Date(tahun, m).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
      result[key] = items.filter(item => {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        const firstDay = new Date(tahun, m, 1);
        const lastDay = new Date(tahun, m + 1, 0);
        return end >= firstDay && start <= lastDay;
      });
      if (result[key].length === 0) delete result[key];
    }

    return result;
  }, [data, tahun]);

  const months = Object.keys(groupedData);
  const now = new Date();
  const currentMonthKey = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const showScrollButton = tahun === now.getFullYear() && months.includes(currentMonthKey);
  
  // --- PENINGKATAN UX: Logika untuk penanda hari ini ---
  const todayForMarker = new Date();
  todayForMarker.setHours(0,0,0,0);

  const scrollToNow = () => {
    monthRefs.current[currentMonthKey]?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // --- PENINGKATAN UX: Tampilan "Empty State" jika tidak ada jadwal ---
  if (months.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-64">
        <CalendarClock className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold">Tidak Ada Jadwal</h3>
        <p className="text-sm">Tidak ditemukan jadwal kegiatan untuk tahun {tahun}.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-4 relative">
        {months.map(month => {
          const monthDate = new Date(`${month} 1`);
          const monthIndex = monthDate.getMonth();
          const daysInMonth = getDaysInMonth(monthIndex, tahun);
          
          const isCurrentMonth = todayForMarker.getMonth() === monthIndex && todayForMarker.getFullYear() === tahun;
          const todayDate = todayForMarker.getDate();

          return (
            <div key={month} className="mb-10">
              <h2 ref={el => { monthRefs.current[month] = el; }} className="text-lg font-semibold mb-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-2">{month}</h2>

              {groupedData[month].map((item, idx) => {
                const start = new Date(item.startDate);
                const end = new Date(item.endDate);
                const dayStart = Math.max(1, start.getMonth() === monthIndex ? start.getDate() : 1);
                const dayEnd = Math.min(
                  end.getMonth() === monthIndex ? end.getDate() : daysInMonth,
                  daysInMonth
                );
                const duration = getDiffInDays(start, end) + 1;
                const status = getActivityStatus(item.startDate, item.endDate);

                return (
                  <Card key={idx} onClick={() => onBlockClick(item)} className="mb-5 cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-medium flex-1">{item.nama}</p>
                        {status && (
                          <Badge className={`flex-shrink-0 ${badgeColorVariants[status.color as keyof typeof badgeColorVariants]}`}>{status.text}</Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs font-normal">
                        {item.parentKegiatan} {item.subKegiatan ? `> ${item.subKegiatan}` : ""}
                      </Badge>
                      <div className="text-muted-foreground text-sm">
                        {start.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} – {end.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      
                      {/* --- OPTIMALISASI KINERJA & AKSESIBILITAS --- */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="grid gap-[2px] mt-2"
                            style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))` }}
                            aria-label={`Durasi kegiatan: ${item.nama}, dari ${start.toLocaleDateString('id-ID')} hingga ${end.toLocaleDateString('id-ID')}`}
                          >
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                              const dayOfMonth = i + 1;
                              const isActive = dayOfMonth >= dayStart && dayOfMonth <= dayEnd;
                              const isToday = isCurrentMonth && dayOfMonth === todayDate;

                              return (
                                <div key={i} className="h-3 rounded-sm relative" style={{
                                    backgroundColor: isActive ? colorMap[item.warna] : 'rgba(148, 163, 184, 0.2)',
                                  }}>
                                  {/* --- PENINGKATAN UX: Penanda visual untuk hari ini --- */}
                                  {isToday && (
                                    <div className="absolute top-[-3px] bottom-[-3px] left-1/2 w-[2px] bg-red-500 rounded-full -translate-x-1/2" title="Hari Ini"/>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold">{item.nama}</p>
                          <p>Durasi: {duration} hari</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          );
        })}
        {showScrollButton && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button size="lg" className="rounded-full shadow-lg" onClick={scrollToNow}>
              <CalendarClock className="h-5 w-5 mr-2" /> Bulan Ini
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}