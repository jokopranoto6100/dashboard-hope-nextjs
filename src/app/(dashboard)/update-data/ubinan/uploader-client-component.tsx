// src/app/(dashboard)/update-data/ubinan/uploader-client-component.tsx
"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, UploadCloud, FileText, Download, Info, X } from "lucide-react"; // Tambah ikon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Untuk info template

import { uploadUbinanRawAction } from "./_actions"; // Nanti di-uncomment

export function UploaderClientComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null); // Untuk trigger klik input file

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validasi tipe file (contoh: CSV, tapi di gambar XLS, XLSX)
      // Untuk ubinan kita tetap pakai CSV sesuai diskusi sebelumnya
      if (selectedFile.type === "text/csv") {
        // Validasi ukuran file (contoh: 25MB seperti di gambar)
        if (selectedFile.size <= 25 * 1024 * 1024) { // 25MB
          setFile(selectedFile);
        } else {
          toast.error("Ukuran file terlalu besar. Maksimal 25MB.");
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      } else {
        toast.error("Hanya file dengan format .csv yang diperbolehkan untuk data ubinan.");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  // Fungsi untuk memicu klik pada input file yang tersembunyi/di-styling
  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  // Fungsi untuk menangani drag over (diperlukan untuk efek visual drop)
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Mencegah default browser membuka file
    event.stopPropagation();
    // Anda bisa menambahkan styling saat drag over di sini jika mau
  };

  // Fungsi untuk menangani drop file
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      // Ambil file pertama dan proses seperti handleFileChange
      const droppedFile = droppedFiles[0];
      // Trigger onChange sintetis atau langsung panggil logika validasi
      // Untuk simplisitas, kita set file input dan panggil onChange
      if (fileInputRef.current) {
        fileInputRef.current.files = droppedFiles; // Ini mungkin tidak selalu berhasil di semua browser untuk set programatik
                                                  // Lebih baik langsung panggil logika validasi
        // Logika validasi langsung (duplikasi dari handleFileChange untuk file drop)
        if (droppedFile.type === "text/csv") {
          if (droppedFile.size <= 25 * 1024 * 1024) {
            setFile(droppedFile);
            toast.info(`File dipilih: ${droppedFile.name}`);
          } else {
            toast.error("Ukuran file terlalu besar. Maksimal 25MB.");
            setFile(null);
          }
        } else {
          toast.error("Hanya file dengan format .csv yang diperbolehkan untuk data ubinan.");
          setFile(null);
        }
      }
    }
  };


  const handleSubmit = async () => { // Diubah jadi fungsi biasa, bukan event handler form
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
         const result = await uploadUbinanRawAction(formData);
         if (result.success) {
           toast.success(result.message || "File berhasil diproses!");
           setFile(null);
           if (fileInputRef.current) fileInputRef.current.value = "";
           // TODO: Refresh data histori update (mungkin dengan revalidatePath dari server atau window.location.reload jika sederhana)
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
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  const handleCancel = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset input file
    }
    toast.info("Proses unggah dibatalkan.");
  };

  // Ganti URL ini dengan path ke file template CSV Anda di folder public
  const templateFileUrl = "/templates/template_ubinan.csv";


  return (
    <div className="w-full max-w-2xl mx-auto p-2 space-y-6"> {/* Kontainer utama */}
      {/* Input file yang sebenarnya, bisa disembunyikan atau di-styling minimal */}
      <input
        id="csvfile-hidden"
        type="file"
        accept=".csv" // Untuk ubinan kita .csv, gambar .xls, .xlsx
        onChange={handleFileChange}
        disabled={isPending}
        ref={fileInputRef}
        className="sr-only" // Atau className="hidden"
      />

      {/* Area Drag and Drop */}
      <div
        className={`mt-2 flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
                    ${file ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600'}`}
        onClick={handleAreaClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className={`w-10 h-10 mb-3 ${file ? 'text-primary' : 'text-gray-400'}`} />
          {file ? (
            <>
              <p className="mb-2 text-sm font-semibold text-primary">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ukuran: {(file.size / (1024*1024)).toFixed(2)} MB. Klik area untuk ganti file.
              </p>
            </>
          ) : (
            <>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Seret & Lepas file di sini</span> atau klik untuk memilih file
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Format: CSV (Max. 25MB)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Bagian Contoh Tabel dan Template */}
      <Alert variant="default" className="shadow">
        <Info className="h-5 w-5" />
        <AlertTitle className="font-semibold">Contoh Tabel & Template</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p className="text-sm">
            Pastikan struktur file CSV Anda sesuai dengan template yang disediakan untuk memastikan proses impor berjalan lancar.
            Perhatikan nama header kolom, urutan kolom (opsional jika header dibaca), dan tipe data yang diharapkan.
          </p>
          <Button
            variant="outline"
            size="sm"
            asChild // Agar bisa menggunakan <a> di dalamnya
            className="shadow-sm hover:shadow"
          >
            <a href={templateFileUrl} download="template_ubinan.csv">
              <Download className="mr-2 h-4 w-4" />
              Unduh Template CSV
            </a>
          </Button>
        </AlertDescription>
      </Alert>


      {/* Tombol Aksi */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={handleCancel} disabled={isPending || !file} className="shadow-sm hover:shadow">
          <X className="mr-2 h-4 w-4" /> Batal
        </Button>
        <Button onClick={handleSubmit} disabled={isPending || !file} className="shadow-sm hover:shadow">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload dan Proses
            </>
          )}
        </Button>
      </div>
    </div>
  );
}