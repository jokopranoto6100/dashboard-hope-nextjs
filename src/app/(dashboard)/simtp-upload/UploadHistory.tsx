// /app/(dashboard)/simtp-upload/UploadHistory.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { getUploadHistoryAction } from "./_actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface UploadHistoryProps {
  year: number;
  satkerId: string;
}

type UploadLog = {
  id: string;
  uploaded_at: string;
  file_type: string;
  file_name: string;
};

export function UploadHistory({ year, satkerId }: UploadHistoryProps) {
  const [history, setHistory] = useState<UploadLog[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (year && satkerId) {
      startTransition(async () => {
        const result = await getUploadHistoryAction({ year, satkerId });
        if (result.success) {
          setHistory(result.data || []);
        } else {
          console.error(result.error);
          setHistory([]);
        }
      });
    }
  }, [year, satkerId]);

  // BARU: Helper function untuk format tanggal sesuai referensi Anda
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      // Format tanggal: "23 Juni 2025"
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      // Format waktu: "17:43"
      const formattedTime = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Gunakan format 24 jam
      });
      return `${formattedDate}, ${formattedTime}`;
    } catch {
      return "Format tanggal tidak valid";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Upload</CardTitle>
        <CardDescription>
          Menampilkan riwayat upload untuk Satker **{satkerId}** pada tahun **{year}**.
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {/* DIUBAH: Menggunakan helper function baru */}
                      {formatTimestamp(log.uploaded_at)}
                    </TableCell>
                    <TableCell><Badge variant="secondary">{log.file_type}</Badge></TableCell>
                    <TableCell className="font-mono">{log.file_name}</TableCell>
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