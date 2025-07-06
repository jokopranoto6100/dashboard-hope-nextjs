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
        alert("Harap isi Nama Pengawas dan Alasan Tidak di Amati atau Kode 12.");
        return;
    }
    if (data.length === 0) {
        alert("Tidak ada data segmen kode 12 untuk digenerate.");
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
    } catch (error) {
        console.error("Gagal generate dokumen:", error);
        alert("Terjadi kesalahan saat membuat dokumen. Lihat console untuk detail.");
    } finally {
        setIsGenerating(false); // Selesai loading
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generate Berita Acara Kode 12</DialogTitle>
          <DialogDescription>
            Petugas: {selectedPetugas?.nama || 'N/A'}. Ditemukan {data.length} segmen dengan Kode 12.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div>
                <Label htmlFor="pengawas-nama">Nama Pengawas</Label>
                <Input id="pengawas-nama" value={pengawas.nama} onChange={e => setPengawas(p => ({...p, nama: e.target.value}))} placeholder="Isi nama pengawas..." />
            </div>
             <div>
                <Label htmlFor="pengawas-nip">NIP Pengawas (Opsional)</Label>
                <Input id="pengawas-nip" value={pengawas.nip} onChange={e => setPengawas(p => ({...p, nip: e.target.value}))} placeholder="Isi NIP pengawas..." />
            </div>
             <div className="col-span-1 md:col-span-2">
                <Label htmlFor="alasan">Alasan Kode 12 (Rincikan untuk setiap sub segmen)</Label>
                <Input id="alasan" value={alasan} onChange={e => setAlasan(e.target.value)} placeholder="Contoh: Responden tidak dapat ditemui, akses lokasi sulit, dll." />
            </div>
        </div>

        <div className="rounded-md border overflow-auto max-h-[40vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Segmen</TableHead>
                <TableHead>Subsegmen</TableHead>
                <TableHead>Kecamatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={`${item.id_segmen}-${item.subsegmen}`}>
                  <TableCell>{item.id_segmen}</TableCell>
                  <TableCell>{item.subsegmen}</TableCell>
                  <TableCell>{item.nama_kecamatan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onClose}>Tutup</Button>
            <Button onClick={handleBulkGenerate} disabled={isGenerating}>
                <FileDown className="mr-2 h-4 w-4" />
                {isGenerating ? "Membuat..." : "Generate Berita Acara"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}