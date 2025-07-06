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

export interface BaData {
  id_segmen: string;
  subsegmen: string;
  nama_pencacah: string;
  nama_provinsi: string;
  nama_kabupaten: string;
  nama_kecamatan: string;
  nama_kepala_bps: string;
  nip_kepala_bps: string;
}

interface BeritaAcaraModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BaData[];
  selectedPetugas?: { nama: string; kode_kab: string };
  displayMonth?: string;
  selectedYear?: number;
}

export function BeritaAcaraModal({ isOpen, onClose, data, selectedPetugas, displayMonth, selectedYear }: BeritaAcaraModalProps) {
  const [alasan, setAlasan] = useState('');
  const [pengawas, setPengawas] = useState({ nama: '', nip: '' });
  const [isGenerating, setIsGenerating] = useState(false); // State untuk loading

  // PERUBAHAN: Ubah fungsi menjadi async
  const handleBulkGenerate = async () => {
    if (!alasan.trim() || !pengawas.nama.trim()) {
        toast.error("Harap isi Nama Pengawas dan Alasan Tidak di Amati atau Kode 12.", {
          description: "Kedua field tersebut wajib diisi untuk membuat berita acara"
        });
        return;
    }
    if (data.length === 0) {
        toast.error("Tidak ada data segmen kode 12 untuk digenerate.", {
          description: "Tidak ditemukan segmen dengan kode 12 untuk petugas ini"
        });
        return;
    }

    setIsGenerating(true); // Mulai loading

    try {
        const bulanNumber = parseInt(displayMonth || '0');
        const bulanName = bulanNumber > 0 ? new Date(0, bulanNumber - 1).toLocaleString('id-ID', { month: 'long' }) : '';

        // PERUBAHAN: Tambahkan await
        await generateBeritaAcaraDocx({
            nama_pencacah: data[0].nama_pencacah,
            nama_provinsi: data[0].nama_provinsi,
            nama_kabupaten: data[0].nama_kabupaten,
            nama_kepala_bps: data[0].nama_kepala_bps,
            nip_kepala_bps: data[0].nip_kepala_bps,
            listSegmen: data.map(d => ({ id_segmen: d.id_segmen, subsegmen: d.subsegmen, nama_kecamatan: d.nama_kecamatan })),
            alasan,
            nama_pengawas: pengawas.nama,
            nip_pengawas: pengawas.nip,
            bulan: bulanName,
            tahun: selectedYear || new Date().getFullYear(),
        });
        
        toast.success(`Berhasil men-download Berita Acara untuk ${data.length} segmen KSA Padi.`, {
          description: "File dokumen berita acara berhasil dibuat dan diunduh"
        });
        onClose();
        
        // Reset form
        setAlasan('');
        setPengawas({ nama: '', nip: '' });
    } catch (error) {
        console.error("Gagal generate dokumen:", error);
        toast.error("Terjadi kesalahan saat membuat dokumen. Silakan coba lagi.", {
          description: "Terjadi kesalahan saat membuat dokumen berita acara"
        });
    } finally {
        setIsGenerating(false); // Selesai loading
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg md:text-xl">Generate Berita Acara Kode 12</DialogTitle>
          <DialogDescription className="text-sm">
            Petugas: {selectedPetugas?.nama || 'N/A'}. Ditemukan {data.length} segmen dengan Kode 12.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 px-1">
          <div className="grid grid-cols-1 gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pengawas-nama" className="text-sm font-medium">Nama Pengawas *</Label>
                <Input 
                  id="pengawas-nama" 
                  value={pengawas.nama} 
                  onChange={e => setPengawas(p => ({...p, nama: e.target.value}))} 
                  placeholder="Isi nama pengawas..." 
                  className="text-sm" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pengawas-nip" className="text-sm font-medium">NIP Pengawas (Opsional)</Label>
                <Input 
                  id="pengawas-nip" 
                  value={pengawas.nip} 
                  onChange={e => setPengawas(p => ({...p, nip: e.target.value}))} 
                  placeholder="Isi NIP pengawas..." 
                  className="text-sm" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alasan" className="text-sm font-medium">Alasan Kode 12 (Rincikan untuk setiap sub segmen) *</Label>
              <Input 
                id="alasan" 
                value={alasan} 
                onChange={e => setAlasan(e.target.value)} 
                placeholder="Contoh: Responden tidak dapat ditemui, akses lokasi sulit, dll." 
                className="text-sm" 
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center text-xs md:text-sm whitespace-nowrap">ID Segmen</TableHead>
                    <TableHead className="text-center text-xs md:text-sm whitespace-nowrap">Subsegmen</TableHead>
                    <TableHead className="text-center text-xs md:text-sm whitespace-nowrap">Kecamatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={`${item.id_segmen}-${item.subsegmen}`}>
                      <TableCell className="text-center text-xs md:text-sm">{item.id_segmen}</TableCell>
                      <TableCell className="text-center text-xs md:text-sm">{item.subsegmen}</TableCell>
                      <TableCell className="text-center text-xs md:text-sm truncate max-w-32 md:max-w-none" title={item.nama_kecamatan}>{item.nama_kecamatan}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="text-sm">Tutup</Button>
          <Button onClick={handleBulkGenerate} disabled={isGenerating} className="text-sm">
            <FileDown className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{isGenerating ? "Membuat..." : "Generate Berita Acara"}</span>
                <span className="sm:hidden">{isGenerating ? "..." : "Generate"}</span>
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}