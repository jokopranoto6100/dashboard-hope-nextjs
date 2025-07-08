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
  harvestFilter?: number | null;
}

export function DetailKsaModal({ isOpen, onClose, kabupaten, harvestFilter }: ModalProps) {
  if (!kabupaten) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg md:text-xl">
            Rincian Panen Subsegmen: {kabupaten}
            {harvestFilter && ` (${harvestFilter}x Panen)`}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {harvestFilter 
              ? `Daftar subsegmen dengan ${harvestFilter}x panen di kabupaten ${kabupaten}. Gunakan kolom pencarian untuk memfilter ID subsegmen.`
              : `Daftar subsegmen beserta jadwal panen bulanan di kabupaten yang dipilih. Gunakan kolom pencarian untuk memfilter ID subsegmen.`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <DetailKsaModalContent kabupaten={kabupaten} harvestFilter={harvestFilter} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
