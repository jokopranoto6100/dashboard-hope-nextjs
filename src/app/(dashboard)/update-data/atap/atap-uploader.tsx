/* eslint-disable @typescript-eslint/no-explicit-any */
// Lokasi File: src/app/(dashboard)/update-data/atap/atap-uploader.tsx
"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, UploadCloud, X, FileText, Download, Info, AlertTriangle, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog";
//import { Label } from "@/components/ui/label";
import * as xlsx from 'xlsx';

// Tipe untuk data yang akan kita proses
type DataType = 'bulanan_kab' | 'tahunan_kab' | 'bulanan_prov' | 'tahunan_prov';

// Properti untuk komponen kita
interface AtapUploaderProps {
  dataType: DataType;
  dataTypeLabel: string;
  templateUrl: string;
  templateFileName: string;
}

// Server Action yang akan kita panggil
import { uploadAtapDataAction } from "./_actions";

export function AtapUploader({ dataType, dataTypeLabel, templateUrl, templateFileName }: AtapUploaderProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [summary, setSummary] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        const isXlsx = selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.name.endsWith('.xlsx');
        const isXls = selectedFile.type === 'application/vnd.ms-excel' || selectedFile.name.endsWith('.xls');
        if (!isXlsx && !isXls) { toast.error("Format file harus .xlsx atau .xls."); return; }
        if (selectedFile.size > 25 * 1024 * 1024) { toast.error("Ukuran file terlalu besar (Maks 25MB)."); return; }
        setFile(selectedFile);
    }
  };

  // --- AWAL KODE BARU UNTUK DRAG & DROP ---
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Wajib untuk mengizinkan drop
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Mencegah browser membuka file
    const droppedFiles = event.dataTransfer.files;
    
    // Komponen ini menangani satu file, jadi kita ambil yang pertama
    if (droppedFiles && droppedFiles.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.files = droppedFiles;
        // Picu event 'change' agar logika validasi di handleFileChange berjalan
        const changeEvent = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(changeEvent);
      }
    }
  };
  // --- AKHIR KODE BARU UNTUK DRAG & DROP ---

  const handleOpenConfirmation = async () => {
    if (!file) {
      toast.error("Silakan pilih file Excel terlebih dahulu.");
      return;
    }
    setIsAnalyzing(true);
    toast.info("Menganalisis file...");

    try {
        const buffer = await file.arrayBuffer();
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 }) as any[][];
        
        const headerRow = jsonData[0] || [];
        const rowCount = jsonData.length > 1 ? jsonData.length - 1 : 0;
        const indicatorCount = headerRow.length > 2 ? headerRow.length - 2 : 0;
        
        const summaryText = `Anda akan mengimpor ${rowCount} baris data dengan ~${indicatorCount} indikator. Data ini akan diproses sebagai ${dataTypeLabel}.`;
        
        setSummary(summaryText);
        setIsDialogOpen(true);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        toast.error("Gagal membaca file. Pastikan formatnya benar.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleFinalSubmit = () => {
    if (!file) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dataType', dataType);
      
      setIsDialogOpen(false);
      toast.info("Mengunggah dan memproses data...");
      
      // --- UNCOMMENT SETELAH SERVER ACTION DIBUAT ---
       try {
         const result = await uploadAtapDataAction(formData);
         if (result.success) {
           toast.success(result.message);
           setFile(null);
           if (fileInputRef.current) fileInputRef.current.value = "";
           router.refresh(); 
         } else {
           toast.error(result.message, { description: result.errorDetails, duration: 10000 });
         }
       } catch {
         toast.error("Terjadi kesalahan tak terduga.");
       }
      // --- AKHIR UNCOMMENT ---

      // Placeholder simulasi
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Simulasi: File "${file.name}" selesai diproses.`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    });
  };

  const isLoading = isPending || isAnalyzing;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="w-full max-w-2xl mx-auto p-2 space-y-6">
        <input ref={fileInputRef} onChange={handleFileChange} type="file" accept=".xlsx, .xls" className="sr-only" />
        <div
        className={`mt-2 flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
          ${file
            ? 'border-primary bg-primary/10 dark:bg-primary/20'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600'}
        `}        
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        >
        {/* Div pembungkus "text-center" dihapus, dan kontennya sekarang menjadi anak langsung dari flexbox */}
        <UploadCloud className={`w-10 h-10 mb-3 ${file ? 'text-primary' : 'text-gray-400'}`} />
        {file ? (
            <div className="flex flex-col items-center text-center"> {/* Tambahkan div ini untuk mengelompokkan teks */}
                <div className="flex items-center gap-2 p-2 rounded-md bg-white dark:bg-slate-700">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-primary">{file.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        ) : (
            <div className="text-center"> {/* Tambahkan div ini untuk mengelompokkan teks */}
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Seret & Lepas file di sini</span> atau klik untuk memilih file</p>
            <p className="text-xs text-gray-500">Format: XLSX, XLS</p>
            </div>
        )}
        </div>
        <Alert variant="default" className="shadow">
          <Info className="h-5 w-5" />
          <AlertTitle className="font-semibold">Template Impor</AlertTitle>
          <AlertDescription className="mt-2 flex items-center justify-between">
            <p className="text-sm">Gunakan template untuk memastikan struktur file Anda sesuai.</p>
            <Button variant="outline" size="sm" asChild className="shadow-sm hover:shadow">
              <a href={templateUrl} download={templateFileName}><Download className="mr-2 h-4 w-4" />Unduh</a>
            </Button>
          </AlertDescription>
        </Alert>

        <div className="flex justify-end pt-4">
          <DialogTrigger asChild>
            <Button onClick={handleOpenConfirmation} disabled={isLoading || !file}>Upload dan Proses</Button>
          </DialogTrigger>
        </div>
      </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center"><AlertTriangle className="mr-2 text-destructive" />Konfirmasi Impor Data</DialogTitle>
          <DialogDescription>
            Tindakan ini akan menyimpan data baru atau memperbarui data yang sudah ada (UPSERT). Pastikan file yang Anda unggah sudah benar.
          </DialogDescription>
        </DialogHeader>
        <Alert variant="default">
          <Sparkles className="h-4 w-4" />
          <AlertTitle>Ringkasan File</AlertTitle>
          <AlertDescription>{summary}</AlertDescription>
        </Alert>
        <DialogFooter className="sm:justify-between pt-4">
          <DialogClose asChild><Button variant="ghost">Batal</Button></DialogClose>
          <Button onClick={handleFinalSubmit} disabled={isPending}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : "Ya, Lanjutkan & Impor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}