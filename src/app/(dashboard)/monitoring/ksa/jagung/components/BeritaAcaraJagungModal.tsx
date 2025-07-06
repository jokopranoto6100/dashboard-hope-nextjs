"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { generateBeritaAcaraDocx } from "@/lib/docx-generator";
import { FileDown } from 'lucide-react';
import { toast } from "sonner";

export interface BaJagungData {
  id_segmen: string;
  subsegmen: string;
  nama_pencacah: string;
  nama_provinsi: string;
  nama_kabupaten: string;
  nama_kecamatan: string;
  nama_kepala_bps: string;
  nip_kepala_bps: string;
}

interface BeritaAcaraJagungModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BaJagungData[];
  selectedPetugas?: { nama: string; kode_kab: string };
  displayMonth?: string;
  selectedYear?: number;
}

export function BeritaAcaraJagungModal({ isOpen, onClose, data, selectedPetugas, displayMonth, selectedYear }: BeritaAcaraJagungModalProps) {
  const [alasan, setAlasan] = useState('');
  const [pengawas, setPengawas] = useState({ nama: '', nip: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBulkGenerate = async () => {
    if (!alasan.trim() || !pengawas.nama.trim()) {
        toast.error("Harap isi Nama Pengawas dan Alasan Tidak di Amati atau Kode 98.", {
          description: "Kedua field tersebut wajib diisi untuk membuat berita acara"
        });
        return;
    }
    if (data.length === 0) {
        toast.error("Tidak ada data untuk diproses.", {
          description: "Tidak ditemukan segmen dengan kode 98 untuk petugas ini"
        });
        return;
    }

    setIsGenerating(true);

    try {
        // Ekstrak data umum dari item pertama
        const firstItem = data[0];
        
        const docData = {
            nama_pencacah: firstItem?.nama_pencacah || null,
            nama_provinsi: firstItem?.nama_provinsi || null,
            nama_kabupaten: firstItem?.nama_kabupaten || null,
            nama_kepala_bps: firstItem?.nama_kepala_bps || null,
            nip_kepala_bps: firstItem?.nip_kepala_bps || null,
            listSegmen: data.map(item => ({
                id_segmen: item.id_segmen,
                subsegmen: item.subsegmen,
                nama_kecamatan: item.nama_kecamatan,
            })),
            alasan: alasan.trim(),
            nama_pengawas: pengawas.nama.trim(),
            nip_pengawas: pengawas.nip.trim(),
            bulan: displayMonth || '',
            tahun: selectedYear || new Date().getFullYear(),
        };

        await generateBeritaAcaraDocx(docData);
        toast.success(`Berhasil men-download Berita Acara untuk ${data.length} segmen KSA Jagung.`, {
          description: "File dokumen berita acara berhasil dibuat dan diunduh"
        });
        onClose();
        
        // Reset form
        setAlasan('');
        setPengawas({ nama: '', nip: '' });
    } catch (error) {
        console.error("Error generating BA:", error);
        toast.error("Gagal men-generate Berita Acara. Silakan coba lagi.", {
          description: "Terjadi kesalahan saat membuat dokumen berita acara"
        });
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg md:text-xl">🌽 Berita Acara KSA Jagung - {selectedPetugas?.nama}</DialogTitle>
          <DialogDescription className="text-sm">
            Daftar segmen dengan kode 98 untuk petugas {selectedPetugas?.nama} di kabupaten dengan kode {selectedPetugas?.kode_kab}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 px-1">
          {/* Form input untuk pengawas dan alasan */}
          <div className="grid grid-cols-1 gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama-pengawas" className="text-sm font-medium">Nama Pengawas *</Label>
                <Input
                  id="nama-pengawas"
                  value={pengawas.nama}
                  onChange={(e) => setPengawas(prev => ({...prev, nama: e.target.value}))}
                  placeholder="Masukkan nama pengawas"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nip-pengawas" className="text-sm font-medium">NIP Pengawas</Label>
                <Input
                  id="nip-pengawas"
                  value={pengawas.nip}
                  onChange={(e) => setPengawas(prev => ({...prev, nip: e.target.value}))}
                  placeholder="Masukkan NIP pengawas (opsional)"
                  className="text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alasan" className="text-sm font-medium">Alasan Tidak di Amati atau Kode 98 *</Label>
              <Input
                id="alasan"
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Contoh: Tanaman rusak akibat banjir"
                className="text-sm"
              />
            </div>
          </div>

          {/* Tabel data segmen */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center text-xs md:text-sm whitespace-nowrap">ID Segmen</TableHead>
                    <TableHead className="text-center text-xs md:text-sm whitespace-nowrap">Sub Segmen</TableHead>
                    <TableHead className="text-center text-xs md:text-sm whitespace-nowrap">Pencacah</TableHead>
                    <TableHead className="text-center text-xs md:text-sm whitespace-nowrap">Kecamatan</TableHead>
                    <TableHead className="text-center text-xs md:text-sm whitespace-nowrap">Kepala BPS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length > 0 ? (
                    data.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center text-xs md:text-sm">{item.id_segmen}</TableCell>
                        <TableCell className="text-center text-xs md:text-sm">{item.subsegmen}</TableCell>
                        <TableCell className="text-center text-xs md:text-sm truncate max-w-24 md:max-w-none" title={item.nama_pencacah}>{item.nama_pencacah}</TableCell>
                        <TableCell className="text-center text-xs md:text-sm truncate max-w-24 md:max-w-none" title={item.nama_kecamatan}>{item.nama_kecamatan}</TableCell>
                        <TableCell className="text-center text-xs md:text-sm truncate max-w-24 md:max-w-none" title={item.nama_kepala_bps}>{item.nama_kepala_bps}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-8">
                        Tidak ada data segmen dengan kode 98.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="text-sm">
            Batal
          </Button>
          <Button 
            onClick={handleBulkGenerate} 
            disabled={isGenerating || data.length === 0}
            className="bg-orange-600 hover:bg-orange-700 text-sm"
          >
            {isGenerating ? (
              "Generating..."
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Download BA</span>
                <span className="sm:hidden">BA</span> ({data.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
