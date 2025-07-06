"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateKehutananAction } from "./_actions";
import { PerusahaanKehutanan, ALL_STATUSES } from "./kehutanan.types";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  nama_perusahaan: z.string().min(3, "Nama perusahaan minimal 3 karakter."),
  alamat_lengkap: z.string().optional(),
  status_perusahaan: z.enum(ALL_STATUSES).optional(), // Menggunakan konstanta
  keterangan: z.string().optional(),
});

interface KehutananFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  perusahaan: PerusahaanKehutanan | null;
  onSuccess: () => void;
}

export function KehutananForm({ isOpen, setIsOpen, perusahaan, onSuccess }: KehutananFormProps) {
  const { userRole } = useAuth();
  const [isPending, startTransition] = useTransition();
  const isSuperAdmin = userRole === 'super_admin';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (perusahaan) {
        form.reset({
            nama_perusahaan: perusahaan.nama_perusahaan || '',
            alamat_lengkap: perusahaan.alamat_lengkap || '',
            status_perusahaan: perusahaan.status_perusahaan || undefined,
            keterangan: perusahaan.keterangan || '',
        });
    }
  }, [perusahaan, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!perusahaan) return;
    
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) { formData.append(key, String(value)); }
    });

    startTransition(async () => {
      const result = await updateKehutananAction(perusahaan.id, formData);
      if (result.success) {
        toast.success("Data perusahaan berhasil diperbarui.");
        onSuccess();
      } else {
        // ✅ DIUBAH: Penanganan error yang aman dari masalah tipe data
        let errorMessage = "Gagal memperbarui: Terjadi kesalahan pada server.";
        if (result.error && '_form' in result.error && result.error._form) {
            errorMessage = result.error._form[0];
        }
        toast.error(errorMessage);
      }
    });
  };

  if (!perusahaan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Edit Perusahaan: {perusahaan.nama_perusahaan}</DialogTitle>
                <DialogDescription>Hanya kolom yang diizinkan yang akan tersimpan sesuai dengan peran Anda.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <FormField control={form.control} name="nama_perusahaan" render={({ field }) => ( <FormItem><FormLabel>Nama Perusahaan</FormLabel><FormControl><Input {...field} disabled={!isSuperAdmin} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="alamat_lengkap" render={({ field }) => ( <FormItem><FormLabel>Alamat Lengkap</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="status_perusahaan" render={({ field }) => ( <FormItem><FormLabel>Status Perusahaan</FormLabel> 
                    <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Pilih status..." /></SelectTrigger></FormControl> 
                        <SelectContent>
                        {ALL_STATUSES.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                        </SelectContent> 
                    </Select> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="keterangan" render={({ field }) => ( <FormItem><FormLabel>Keterangan</FormLabel><FormControl><Textarea {...field} disabled={!isSuperAdmin} /></FormControl><FormMessage /></FormItem> )}/>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan Perubahan</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}