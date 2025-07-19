"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type JadwalItem, type Kegiatan } from "./jadwal.config";
import { useMemo, useRef } from "react";
import { CalendarClock, Clock, CheckCircle2, AlertCircle } from "lucide-react";

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
  mint: '#10b981',
  coral: '#f43f5e',
  lavender: '#a855f7',
  peach: '#f97316',
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
    return { 
      text: daysLeft === 0 ? "Berakhir Hari Ini" : `Berakhir dalam ${daysLeft} hari`, 
      color: "success",
      icon: daysLeft <= 3 ? AlertCircle : CheckCircle2,
      priority: daysLeft <= 3 ? "high" : "normal"
    };
  }

  const daysUntil = getDiffInDays(today, startDate);
  return { 
    text: daysUntil === 1 ? "Dimulai Besok" : `Dimulai dalam ${daysUntil} hari`, 
    color: "warning",
    icon: daysUntil <= 2 ? Clock : CalendarClock,
    priority: daysUntil <= 2 ? "medium" : "normal"
  };
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
      // Hanya tambahkan jadwal dari kegiatan utama jika tidak memiliki subkegiatan
      if ((!k.subKegiatan || k.subKegiatan.length === 0) && k.jadwal) {
        k.jadwal.forEach(j => {
          if (new Date(j.endDate) < today) return;
          if (new Date(j.startDate).getFullYear() !== tahun && new Date(j.endDate).getFullYear() !== tahun) return;
          items.push({ ...j, parentKegiatan: k.kegiatan });
        });
      }
      
      // Tambahkan jadwal dari subkegiatan (ini yang akan ditampilkan untuk kegiatan yang memiliki subkegiatan)
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
  
  // --- PENINGKATAN UX: Tampilan "Empty State" dengan design yang lebih menarik ---
  if (months.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[400px]">
        <div className="bg-gradient-to-br from-muted/30 to-muted/60 rounded-full p-8 mb-6 shadow-lg">
          <CalendarClock className="w-20 h-20 opacity-60" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground mb-3">Tidak Ada Jadwal</h3>
        <p className="text-sm max-w-sm leading-relaxed mb-4">
          Tidak ditemukan jadwal kegiatan untuk tahun {tahun}. 
          Jadwal yang sudah berakhir tidak ditampilkan di sini.
        </p>
        <div className="text-xs bg-muted/50 px-3 py-2 rounded-full">
          Tahun aktif: {tahun}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="px-4 py-6 relative space-y-2 pb-24"> {/* Added bottom padding for FAB */}
        {months.map(month => {
          const monthDate = new Date(`${month} 1`);
          const monthIndex = monthDate.getMonth();
          const daysInMonth = getDaysInMonth(monthIndex, tahun);
          
          const isCurrentMonth = todayForMarker.getMonth() === monthIndex && todayForMarker.getFullYear() === tahun;
          const todayDate = todayForMarker.getDate();

          return (
            <div key={month} className="mb-12">
              <div className="sticky top-0 z-20 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl p-4 border border-border/30 shadow-lg backdrop-blur-md">
                  <h2 
                    ref={el => { monthRefs.current[month] = el; }} 
                    className="text-2xl font-bold text-foreground flex items-center justify-between"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {month}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground bg-white/60 dark:bg-slate-800/60 px-3 py-1 rounded-full shadow-sm">
                        {groupedData[month].length} kegiatan
                      </span>
                    </span>
                  </h2>
                </div>
              </div>

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
                  <Card 
                    key={idx} 
                    onClick={() => onBlockClick(item)} 
                    className={`mb-6 cursor-pointer active:scale-[0.98] relative overflow-hidden ${
                      status?.priority === "high" ? "ring-2 ring-red-200 border-red-200 shadow-red-100/50" : 
                      status?.priority === "medium" ? "ring-1 ring-amber-200 border-amber-200 shadow-amber-100/50" : 
                      "border-border/50"
                    } bg-gradient-to-br from-background to-muted/30`}
                    style={{ minHeight: "44px" }} // Ensure minimum touch target
                  >
                    {/* Decorative gradient bar */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1 opacity-80"
                      style={{ 
                        background: `linear-gradient(90deg, ${colorMap[item.warna]}, ${colorMap[item.warna]}88)` 
                      }}
                    />
                    <CardContent className="p-5 space-y-4 relative">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div 
                            className="w-3 h-3 rounded-full mt-1.5 shadow-sm"
                            style={{ backgroundColor: colorMap[item.warna] }}
                          />
                          <h3 className="font-semibold text-base flex-1 leading-tight">
                            {item.nama}
                          </h3>
                        </div>
                        {status && (
                          <Badge className={`flex-shrink-0 flex items-center gap-1 shadow-sm ${badgeColorVariants[status.color as keyof typeof badgeColorVariants]}`}>
                            <status.icon className="h-3 w-3" />
                            {status.text}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-muted/50">
                        {item.subKegiatan ? `📁 ${item.parentKegiatan} › ${item.subKegiatan}` : `📋 ${item.parentKegiatan}`}
                      </Badge>
                      <div className="flex items-center justify-between gap-2 text-muted-foreground text-sm bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="font-medium">
                            {start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} – {end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                          {duration} hari
                        </span>
                      </div>
                      
                      {/* Enhanced Timeline Grid */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>1</span>
                              <span>15</span>
                              <span>{daysInMonth}</span>
                            </div>
                            <div
                              className="grid gap-[1px] relative p-2 bg-muted/30 rounded-lg"
                              style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))` }}
                              aria-label={`Timeline: ${item.nama}, ${start.toLocaleDateString('id-ID')} hingga ${end.toLocaleDateString('id-ID')}`}
                            >
                              {Array.from({ length: daysInMonth }).map((_, i) => {
                                const dayOfMonth = i + 1;
                                const isActive = dayOfMonth >= dayStart && dayOfMonth <= dayEnd;
                                const isToday = isCurrentMonth && dayOfMonth === todayDate;
                                const isWeekend = new Date(tahun, monthIndex, dayOfMonth).getDay() % 6 === 0;

                                return (
                                  <div 
                                    key={i} 
                                    className={`h-4 rounded-sm relative transition-all duration-150 ${
                                      isWeekend && !isActive ? 'opacity-60' : ''
                                    }`} 
                                    style={{
                                      backgroundColor: isActive 
                                        ? colorMap[item.warna] 
                                        : isWeekend 
                                          ? 'rgba(148, 163, 184, 0.15)' 
                                          : 'rgba(148, 163, 184, 0.25)',
                                    }}
                                  >
                                    {/* Today Marker Enhanced with better visibility */}
                                    {isToday && (
                                      <div className="absolute -top-1 -bottom-1 left-1/2 w-[4px] bg-red-500 rounded-full -translate-x-1/2 shadow-lg animate-pulse" title="Hari Ini">
                                        <div className="absolute top-[-3px] left-1/2 w-2 h-2 bg-red-500 rounded-full -translate-x-1/2 border border-white"></div>
                                      </div>
                                    )}
                                    {/* Start/End markers */}
                                    {isActive && dayOfMonth === dayStart && (
                                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/80 rounded-l-sm"></div>
                                    )}
                                    {isActive && dayOfMonth === dayEnd && (
                                      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/80 rounded-r-sm"></div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-semibold">{item.nama}</p>
                            <p className="text-sm">Durasi: {duration} hari</p>
                            <p className="text-xs text-muted-foreground">
                              {start.toLocaleDateString('id-ID', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long' 
                              })} – {end.toLocaleDateString('id-ID', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long',
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
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
            <Button 
              size="lg" 
              className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-background/20 backdrop-blur-sm active:scale-95" 
              onClick={scrollToNow}
              style={{ minHeight: "60px", minWidth: "60px" }} // Better touch target
            >
              <CalendarClock className="h-6 w-6 mr-2" /> 
              <span className="font-medium">Bulan Ini</span>
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}