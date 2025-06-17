// src/app/(dashboard)/evaluasi/ubinan/HasilUbinanDetailModal.tsx
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { HasilUbinanDetailModalContent } from './HasilUbinanDetailModalContent';

interface HasilUbinanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  kabCode: number;
  namaKabupaten: string;
  selectedYear: number | null;
  selectedSubround: number | 'all';
  selectedKomoditas: string | null;
}

export function HasilUbinanDetailModal({
  isOpen,
  onClose,
  kabCode,
  namaKabupaten,
  selectedYear,
  selectedSubround,
  selectedKomoditas,
}: HasilUbinanDetailModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl sm:max-w-2xl md:max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Detail Hasil Ubinan: {namaKabupaten}</DialogTitle>
          <DialogDescription>
            Daftar responden untuk tahun {selectedYear}, komoditas {selectedKomoditas},
            {selectedSubround !== 'all' ? ` subround ${selectedSubround}` : ' semua subround'}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto">
          <HasilUbinanDetailModalContent
            kabCode={kabCode}
            selectedYear={selectedYear}
            selectedSubround={selectedSubround}
            selectedKomoditas={selectedKomoditas}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}