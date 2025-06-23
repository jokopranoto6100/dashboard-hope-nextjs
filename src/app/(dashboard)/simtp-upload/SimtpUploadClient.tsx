// /app/(dashboard)/simtp-upload/SimtpUploadClient.tsx
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useTransition, useEffect } from "react";
import { useYear } from "@/context/YearContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { uploadSimtpAction } from "./_actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadHistory } from "./UploadHistory";

type FormInputs = {
  stp_bulanan: FileList;
  lahan_tahunan: FileList;
  alsin_tahunan: FileList;
  benih_tahunan: FileList;
};

interface SimtpUploadClientProps {
  allSatkers: { id: string; nama: string; }[];
  isAdmin: boolean; // <-- BARU: Menerima status admin dari server
}

export function SimtpUploadClient({ allSatkers, isAdmin }: SimtpUploadClientProps) {
  const [isPending, startTransition] = useTransition();
  const { selectedYear } = useYear();
  const { userData } = useAuth(); // Kita tetap gunakan untuk mendapatkan satker_id default
  
  const [selectedSatker, setSelectedSatker] = useState<string | null>(null);

  useEffect(() => {
    // Jika ada userData, set satker yang dipilih sebagai default
    // Untuk super_admin, ini akan menjadi '6100' pada awalnya
    // Untuk user biasa, ini akan menjadi satker mereka
    if (userData?.satker_id) {
      setSelectedSatker(userData.satker_id);
    }
  }, [userData]);

  const { register, handleSubmit, reset } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    if (!selectedSatker) {
      toast.error("Gagal memulai upload", { description: "Silakan pilih Satker terlebih dahulu." });
      return;
    }
    
    startTransition(async () => {
      const formData = new FormData();
      if (data.stp_bulanan?.[0]) formData.append('stp_bulanan', data.stp_bulanan[0]);
      if (data.lahan_tahunan?.[0]) formData.append('lahan_tahunan', data.lahan_tahunan[0]);
      if (data.alsin_tahunan?.[0]) formData.append('alsin_tahunan', data.alsin_tahunan[0]);
      if (data.benih_tahunan?.[0]) formData.append('benih_tahunan', data.benih_tahunan[0]);

      formData.append('year', String(selectedYear));
      formData.append('satker_id', selectedSatker);

      const result = await uploadSimtpAction(formData);
      if (result.success) {
        toast.success("Proses Selesai", { description: result.message });
        reset();
      } else {
        toast.error("Proses Gagal", { description: result.error });
      }
    });
  };

  // DIUBAH: Gunakan props 'isAdmin' sebagai sumber kebenaran
  const isSuperAdmin = isAdmin;
  const currentSatkerName = allSatkers.find(s => s.id === (isSuperAdmin ? selectedSatker : userData?.satker_id))?.nama || 'Tidak Ditemukan';

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Upload Data SIMTP</CardTitle>
          <CardDescription>
            {isSuperAdmin ? "Anda login sebagai Super Admin. Silakan pilih Satker tujuan." : 
            `Anda akan mengupload data untuk Kab/Kota: ${currentSatkerName} (${userData?.satker_id})`}
            <br />
            Periode tahun berjalan: **{selectedYear}**.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* OPSI PILIH SATKER UNTUK SUPER ADMIN */}
            {isSuperAdmin && (
              <div className="grid w-full max-w-md items-center gap-1.5">
                <Label htmlFor="satker_select">Pilih Satker Tujuan</Label>
                <Select value={selectedSatker ?? ''} onValueChange={setSelectedSatker}>
                  <SelectTrigger id="satker_select" className="w-full">
                    <SelectValue placeholder="Pilih Satker..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allSatkers.map(satker => (
                      <SelectItem key={satker.id} value={satker.id}>
                        {satker.id} - {satker.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg border-b pb-2">Data Bulanan (Wajib Diisi Setiap Bulan)</h3>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="stp_bulanan">1. File STP (STP_{selectedYear}_{selectedSatker}.mdb)</Label>
                <Input id="stp_bulanan" type="file" {...register("stp_bulanan")} accept=".mdb, application/vnd.ms-access" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg border-b pb-2">Data Tahunan (Diisi Sesuai Kebutuhan)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="lahan_tahunan">1. File Lahan (LahanTP_{selectedYear}_{selectedSatker}.mdb)</Label>
                  <Input id="lahan_tahunan" type="file" {...register("lahan_tahunan")} accept=".mdb, application/vnd.ms-access" />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="alsin_tahunan">2. File Alsin (AlsinTP_{selectedYear}_{selectedSatker}.mdb)</Label>
                  <Input id="alsin_tahunan" type="file" {...register("alsin_tahunan")} accept=".mdb, application/vnd.ms-access" />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="benih_tahunan">3. File Benih (BenihTP_{selectedYear}_{selectedSatker}.mdb)</Label>
                  <Input id="benih_tahunan" type="file" {...register("benih_tahunan")} accept=".mdb, application/vnd.ms-access" />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isPending || !selectedSatker} size="lg">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengupload...</> : <><UploadCloud className="mr-2 h-4 w-4" /> Upload Sekarang</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Komponen Riwayat Upload akan otomatis merespon perubahan selectedSatker */}
      {selectedSatker && <UploadHistory year={selectedYear} satkerId={selectedSatker} />}
    </>
  );
}