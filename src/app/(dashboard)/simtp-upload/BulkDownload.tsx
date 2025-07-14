// /app/(dashboard)/simtp-upload/BulkDownload.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { bulkDownloadSimtpFilesAction, getSatkerWithFilesAction } from "./_actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Archive, FileText } from "lucide-react";
import { toast } from "sonner";

interface BulkDownloadProps {
  year: number;
  userRole: string;
}

type SatkerData = {
  kabupaten_kode: string;
  file_types: { [fileType: string]: number };
  total_files: number;
};

const FILE_TYPE_LABELS = {
  'STP_BULANAN': 'STP Bulanan',
  'LAHAN_TAHUNAN': 'Lahan Tahunan', 
  'ALSIN_TAHUNAN': 'Alsin Tahunan',
  'BENIH_TAHUNAN': 'Benih Tahunan'
};

export function BulkDownload({ year, userRole }: BulkDownloadProps) {
  const [satkerData, setSatkerData] = useState<SatkerData[]>([]);
  const [selectedSatker, setSelectedSatker] = useState<string>('all');
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);

  // Tampilkan hanya untuk super admin
  if (userRole !== 'super_admin') {
    return null;
  }

  useEffect(() => {
    startTransition(async () => {
      const result = await getSatkerWithFilesAction(year);
      if (result.success) {
        setSatkerData((result.data as SatkerData[]) || []);
      } else {
        toast.error("Gagal memuat data", { description: result.error });
      }
    });
  }, [year]);

  const handleFileTypeToggle = (fileType: string) => {
    setSelectedFileTypes(prev => 
      prev.includes(fileType) 
        ? prev.filter(t => t !== fileType)
        : [...prev, fileType]
    );
  };

  const handleBulkDownload = async () => {
    if (selectedFileTypes.length === 0) {
      toast.error("Pilih minimal satu jenis file untuk didownload");
      return;
    }

    setIsDownloading(true);
    try {
      const result = await bulkDownloadSimtpFilesAction({
        year,
        satkerId: selectedSatker === 'all' ? undefined : selectedSatker,
        fileTypes: selectedFileTypes
      });

      if (result.success && result.data) {
        const { files, successCount, errorCount, errors } = result.data;

        if (files.length === 0) {
          toast.error("Tidak ada file yang berhasil didownload");
          return;
        }

        // Create ZIP file menggunakan JSZip
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        // Group files by kabupaten_kode
        const filesByKabupaten = files.reduce((acc: { [key: string]: typeof files }, file) => {
          if (!acc[file.kabupaten_kode]) {
            acc[file.kabupaten_kode] = [];
          }
          acc[file.kabupaten_kode].push(file);
          return acc;
        }, {});

        // Add files to ZIP organized by folder
        Object.entries(filesByKabupaten).forEach(([kabupaten, kabFiles]) => {
          const folder = zip.folder(kabupaten);
          kabFiles.forEach(file => {
            const buffer = new Uint8Array(file.buffer);
            folder?.file(file.filename, buffer);
          });
        });

        // Generate and download ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SIMTP_${year}_${selectedSatker === 'all' ? 'ALL' : selectedSatker}.zip`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success(`Download selesai: ${successCount} file berhasil${errorCount > 0 ? `, ${errorCount} error` : ''}`);
        
        if (errors.length > 0) {
          console.warn('Download errors:', errors);
        }
      } else {
        toast.error("Gagal download file", { description: result.error });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat download");
      console.error("Bulk download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const allFileTypes = Array.from(
    new Set(satkerData.flatMap(s => Object.keys(s.file_types)))
  );

  const filteredSatkerData = selectedSatker === 'all' 
    ? satkerData 
    : satkerData.filter(s => s.kabupaten_kode === selectedSatker);

  const totalFiles = selectedFileTypes.length === 0 
    ? 0 
    : filteredSatkerData.reduce((total, satker) => {
        return total + selectedFileTypes.reduce((sum, fileType) => {
          return sum + (satker.file_types[fileType] || 0);
        }, 0);
      }, 0);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Bulk Download (Super Admin)
        </CardTitle>
        <CardDescription>
          Download file SIMTP dalam bentuk ZIP berdasarkan satker dan jenis file yang dipilih
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Satker Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Pilih Satker:</label>
          <Select value={selectedSatker} onValueChange={setSelectedSatker}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih satker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Satker ({satkerData.length})</SelectItem>
              {satkerData.map(satker => (
                <SelectItem key={satker.kabupaten_kode} value={satker.kabupaten_kode}>
                  {satker.kabupaten_kode} ({satker.total_files} files)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Pilih Jenis File:</label>
          <div className="grid grid-cols-2 gap-3">
            {allFileTypes.map(fileType => (
              <div key={fileType} className="flex items-center space-x-2">
                <Checkbox
                  id={fileType}
                  checked={selectedFileTypes.includes(fileType)}
                  onCheckedChange={() => handleFileTypeToggle(fileType)}
                />
                <label 
                  htmlFor={fileType} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {FILE_TYPE_LABELS[fileType as keyof typeof FILE_TYPE_LABELS] || fileType}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Table */}
        {filteredSatkerData.length > 0 && selectedFileTypes.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview Download:</label>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Satker</TableHead>
                    {selectedFileTypes.map(fileType => (
                      <TableHead key={fileType} className="text-center">
                        {FILE_TYPE_LABELS[fileType as keyof typeof FILE_TYPE_LABELS] || fileType}
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSatkerData.map(satker => {
                    const rowTotal = selectedFileTypes.reduce((sum, fileType) => 
                      sum + (satker.file_types[fileType] || 0), 0
                    );
                    
                    if (rowTotal === 0) return null;
                    
                    return (
                      <TableRow key={satker.kabupaten_kode}>
                        <TableCell className="font-medium">{satker.kabupaten_kode}</TableCell>
                        {selectedFileTypes.map(fileType => (
                          <TableCell key={fileType} className="text-center">
                            <Badge variant={satker.file_types[fileType] ? "default" : "secondary"}>
                              {satker.file_types[fileType] || 0}
                            </Badge>
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <Badge variant="outline">{rowTotal}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Download Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {totalFiles > 0 && (
              <>
                <FileText className="inline h-4 w-4 mr-1" />
                Total: {totalFiles} file{totalFiles > 1 ? 's' : ''} akan didownload
              </>
            )}
          </div>
          <Button
            onClick={handleBulkDownload}
            disabled={selectedFileTypes.length === 0 || totalFiles === 0 || isDownloading || isPending}
            className="min-w-[140px]"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download ZIP'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
