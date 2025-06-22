/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/pengguna/user-import-dialog.tsx
'use client';

import React, { useState, useTransition } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { bulkImportUsersAction } from './_actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export function UserImportDialog() {
  const [isPending, startTransition] = useTransition();
  const [usersToImport, setUsersToImport] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [open, setOpen] = useState(false);

  const resetState = () => {
    setUsersToImport([]);
    setFileName('');
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        const requiredColumns = ['email', 'full_name', 'username', 'satker_id', 'role'];
        if (json.length > 0 && !requiredColumns.every(col => col in json[0])) {
            toast.error("Format file tidak sesuai. Pastikan kolom 'email', 'full_name', 'username', 'satker_id', dan 'role' ada.");
            return;
        }

        const validUsers = json.filter(user => user.email && user.full_name && user.username && user.satker_id && user.role);
        setUsersToImport(validUsers);
        if (json.length !== validUsers.length) {
            toast.warning("Beberapa baris tidak valid dan dilewati karena data tidak lengkap.");
        }
      } catch (error) {
        toast.error("Gagal membaca file. Pastikan format file benar (.xlsx atau .csv).")
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
      if(usersToImport.length === 0) {
          toast.error("Tidak ada data valid untuk diimpor.");
          return;
      }
      startTransition(async () => {
          const result = await bulkImportUsersAction(usersToImport);
          if (result.success) {
              toast.success(result.message);
              if (result.data?.errors && result.data.errors.length > 0) {
                  console.error("Detail kegagalan impor:", result.data.errors);
                  toast.error(`Gagal mengimpor ${result.data.errors.length} pengguna. Cek console untuk detail.`);
              }
              setOpen(false);
          } else {
              toast.error(result.message);
          }
      });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetState(); }}>
      <DialogTrigger asChild>
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Impor dari Excel</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Impor Pengguna Massal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Unggah file .xlsx atau .csv dengan kolom: `email`, `full_name`, `username`, `satker_id`, `role`.
          </p>
          <Input type="file" accept=".xlsx, .csv" onChange={handleFileChange} />
          {fileName && (
              <p className="text-sm">File terpilih: <span className="font-semibold">{fileName}</span></p>
          )}
          {usersToImport.length > 0 && (
              <p className="text-sm font-medium text-green-600">{usersToImport.length} pengguna valid siap untuk diimpor.</p>
          )}
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Peringatan Keamanan</AlertTitle>
            <AlertDescription>
              Password akan diatur sama dengan bagian nama dari email (sebelum @). Sangat disarankan agar pengguna segera mengubahnya setelah login pertama.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" disabled={isPending}>Batal</Button></DialogClose>
          <Button onClick={handleImport} disabled={isPending || usersToImport.length === 0}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Impor {usersToImport.length > 0 ? `(${usersToImport.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}