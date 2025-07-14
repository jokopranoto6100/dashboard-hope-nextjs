"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useState, useTransition, useEffect } from "react";
import { useYear } from "@/context/YearContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { uploadSimtpAction } from "./_actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadHistory } from "./UploadHistory";
import { BulkDownload } from "./BulkDownload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomFileInput } from "@/components/ui/CustomFileInput";

type FormInputs = {
  stp_bulanan: File | null;
  lahan_tahunan: File | null;
  alsin_tahunan: File | null;
  benih_tahunan: File | null;
};

interface SimtpUploadClientProps {
  allSatkers: { id: string; nama: string; }[];
  isAdmin: boolean;
}

export function SimtpUploadClient({ allSatkers, isAdmin }: SimtpUploadClientProps) {
  const [isPending, startTransition] = useTransition();
  const { selectedYear } = useYear();
  const { userData, userRole } = useAuth();
  
  const [selectedSatker, setSelectedSatker] = useState<string | undefined>(undefined);

  const { control, handleSubmit, reset, watch } = useForm<FormInputs>({
    defaultValues: {
      stp_bulanan: null,
      lahan_tahunan: null,
      alsin_tahunan: null,
      benih_tahunan: null,
    }
  });

  useEffect(() => {
    if (userData?.satker_id) {
      setSelectedSatker(userData.satker_id);
    }
  }, [userData]);

  const watchedFiles = watch();
  const noFilesSelected = Object.values(watchedFiles).every(file => !file);

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    if (!selectedSatker) {
      toast.error("Gagal memulai upload", { description: "Silakan pilih Satker terlebih dahulu." });
      return;
    }
    
    startTransition(async () => {
      const formData = new FormData();
      if (data.stp_bulanan) formData.append('stp_bulanan', data.stp_bulanan);
      if (data.lahan_tahunan) formData.append('lahan_tahunan', data.lahan_tahunan);
      if (data.alsin_tahunan) formData.append('alsin_tahunan', data.alsin_tahunan);
      if (data.benih_tahunan) formData.append('benih_tahunan', data.benih_tahunan);

      formData.append('year', String(selectedYear));
      formData.append('satker_id', selectedSatker);

      const result = await uploadSimtpAction(formData);
      if (result.success) {
        toast.success(result.message, {
          description: (
            <ul className="list-disc list-inside">
              {result.details?.map(d => <li key={d}>{d}</li>)}
            </ul>
          ),
        });
        reset();
      } else {
        toast.error("Proses Gagal", { description: result.error });
      }
    });
  };

  const currentSatkerName = allSatkers.find(s => s.id === (isAdmin ? selectedSatker : userData?.satker_id))?.nama || 'Tidak Ditemukan';

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Upload Data SIMTP</CardTitle>
          <CardDescription>
            {isAdmin ? "Anda login sebagai Super Admin. Silakan pilih Satker tujuan." : 
            `Anda akan mengupload data untuk Kab/Kota: ${currentSatkerName} (${userData?.satker_id})`}
            <br />
            Periode tahun berjalan: <strong>{selectedYear}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {isAdmin && (
              <div className="grid w-full max-w-md items-center gap-1.5">
                <Label htmlFor="satker_select">Pilih Satker Tujuan</Label>
                <Select value={selectedSatker} onValueChange={setSelectedSatker}>
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
            
            <Tabs defaultValue="bulanan" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bulanan">Data Bulanan</TabsTrigger>
                <TabsTrigger value="tahunan">Data Tahunan</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bulanan" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Data Bulanan</CardTitle>
                    <CardDescription>File ini wajib di-upload setiap bulan untuk periode tahun berjalan ({selectedYear}).</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CustomFileInput 
                      name="stp_bulanan"
                      control={control}
                      label="1. File STP"
                      expectedFileName={`STP_${selectedYear}_${selectedSatker || 'KODE'}.mdb`}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tahunan" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Data Tahunan</CardTitle>
                    <CardDescription>
                      File tahunan yang diupload pada tahun ini ({selectedYear}) adalah untuk data periode tahun lalu ({selectedYear - 1}).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomFileInput 
                      name="lahan_tahunan"
                      control={control}
                      label="1. File Lahan"
                      expectedFileName={`LahanTP_${selectedYear - 1}_${selectedSatker || 'KODE'}.mdb`}
                    />
                    <CustomFileInput 
                      name="alsin_tahunan"
                      control={control}
                      label="2. File Alsin"
                      expectedFileName={`AlsinTP_${selectedYear - 1}_${selectedSatker || 'KODE'}.mdb`}
                    />
                    <CustomFileInput 
                      name="benih_tahunan"
                      control={control}
                      label="3. File Benih"
                      expectedFileName={`BenihTP_${selectedYear - 1}_${selectedSatker || 'KODE'}.mdb`}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <Button type="submit" disabled={isPending || !selectedSatker || noFilesSelected} size="lg" className="w-full md:w-auto">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengupload...</> : <><UploadCloud className="mr-2 h-4 w-4" /> Upload Sekarang</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bulk Download untuk Super Admin */}
      {userRole === 'super_admin' && (
        <BulkDownload year={selectedYear} userRole={userRole} />
      )}

      {selectedSatker && <UploadHistory year={selectedYear} satkerId={selectedSatker} />}
    </>
  );
}