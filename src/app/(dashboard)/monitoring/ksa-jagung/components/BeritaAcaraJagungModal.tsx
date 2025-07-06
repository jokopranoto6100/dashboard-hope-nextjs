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
        alert("Harap isi Nama Pengawas dan Alasan Tidak di Amati atau Kode 98.");
        return;
    }
    if (data.length === 0) {
        alert("Tidak ada data untuk diproses.");
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
        alert(`Berhasil men-download Berita Acara untuk ${data.length} segmen KSA Jagung.`);
        onClose();
        
        // Reset form
        setAlasan('');
        setPengawas({ nama: '', nip: '' });
    } catch (error) {
        console.error("Error generating BA:", error);
        alert("Gagal men-generate Berita Acara. Silakan coba lagi.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🌽 Berita Acara KSA Jagung - {selectedPetugas?.nama}</DialogTitle>
          <DialogDescription>
            Daftar segmen dengan kode 98 untuk petugas {selectedPetugas?.nama} di kabupaten dengan kode {selectedPetugas?.kode_kab}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Form input untuk pengawas dan alasan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="nama-pengawas">Nama Pengawas *</Label>
              <Input
                id="nama-pengawas"
                value={pengawas.nama}
                onChange={(e) => setPengawas(prev => ({...prev, nama: e.target.value}))}
                placeholder="Masukkan nama pengawas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nip-pengawas">NIP Pengawas</Label>
              <Input
                id="nip-pengawas"
                value={pengawas.nip}
                onChange={(e) => setPengawas(prev => ({...prev, nip: e.target.value}))}
                placeholder="Masukkan NIP pengawas (opsional)"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="alasan">Alasan Tidak di Amati atau Kode 98 *</Label>
              <Input
                id="alasan"
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Contoh: Tanaman rusak akibat banjir"
              />
            </div>
          </div>

          {/* Tabel data segmen */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">ID Segmen</TableHead>
                  <TableHead className="text-center">Sub Segmen</TableHead>
                  <TableHead className="text-center">Pencacah</TableHead>
                  <TableHead className="text-center">Kecamatan</TableHead>
                  <TableHead className="text-center">Kepala BPS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">{item.id_segmen}</TableCell>
                      <TableCell className="text-center">{item.subsegmen}</TableCell>
                      <TableCell className="text-center">{item.nama_pencacah}</TableCell>
                      <TableCell className="text-center">{item.nama_kecamatan}</TableCell>
                      <TableCell className="text-center">{item.nama_kepala_bps}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Tidak ada data segmen dengan kode 98.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button 
            onClick={handleBulkGenerate} 
            disabled={isGenerating || data.length === 0}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isGenerating ? (
              "Generating..."
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Download BA ({data.length} segmen)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
