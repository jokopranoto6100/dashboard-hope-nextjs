// src/app/(dashboard)/update-data/ubinan/uploader-client-component.tsx
"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, UploadCloud, Download, Info, Settings, CheckCircle, AlertCircle, EyeOff, FileText, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Import kedua server action yang dibutuhkan untuk alur ini
import { analyzeCsvHeadersAction, uploadUbinanRawAction } from "./_actions";

// Tipe data untuk hasil analisis
type AnalysisResult = {
  matchedHeaders: { dbCol: string; csvHeader: string }[];
  unmappedDbCols: string[];
  unexpectedCsvHeaders: string[];
};

export function UploaderClientComponent() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State untuk modal pemetaan
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [userMappings, setUserMappings] = useState<{ [key: string]: string }>({});

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.type === "text/csv" || selectedFile.name.endsWith('.csv')) {
            if (selectedFile.size <= 25 * 1024 * 1024) { // 25MB limit
                setFile(selectedFile);
            } else {
                toast.error("Ukuran file terlalu besar. Maksimal 25MB.");
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        } else {
            toast.error("Hanya file format .csv yang diperbolehkan.");
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }
  };

  // --- AWAL KODE BARU ---
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Ini WAJIB untuk memberitahu browser bahwa area ini valid untuk drop
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Ini juga WAJIB untuk mencegah browser membuka file secara default
    
    const droppedFiles = event.dataTransfer.files;
    // Karena ini uploader single file, kita hanya ambil file pertama
    if (droppedFiles && droppedFiles.length > 0) {
      if (fileInputRef.current) {
        // Kita set file ke input yang tersembunyi
        fileInputRef.current.files = droppedFiles;
        // Lalu kita picu event 'change' secara manual agar validasi di handleFileChange berjalan
        const changeEvent = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(changeEvent);
      }
    }
  };
  // --- AKHIR KODE BARU ---
  
  const handleAnalyzeClick = async () => {
    if (!file) {
      toast.error("Silakan pilih file CSV terlebih dahulu.");
      return;
    }
    setIsAnalyzing(true);
    toast.info("Menganalisis header file CSV...");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await analyzeCsvHeadersAction(formData);
      if (result.success && result.analysis) {
        setAnalysisResult(result.analysis);
        setUserMappings({}); // Reset mapping user sebelumnya
        setIsMappingDialogOpen(true);
      } else {
        toast.error(result.message || "Gagal menganalisis file.");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan saat analisis file.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleMappingChange = (dbCol: string, csvHeader: string) => {
    setUserMappings(prev => ({ ...prev, [dbCol]: csvHeader }));
  };

  const handleFinalImport = () => {
    if (!file || !analysisResult) return;
    
    const finalMapping: { [key: string]: string } = {};
    analysisResult.matchedHeaders.forEach(m => {
      finalMapping[m.dbCol] = m.csvHeader;
    });
    Object.assign(finalMapping, userMappings);

    if (analysisResult.unmappedDbCols.length !== Object.keys(userMappings).length) {
      toast.error("Harap petakan semua kolom database yang wajib (ditandai dengan warna kuning).");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mappingConfig", JSON.stringify(finalMapping));

    startTransition(async () => {
      setIsMappingDialogOpen(false);
      toast.info("Mengunggah dan memproses data...");
      try {
        const result = await uploadUbinanRawAction(formData);
        if (result.success) {
          toast.success(result.message);
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          router.refresh();
        } else {
          toast.error(result.message, { description: result.errorDetails, duration: 10000 });
        }
      } catch (e) {
        toast.error("Terjadi kesalahan tak terduga saat menghubungi server.");
      }
    });
  };

  const templateFileUrl = "/templates/template_ubinan.csv";
  const isLoading = isAnalyzing || isPending;

  return (
    <>
      <div className="w-full max-w-2xl mx-auto p-2 space-y-6">
        <input ref={fileInputRef} onChange={handleFileChange} type="file" accept=".csv" className="sr-only" />
        
        <div
          className={`mt-2 flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${file ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className={`w-10 h-10 mb-3 ${file ? 'text-primary' : 'text-gray-400'}`} />
            {file ? (
                <div className="flex items-center gap-2 p-2 rounded-md bg-white dark:bg-slate-700">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-primary">{file.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
              <>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Seret & Lepas file di sini</span> atau klik untuk memilih file
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Format: CSV (Max. 25MB)</p>
              </>
            )}
          </div>
        </div>

        <Alert variant="default" className="shadow">
          <Info className="h-5 w-5" />
          <AlertTitle className="font-semibold">Template Impor</AlertTitle>
          <AlertDescription className="mt-2 flex items-center justify-between">
            <p className="text-sm">Gunakan template ini untuk memastikan struktur file CSV Anda sesuai.</p>
            <Button variant="outline" size="sm" asChild className="shadow-sm hover:shadow">
              <a href={templateFileUrl} download="template_ubinan.csv"><Download className="mr-2 h-4 w-4" />Unduh</a>
            </Button>
          </AlertDescription>
        </Alert>

        <div className="flex justify-end pt-4">
          <Button onClick={handleAnalyzeClick} disabled={!file || isLoading}>
            {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menganalisis...</> : <><Settings className="mr-2 h-4 w-4" />Analisis & Petakan Kolom</>}
          </Button>
        </div>
      </div>
      
      <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pemetaan Kolom (Ubinan Raw)</DialogTitle>
            <DialogDescription>
              Sistem telah menganalisis header file Anda. Harap cocokkan kolom yang wajib dan periksa kolom baru yang akan diabaikan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1 pr-4">
            {analysisResult?.matchedHeaders.length > 0 && (
              <div>
                <h4 className="font-semibold flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-2"/>Kolom Cocok Otomatis</h4>
                <p className="text-xs text-muted-foreground mb-2">Kolom ini tidak perlu diubah.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {analysisResult.matchedHeaders.map(m => (
                    <div key={m.dbCol} className="grid grid-cols-2 items-center gap-2">
                      <Label htmlFor={`map-${m.dbCol}`} className="text-right text-xs">{m.dbCol}</Label>
                      <Input id={`map-${m.dbCol}`} value={m.csvHeader} disabled className="text-xs h-8"/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisResult && analysisResult.unmappedDbCols.length > 0 && (
              <div>
                <h4 className="font-semibold flex items-center text-amber-600"><AlertCircle className="h-4 w-4 mr-2"/>Kolom Wajib (Belum Terpetakan)</h4>
                <p className="text-xs text-muted-foreground mb-2">Harap pilih header dari file Anda yang sesuai untuk kolom database ini.</p>
                <div className="space-y-2">
                  {analysisResult.unmappedDbCols.map(dbCol => (
                    <div key={dbCol} className="grid grid-cols-2 items-center gap-4 p-2 border border-amber-300 rounded-md">
                      <Label htmlFor={`map-${dbCol}`} className="text-right font-bold">{dbCol}</Label>
                      <Select onValueChange={(val) => handleMappingChange(dbCol, val)}>
                        <SelectTrigger><SelectValue placeholder="Pilih Kolom Mapping" /></SelectTrigger>
                        <SelectContent>
                          {analysisResult.unexpectedCsvHeaders.map(csvHeader => (
                            <SelectItem key={csvHeader} value={csvHeader}>{csvHeader}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {analysisResult && analysisResult.unexpectedCsvHeaders.filter(h => !Object.values(userMappings).includes(h)).length > 0 && (
                <div>
                  <h4 className="font-semibold flex items-center text-slate-500"><EyeOff className="h-4 w-4 mr-2"/>Kolom Baru/Tak Dikenal (Akan Diabaikan)</h4>
                  <p className="text-xs text-muted-foreground mb-2">Kolom berikut ada di file Anda tapi tidak ada padanannya di database dan akan diabaikan.</p>
                  <div className="text-xs text-slate-400 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border">
                    {analysisResult.unexpectedCsvHeaders.filter(h => !Object.values(userMappings).includes(h)).join(', ')}
                  </div>
                </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
            <Button onClick={handleFinalImport} disabled={isPending}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : "Lanjutkan & Impor Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
