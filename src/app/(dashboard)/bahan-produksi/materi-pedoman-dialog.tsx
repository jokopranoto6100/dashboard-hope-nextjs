// src/app/(dashboard)/bahan-produksi/materi-pedoman-dialog.tsx
'use client';

import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { materiPedomanLinkSchema } from '@/lib/schemas';
import { updateMateriPedomanLink } from './_actions';

import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Settings } from 'lucide-react';

interface MateriPedomanDialogProps {
  initialHref: string;
}

type FormValues = z.infer<typeof materiPedomanLinkSchema>;

export function MateriPedomanDialog({ initialHref }: MateriPedomanDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(materiPedomanLinkSchema),
    defaultValues: {
      href: initialHref || '#',
    },
  });

  const onSubmit = (values: FormValues) => {
    const formData = new FormData();
    formData.append('href', values.href);

    startTransition(async () => {
      const result = await updateMateriPedomanLink(formData);
      if (result.success) {
        toast.success('Link berhasil diperbarui.');
        setOpen(false);
      } else {
        // --- PERBAIKAN: Logika penanganan error yang type-safe ---
        const error = result.error;
        let errorMessage = 'Gagal memperbarui link.'; // Pesan default

        if (error) {
          // Cek apakah error memiliki properti 'href' (dari validasi Zod)
          if ('href' in error && error.href) {
            errorMessage = error.href[0];
          // Cek apakah error memiliki properti '_form' (dari error server/DB)
          } else if ('_form' in error && error._form) {
            errorMessage = error._form[0];
          }
        }
        toast.error(errorMessage);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kelola Link Dokumen</DialogTitle>
          <DialogDescription>
            Ubah link tujuan untuk tombol "Lihat Semua Dokumen".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="href"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Tujuan</FormLabel>
                  <FormControl>
                    <Input placeholder="https://contoh.com/semua-dokumen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}