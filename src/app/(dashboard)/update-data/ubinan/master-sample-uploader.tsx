// src/app/(dashboard)/update-data/ubinan/master-sample-uploader.tsx
"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, UploadCloud, X, FileText, Download, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Server Action ini akan kita panggil
import { uploadMasterSampleAction } from "./_actions";

export function MasterSampleUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const fileArray = Array.from(selectedFiles);
      const validFiles = fileArray.filter(file => {
        const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx');
        const isXls = file.type === 'application/vnd.ms-excel' || file.name.endsWith('.xls');
        if (!isXlsx && !isXls) {
          toast.error(`File "${file.name}" ditolak. Format harus .xlsx atau .xls.`);
          return false;
        }
        if (file.size > 25 * 1024 * 1024) { // 25MB limit
          toast.error(`File "${file.name}" terlalu besar (Max 25MB).`);
          return false;
        }
        return true;
      });
      // Menambahkan file baru ke daftar yang sudah ada
      setFiles(prevFiles => {
        const newFiles = validFiles.filter(vf => !prevFiles.some(pf => pf.name === vf.name && pf.size === vf.size));
        return [...prevFiles, ...newFiles];
      });
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
    const droppedFiles = event.dataTransfer.files;
    if (fileInputRef.current) {
      fileInputRef.current.files = droppedFiles;
      // Memicu event onChange secara manual
      const changeEvent = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(changeEvent);
    }
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      toast.error("Silakan pilih satu atau lebih file Excel.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      toast.info(`Mengunggah ${files.length} file untuk diproses...`);
      
      try {
        const result = await uploadMasterSampleAction(formData);
        if (result.success) {
          toast.success(result.message);
          setFiles([]);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          toast.error(result.message, { description: result.errorDetails, duration: 10000 });
        }
      } catch (e) {
        toast.error("Terjadi kesalahan tak terduga saat menghubungi server.");
      }
    });
  };
  
  // Ganti URL ini dengan path ke file template Excel Anda di folder public
  const templateFileUrl = "/templates/template_master_sampel.xlsx";

  return (
    <div className="w-full max-w-2xl mx-auto p-2 space-y-6">
      <input
        id="master-sample-file-hidden"
        type="file"
        multiple
        accept=".xlsx, .xls, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileChange}
        disabled={isPending}
        ref={fileInputRef}
        className="sr-only"
      />

      {/* Area Drag and Drop - Dibuat Seragam */}
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
              <p className="text-xs text-gray-500 dark:text-gray-400">Anda bisa menambahkan file lain.</p>
            </>
          )}
        </div>
      </div>
      
      {/* Daftar File yang Dipilih */}
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

      {/* Bagian Contoh Tabel dan Template - Dibuat Seragam */}
      <Alert variant="default" className="shadow">
        <Info className="h-5 w-5" />
        <AlertTitle className="font-semibold">Contoh Tabel & Template</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p className="text-sm">
            Pastikan struktur file Excel Anda sesuai dengan template yang disediakan untuk memastikan proses impor berjalan lancar.
          </p>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="shadow-sm hover:shadow"
          >
            <a href={templateFileUrl} download="template_master_sampel.xlsx">
              <Download className="mr-2 h-4 w-4" />
              Unduh Template Excel
            </a>
          </Button>
        </AlertDescription>
      </Alert>

      {/* Tombol Aksi - Dibuat Seragam */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={() => setFiles([])} disabled={isPending || files.length === 0} className="shadow-sm hover:shadow">
          <X className="mr-2 h-4 w-4" /> Batal
        </Button>
        <Button onClick={handleSubmit} disabled={isPending || files.length === 0} className="shadow-sm hover:shadow">
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