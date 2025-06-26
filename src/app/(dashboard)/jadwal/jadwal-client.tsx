// src/app/(dashboard)/jadwal/jadwal-client.tsx (Versi Ramping)
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { type Kegiatan, type JadwalItem } from './jadwal.config';

// Impor hook dan komponen-komponen tampilan
import { useIsMobile } from '@/hooks/use-mobile';
import { GanttMiniMobile } from './jadwal-mobile';
import { JadwalDesktop } from './jadwal-desktop';

export function JadwalClient({ data, tahun }: { data: Kegiatan[]; tahun: number }) {
  const isMobile = useIsMobile();
  
  // State yang dibagi bersama (shared state) tetap di sini.
  const [detailModal, setDetailModal] = useState<JadwalItem | null>(null);

  // Handler untuk state bersama
  const handleBlockClick = (item: JadwalItem) => setDetailModal(item);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Jadwal Kegiatan</h1>
          <p className="text-muted-foreground">Timeline kegiatan survei fungsi produksi tahun {tahun}.</p>
        </div>

        {/* Logika utama: pilih komponen berdasarkan ukuran layar */}
        {isMobile ? (
          <GanttMiniMobile data={data} tahun={tahun} onBlockClick={handleBlockClick} />
        ) : (
          <JadwalDesktop data={data} tahun={tahun} onBlockClick={handleBlockClick} />
        )}
        
        {/* Komponen Dialog tetap di sini karena digunakan oleh kedua tampilan */}
        <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
            <DialogContent>
            {detailModal && (
                <>
                <DialogHeader>
                    <DialogTitle>{detailModal.nama}</DialogTitle>
                    <DialogDescription>{detailModal.keterangan}</DialogDescription>
                </DialogHeader>
                <div className="py-2 space-y-2">
                    <p><strong>Tanggal Mulai:</strong> {new Date(detailModal.startDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                    <p><strong>Tanggal Selesai:</strong> {new Date(detailModal.endDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                </div>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Tutup</Button>
                </DialogClose>
                </>
            )}
            </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}