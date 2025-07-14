// /app/(dashboard)/simtp-upload/UploadHistory.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { getUploadHistoryAction, downloadSimtpFileAction } from "./_actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface UploadHistoryProps {
  year: number;
  satkerId: string;
}

type UploadLog = {
  id: string;
  uploaded_at: string;
  file_type: string;
  file_name: string;
  storage_path?: string; // Add storage_path for download functionality
};

export function UploadHistory({ year, satkerId }: UploadHistoryProps) {
  const [history, setHistory] = useState<UploadLog[]>([]);
  const [isPending, startTransition] = useTransition();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (log: UploadLog) => {
    if (!log.storage_path) {
      toast.error("File tidak dapat didownload", { 
        description: "Path file tidak ditemukan. File mungkin berasal dari sistem lama." 
      });
      return;
    }

    setDownloadingId(log.id);
    try {
      const result = await downloadSimtpFileAction(log.storage_path);
      if (result.success && result.data) {
        // Create blob from buffer array
        const buffer = new Uint8Array(result.data.buffer);
        const blob = new Blob([buffer], { type: result.data.contentType });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success("File berhasil didownload");
      } else {
        toast.error("Gagal download file", { description: result.error });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat download file");
      console.error("Download error:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    if (year && satkerId) {
      startTransition(async () => {
        const result = await getUploadHistoryAction({ year, satkerId }); //
        if (result.success) {
          setHistory(result.data || []);
        } else {
          toast.error("Gagal memuat riwayat", { description: result.error });
          setHistory([]);
        }
      });
    }
  }, [year, satkerId]); //

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      const formattedTime = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return `${formattedDate}, ${formattedTime}`; //
    } catch {
      return "Format tanggal tidak valid";
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Riwayat Upload</CardTitle>
        <CardDescription>
          Menampilkan riwayat upload untuk Satker <strong>{satkerId}</strong> pada tahun <strong>{year}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-4">Belum ada riwayat upload untuk periode ini.</p>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu Upload</TableHead>
                  <TableHead>Jenis File</TableHead>
                  <TableHead>Nama File</TableHead>
                  <TableHead className="w-[120px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {formatTimestamp(log.uploaded_at)}
                    </TableCell>
                    <TableCell><Badge variant="secondary">{log.file_type}</Badge></TableCell>
                    <TableCell className="font-mono">{log.file_name}</TableCell>
                    <TableCell>
                      {log.storage_path ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(log)}
                          disabled={downloadingId === log.id}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {downloadingId === log.id ? "..." : "Download"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Tidak tersedia</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}