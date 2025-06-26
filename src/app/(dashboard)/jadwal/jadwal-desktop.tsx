// src/app/(dashboard)/jadwal/jadwal-desktop.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, ChevronDown, LocateFixed } from 'lucide-react';
import { type Kegiatan, type JadwalItem } from './jadwal.config';
import { getDaysInYear, getDayOfYear, getDurationInDays, colorVariants } from './jadwal.utils';

// --- INTERFACE PROPS ---

interface JadwalDesktopProps {
  data: Kegiatan[];
  tahun: number;
  onBlockClick: (item: JadwalItem) => void;
}

interface JadwalRowProps {
  kegiatan: Kegiatan;
  tahun: number;
  onBlockClick: (item: JadwalItem) => void;
  onToggleRow: (kegiatanNama: string) => void;
  expandedRows: string[];
  isSub?: boolean;
  viewMode: 'harian' | 'bulanan';
}

// --- KOMPONEN JADWAL ROW (Spesifik untuk Desktop) ---
function JadwalRow({
  kegiatan,
  tahun,
  onBlockClick,
  onToggleRow,
  expandedRows,
  isSub = false,
  viewMode,
}: JadwalRowProps) {
  const isExpanded = expandedRows.includes(kegiatan.kegiatan);
  const hasSub = kegiatan.subKegiatan && kegiatan.subKegiatan.length > 0;
  const daysInYear = getDaysInYear(tahun);

  let displayJadwal: JadwalItem[] = kegiatan.jadwal || [];

  // Jika parent memiliki sub-kegiatan, buat bar ringkasan abu-abu
  if (hasSub) {
    const allSubDates = kegiatan.subKegiatan!.flatMap(sub => sub.jadwal || []).map(j => ({
      start: new Date(j.startDate),
      end: new Date(j.endDate)
    }));

    if (allSubDates.length > 0) {
      const earliestStart = new Date(Math.min(...allSubDates.map(d => d.start.getTime())));
      const latestEnd = new Date(Math.max(...allSubDates.map(d => d.end.getTime())));

      displayJadwal = [{
        nama: `${kegiatan.kegiatan}`,
        keterangan: `Seluruh rentang kegiatan untuk ${kegiatan.kegiatan}`,
        startDate: earliestStart.toISOString().split('T')[0],
        endDate: latestEnd.toISOString().split('T')[0],
        warna: 'slate'
      }];
    }
  }

  return (
    <>
      <div className="flex border-t min-h-[48px]">
        <div className={`sticky left-0 z-10 flex items-center border-r bg-background p-2 text-sm font-semibold ${isSub ? 'pl-8' : ''}`} style={{ width: '200px', minWidth: '200px' }}>
          {hasSub && (
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onToggleRow(kegiatan.kegiatan)}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
          <span className={`truncate ${!hasSub && isSub ? 'pl-9' : 'pl-1'}`}>{kegiatan.kegiatan}</span>
        </div>

        <div className="relative flex-1">
          {displayJadwal.map((item, itemIdx) => {
            const startDate = new Date(item.startDate);
            const endDate = new Date(item.endDate);
            if (startDate.getFullYear() !== tahun) return null;

            const startDay = getDayOfYear(startDate);
            const duration = getDurationInDays(startDate, endDate);
            
            let left, width;
            if (viewMode === 'harian') {
              left = `${((startDay - 1) / daysInYear) * 100}%`;
              width = `${(duration / daysInYear) * 100}%`;
            } else {
              const startMonthFraction = startDate.getMonth() + ((startDate.getDate() - 1) / 31);
              const endMonthFraction = endDate.getMonth() + (endDate.getDate() / 31);
              const durationInMonths = endMonthFraction - startMonthFraction;
              left = `${(startMonthFraction / 12) * 100}%`;
              width = `${(durationInMonths / 12) * 100}%`;
            }

            return (
              <Tooltip key={itemIdx}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => onBlockClick(item)}
                    className={`absolute h-3/4 top-1/2 -translate-y-1/2 rounded-md text-white text-xs px-2 flex items-center cursor-pointer transition-all border ${colorVariants[item.warna]} ${hasSub ? 'opacity-100' : 'opacity-80'}`}
                    style={{ left, width, minWidth: '1px' }}
                  >
                    {(!hasSub || viewMode === 'bulanan') && <p className='truncate'>{item.nama}</p>}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='font-semibold'>{item.nama}</p>
                  <p className='text-muted-foreground'>
                    {startDate.toLocaleDateString('id-ID', { dateStyle: 'medium' })} - {endDate.toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {hasSub && isExpanded && (
        kegiatan.subKegiatan?.map(sub => (
          <JadwalRow key={sub.kegiatan} kegiatan={sub} tahun={tahun} onBlockClick={onBlockClick} onToggleRow={onToggleRow} expandedRows={expandedRows} isSub={true} viewMode={viewMode} />
        ))
      )}
    </>
  );
}


// --- KOMPONEN UTAMA TAMPILAN DESKTOP ---
export function JadwalDesktop({ data, tahun, onBlockClick }: JadwalDesktopProps) {
  // State yang spesifik untuk desktop dikelola di sini
  const [viewMode, setViewMode] = useState<'harian' | 'bulanan'>('bulanan');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const dailyCellWidth = 32;
  const isTodayVisible = tahun === new Date().getFullYear();
  const todayDayOfYear = isTodayVisible ? getDayOfYear(new Date()) : -1;
  const months = Array.from({ length: 12 }, (_, i) => ({ date: new Date(tahun, i, 1), days: new Date(tahun, i + 1, 0).getDate() }));

  const scrollToToday = () => {
    if (isTodayVisible && viewMode === 'harian' && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const today = new Date();
      const todayDayOfYear = getDayOfYear(today);
      const scrollPosition = ((todayDayOfYear - 1) * dailyCellWidth) - (container.clientWidth / 2) + (dailyCellWidth / 2);
      container.scrollTo({ left: scrollPosition > 0 ? scrollPosition : 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToToday();
  }, [viewMode, tahun]);

  const handleToggleRow = (kegiatanNama: string) => {
    setExpandedRows(prev => prev.includes(kegiatanNama) ? prev.filter(n => n !== kegiatanNama) : [...prev, kegiatanNama]);
  };
  
  const renderHeader = () => {
    if (viewMode === 'bulanan') {
      return (
        <div className="flex sticky top-0 z-20 bg-muted border-b">
          <div className="sticky left-0 z-30 flex items-center p-2 border-r bg-muted" style={{ width: '200px', minWidth: '200px' }}>
            <p className="text-base font-bold text-card-foreground">Kegiatan</p>
          </div>
          <div className="relative flex flex-1">
            {months.map((monthData, i) => (
              <div key={i} className="flex flex-col border-l" style={{ width: `calc(100% / 12)` }}>
                <div className="h-10 flex items-center justify-center text-sm font-semibold text-primary">
                  {monthData.date.toLocaleString('id-ID', { month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="flex sticky top-0 z-20">
        <div className="sticky left-0 z-30 flex flex-col border-r bg-background text-sm font-semibold" style={{ width: '200px', minWidth: '200px' }}>
          <div className="h-8 flex items-center p-2 border-b">Kegiatan</div>
          <div className="h-8 border-b sticky top-8 z-20 bg-background" />
        </div>
        <div className="relative flex flex-1">
          {months.map((monthData, i) => (
            <div key={i} className="flex flex-col border-l" style={{ width: `${monthData.days * dailyCellWidth}px` }}>
              <div className="sticky top-0 z-20 h-8 flex items-center justify-center text-base font-semibold text-primary bg-muted/30 border-b border-border rounded-sm">
                {monthData.date.toLocaleString('id-ID', { month: 'long' })}
              </div>
              <div className="flex h-8 border-b sticky top-8 z-20 bg-background">
                {Array.from({ length: monthData.days }).map((_, dayIdx) => {
                  const currentDate = new Date(tahun, monthData.date.getMonth(), dayIdx + 1);
                  const day = currentDate.getDay();
                  const isWeekend = day === 0 || day === 6;
                  const isToday = isTodayVisible && currentDate.toDateString() === new Date().toDateString();

                  return (
                    <div key={dayIdx} className={`w-[32px] shrink-0 text-center p-2 text-xs border-l relative ${isWeekend ? 'text-rose-500 font-semibold bg-muted' : 'text-muted-foreground'}`}>
                      {dayIdx + 1}
                      {isToday && (<div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 rounded-full border border-blue-500" /></div>)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className='flex items-center gap-2'>
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => { if (value) setViewMode(value as 'harian' | 'bulanan'); }} variant="outline">
            <ToggleGroupItem value="harian">Harian</ToggleGroupItem>
            <ToggleGroupItem value="bulanan">Bulanan</ToggleGroupItem>
          </ToggleGroup>
          {viewMode === 'harian' && isTodayVisible && (
              <Button variant="outline" size="sm" onClick={scrollToToday}>
                  <LocateFixed className="h-4 w-4 mr-2" />
                  Hari Ini
              </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={scrollContainerRef} className={viewMode === 'harian' ? 'overflow-x-auto relative' : 'relative'}>
          <div style={{ width: viewMode === 'harian' ? `${200 + getDaysInYear(tahun) * dailyCellWidth}px` : '100%' }}>
            {renderHeader()}
            <div>
              {data.map(kegiatan => (
                <JadwalRow 
                  key={kegiatan.kegiatan} 
                  kegiatan={kegiatan} 
                  tahun={tahun} 
                  onBlockClick={onBlockClick} 
                  onToggleRow={handleToggleRow} 
                  expandedRows={expandedRows} 
                  viewMode={viewMode} 
                />
              ))}
            </div>
            {viewMode === 'harian' && todayDayOfYear !== -1 && (
              <div className="absolute top-[64px] bottom-0 w-0.5 bg-red-500/50 z-20" style={{
                left: `calc(200px + ${(todayDayOfYear - 1) * dailyCellWidth}px + ${dailyCellWidth / 2}px)`
              }}></div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}