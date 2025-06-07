// src/app/(dashboard)/update-data/ksa/ksa-uploader.tsx
"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from 'next/navigation'; // <-- 1. Pastikan import ini ada
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, UploadCloud, X, FileText, Download, Info, AlertTriangle, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import * as xlsx from 'xlsx';

// Server Action ini akan kita panggil
import { uploadKsaAction } from "./_actions"; 

const KABUPATEN_MAP: { [key: string]: string } = {
    "6101": "Sambas", "6102": "Bengkayang", "6103": "Landak", "6104": "Mempawah",
    "6105": "Sanggau", "6106": "Ketapang", "6107": "Sintang", "6108": "Kapuas Hulu",
    "6109": "Sekadau", "6110": "Melawi", "6111": "Kayong Utara", "6112": "Kubu Raya",
    "6171": "Pontianak", "6172": "Singkawang"
};
const ALL_KABUPATEN_COUNT = Object.keys(KABUPATEN_MAP).length;
const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export function KsaUploader() {
  const router = useRouter(); // <-- 2. Inisialisasi router
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [summary, setSummary] = useState<{ tahun: string, bulan: string, kab: string } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const fileArray = Array.from(selectedFiles);
      const validFiles = fileArray.filter(file => {
        const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx');
        const isXls = file.type === 'application/vnd.ms-excel' || file.name.endsWith('.xls');
        if (!isXlsx && !isXls) { toast.error(`File "${file.name}" ditolak. Format harus .xlsx atau .xls.`); return false; }
        return true;
      });
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };
  
  const removeFile = (fileName: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.files = event.dataTransfer.files;
      const changeEvent = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(changeEvent);
    }
  };
  
  const handleOpenConfirmation = async () => {
    if (files.length === 0) {
      toast.error("Silakan pilih file Excel terlebih dahulu.");
      return;
    }
    setIsAnalyzing(true);
    toast.info("Menganalisis isi file, harap tunggu...");
    try {
      const yearSet = new Set<number>();
      const monthSet = new Set<number>();
      const kabCodeSet = new Set<string>();
      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[];
        for (const record of jsonData) {
          if (record.tanggal && record['id segmen']) {
            const date = new Date(record.tanggal);
            if (!isNaN(date.getTime())) {
              yearSet.add(date.getFullYear());
              monthSet.add(date.getMonth() + 1);
              kabCodeSet.add(record['id segmen'].toString().substring(0, 4));
            }
          }
        }
      }
      if (yearSet.size === 0) {
        toast.error("Tidak ditemukan data tanggal atau id segmen yang valid di dalam file.");
        setIsAnalyzing(false);
        return;
      }
      const affectedYears = Array.from(yearSet).sort().join(', ');
      const affectedMonths = Array.from(monthSet).sort((a, b) => a - b).map(m => MONTH_NAMES[m - 1]).join(', ');
      let kabSummary = "Tidak ada data kabupaten valid ditemukan.";
      if (kabCodeSet.size > 0) {
        if (kabCodeSet.size === ALL_KABUPATEN_COUNT) {
          kabSummary = "Semua Kabupaten";
        } else {
          const kabNames = Array.from(kabCodeSet).map(code => KABUPATEN_MAP[code] || `Kode: ${code}`);
          kabSummary = kabNames.length > 3 ? `${kabNames.slice(0, 3).join(', ')}, dan lainnya` : kabNames.join(', ');
        }
      }
      setSummary({
        tahun: affectedYears || "Tidak ada",
        bulan: affectedMonths || "Tidak ada",
        kab: kabSummary,
      });
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Gagal membaca file di client:", error);
      toast.error("Gagal membaca file Excel. Pastikan format kolom di dalamnya benar.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFinalSubmit = () => {
    startTransition(async () => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      setIsDialogOpen(false);
      toast.info(`Mengunggah ${files.length} file untuk diproses...`);
      
      try {
        const result = await uploadKsaAction(formData);
        if (result.success) {
          toast.success(result.message);
          setFiles([]);
          if (fileInputRef.current) fileInputRef.current.value = "";
          
          router.refresh(); // <-- 3. PANGGIL REFRESH DI SINI, DI DALAM BLOK SUKSES
          
        } else {
          toast.error(result.message, { description: result.errorDetails, duration: 10000 });
        }
      } catch (e) {
        toast.error("Terjadi kesalahan tak terduga saat menghubungi server.");
      }
    });
  };

  const templateFileUrl = "/templates/template_ksa_amatan.xlsx";
  const isLoading = isPending || isAnalyzing;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="w-full max-w-2xl mx-auto p-2 space-y-6">
        <input ref={fileInputRef} onChange={handleFileChange} type="file" multiple accept=".xlsx, .xls" className="sr-only" />

        <div
          className={`mt-2 flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
                      ${files.length > 0 ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600'}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className={`w-10 h-10 mb-3 ${files.length > 0 ? 'text-primary' : 'text-gray-400'}`} />
            {files.length === 0 ? (
              <>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Seret & Lepas file di sini</span> atau klik untuk memilih file
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Format: XLSX, XLS (Max. 25MB)
                </p>
              </>
            ) : (
              <>
                <p className="mb-2 text-sm font-semibold text-primary">{files.length} file dipilih.</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Anda bisa menambahkan file lain atau menghapusnya dari daftar di bawah.</p>
              </>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
              <p className="text-sm font-medium">Daftar file:</p>
              <div className="space-y-2 rounded-md border p-3 max-h-48 overflow-y-auto">
                {files.map(file => (
                  <div key={file.name + file.size} className="flex items-center justify-between text-sm animate-in fade-in-50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="font-mono text-muted-foreground truncate" title={file.name}>{file.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(file.name)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        )}

        <Alert variant="default" className="shadow">
          <Info className="h-5 w-5" />
          <AlertTitle className="font-semibold">Contoh Tabel & Template</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p className="text-sm">Gunakan template ini untuk memastikan struktur file Excel Anda sesuai.</p>
            <Button variant="outline" size="sm" asChild className="shadow-sm hover:shadow">
              <a href={templateFileUrl} download="template_ksa_amatan.xlsx">
                <Download className="mr-2 h-4 w-4" />
                Unduh Template Excel
              </a>
            </Button>
          </AlertDescription>
        </Alert>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={() => setFiles([])} disabled={isLoading || files.length === 0} className="shadow-sm hover:shadow">
            Batal
          </Button>
          <Button onClick={handleOpenConfirmation} disabled={isLoading || files.length === 0} className="shadow-sm hover:shadow">
            {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menganalisis...</> : "Upload dan Proses"}
          </Button>
        </div>
      </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center"><AlertTriangle className="mr-2 text-destructive" />Konfirmasi Tindakan</DialogTitle>
          <DialogDescription>
            Anda akan menghapus dan mengganti data KSA dengan data dari file yang dipilih. Mohon periksa ringkasan di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <Alert variant="default" className="text-sm">
          <Sparkles className="h-4 w-4" />
          <AlertTitle>Ringkasan Data yang Terdeteksi</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc pl-5 space-y-1">
                <li><b>Tahun:</b> {summary?.tahun}</li>
                <li><b>Bulan:</b> {summary?.bulan}</li>
                <li><b>Wilayah Terdampak:</b> {summary?.kab}</li>
            </ul>
          </AlertDescription>
        </Alert>
        <DialogFooter className="sm:justify-between pt-4">
          <DialogClose asChild><Button variant="ghost">Batal</Button></DialogClose>
          <Button onClick={handleFinalSubmit} disabled={isPending}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : "Ya, Lanjutkan & Ganti Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}