// src/app/(dashboard)/update-data/ubinan/uploader-client-component.tsx
"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; //
import { Label } from "@/components/ui/label"; //
import { toast } from "sonner"; //
import { Loader2, UploadCloud } from "lucide-react"; //
import { uploadUbinanRawAction } from "./_actions";

export function UploaderClientComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "text/csv") {
        setFile(selectedFile);
      } else {
        toast.error("Hanya file dengan format .csv yang diperbolehkan.");
        setFile(null);
        event.target.value = ""; // Reset input file
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast.error("Silakan pilih file CSV terlebih dahulu.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      toast.info("Mengunggah dan memproses file...");

      // --- INI BAGIAN YANG AKAN MEMANGGIL SERVER ACTION ---
      try {
         const result = await uploadUbinanRawAction(formData); // Kita akan buat action ini
         if (result.success) {
           toast.success(result.message || "File berhasil diproses!");
           setFile(null);
           // TODO: Refresh data histori update
         } else {
           toast.error(result.message || "Gagal memproses file.");
         }
       } catch (error) {
         console.error("Upload error:", error);
         toast.error("Terjadi kesalahan saat mengunggah file.");
       }
      // --- AKHIR BAGIAN SERVER ACTION ---

      // Placeholder untuk simulasi proses
      console.log("Form submitted with file:", file.name);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulasi delay
      toast.success(`Simulasi: File "${file.name}" selesai diproses.`);
      setFile(null);
      // Reset input file di DOM jika perlu agar bisa upload file yang sama lagi
      const form = event.target as HTMLFormElement;
      form.reset();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid w-full max-w-lg items-center gap-2">
        <Label htmlFor="csvfile">Pilih File CSV Ubinan (.csv)</Label>
        <div className="flex space-x-2">
          <Input
            id="csvfile"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isPending}
            className="file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-primary file:text-primary-foreground
                       hover:file:bg-primary/90"
          />
        </div>
        {file && <p className="text-sm text-muted-foreground">File dipilih: {file.name}</p>}
      </div>
      <Button type="submit" disabled={isPending || !file}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload dan Proses Data
          </>
        )}
      </Button>
    </form>
  );
}