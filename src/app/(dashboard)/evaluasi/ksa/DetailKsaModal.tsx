// Lokasi: src/app/(dashboard)/evaluasi/ksa/DetailKsaModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DetailKsaModalContent } from "./DetailKsaModalContent";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  kabupaten: string | null;
}

export function DetailKsaModal({ isOpen, onClose, kabupaten }: ModalProps) {
  if (!kabupaten) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Rincian Panen Subsegmen: {kabupaten}</DialogTitle>
          <DialogDescription>
            Daftar subsegmen beserta jadwal panen bulanan di kabupaten yang dipilih.
          </DialogDescription>
        </DialogHeader>
        <DetailKsaModalContent kabupaten={kabupaten} />
      </DialogContent>
    </Dialog>
  );
}
