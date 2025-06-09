// src/app/(dashboard)/evaluasi/ubinan/DetailKabupatenModal.tsx
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Jika diperlukan
  // DialogFooter, // Jika diperlukan
} from "@/components/ui/dialog";
import { DetailKabupatenModalContent } from './DetailKabupatenModalContent'; // Akan kita buat

interface DetailKabupatenModalProps {
  isOpen: boolean;
  onClose: () => void;
  kabCode: number;
  namaKabupaten: string;
  selectedYear: number | null;
  selectedSubround: number | 'all';
  selectedKomoditas: string | null;
}

export function DetailKabupatenModal({
  isOpen,
  onClose,
  kabCode,
  namaKabupaten,
  selectedYear,
  selectedSubround,
  selectedKomoditas,
}: DetailKabupatenModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[90vh] flex flex-col"> {/* Lebar dan tinggi bisa disesuaikan */}
        <DialogHeader>
          <DialogTitle>Detail Penggunaan Benih & Pupuk: {namaKabupaten}</DialogTitle>
          <DialogDescription>
            Data per record untuk tahun {selectedYear}, komoditas {selectedKomoditas},
            {selectedSubround !== 'all' ? ` subround ${selectedSubround}` : ' semua subround'}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto"> {/* Membuat konten bisa di-scroll jika melebihi tinggi */}
          <DetailKabupatenModalContent
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