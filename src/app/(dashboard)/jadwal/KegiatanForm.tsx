"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Kegiatan } from "./jadwal.config";

const formSchema = z.object({
  nama_kegiatan: z.string().min(3, { message: "Nama kegiatan minimal 3 karakter." }),
  parent_id: z.string().optional(),
});

interface KegiatanFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  kegiatanList: Kegiatan[];
  onSuccess: () => void;
}

export function KegiatanForm({ isOpen, setIsOpen, kegiatanList, onSuccess }: KegiatanFormProps) {
  const { supabase } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_kegiatan: "",
      parent_id: "",
    },
  });
  
  // ✅ DIUBAH: Logika submit diperbaiki untuk menangani Promise
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload = {
      p_nama_kegiatan: values.nama_kegiatan,
      p_parent_id: values.parent_id || null, 
    };

    const promiseAction = async () => {
        const { error } = await supabase.rpc("create_kegiatan", payload);
        if (error) {
            throw new Error(error.message);
        }
    };

    toast.promise(promiseAction(), {
      loading: "Membuat kegiatan baru...",
      success: () => {
        form.reset();
        onSuccess();
        return `Kegiatan "${values.nama_kegiatan}" berhasil dibuat.`;
      },
      error: (err) => `Gagal: ${err.message}`,
    });
  };
  
  // Filter ini sekarang akan bekerja dengan benar karena 'parent_id' sudah ada di tipe 'Kegiatan'
  const parentKegiatanList = kegiatanList.filter(k => !k.parent_id);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Kegiatan Baru</DialogTitle>
          <DialogDescription>Buat kegiatan utama atau sub-kegiatan baru. Biarkan 'Induk Kegiatan' kosong untuk membuat kegiatan utama.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="nama_kegiatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kegiatan Baru</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: Survei Ternak atau Pengolahan Data" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Induk Kegiatan (Opsional)</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value === "null-value" ? "" : value);
                    }} 
                    value={field.value || "null-value"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih induk kegiatan..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null-value">-- Tidak Ada Induk (Kegiatan Utama) --</SelectItem>
                      {parentKegiatanList.map(kegiatan => (
                         <SelectItem key={kegiatan.id} value={kegiatan.id}>{kegiatan.kegiatan}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Menyimpan..." : "Buat Kegiatan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}