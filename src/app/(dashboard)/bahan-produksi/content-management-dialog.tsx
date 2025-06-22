/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/bahan-produksi/content-management-dialog.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import type { SektorItem, LinkItem } from './page';
import {
  createSektor, updateSektor, deleteSektor,
  createLink, updateLink, deleteLink
} from './_actions';
import { availableIcons } from '@/lib/icon-map';

import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, PlusCircle, Edit, Trash2, Loader2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentManagementDialogProps {
  initialData: SektorItem[];
}

const sektorSchema = z.object({
  nama: z.string().min(3, 'Nama sektor minimal 3 karakter.'),
  icon_name: z.string().min(1, 'Ikon harus dipilih.'),
  urutan: z.coerce.number().int(),
});

const linkSchema = z.object({
  label: z.string().min(3, 'Label minimal 3 karakter.'),
  href: z.string().url('URL tidak valid.'),
  icon_name: z.string().min(1, 'Ikon harus dipilih.'),
  description: z.string().optional(),
  urutan: z.coerce.number().int(),
});

type SektorFormValues = z.infer<typeof sektorSchema>;
type LinkFormValues = z.infer<typeof linkSchema>;

export function ContentManagementDialog({ initialData }: ContentManagementDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [sektors, setSektors] = useState<SektorItem[]>(initialData);
  const [selectedSektor, setSelectedSektor] = useState<SektorItem | null>(initialData[0] || null);
  const [showSektorForm, setShowSektorForm] = useState(false);
  const [editingSektor, setEditingSektor] = useState<SektorItem | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'sektor' | 'link'; id: string; name: string; } | null>(null);

  const sektorForm = useForm<SektorFormValues>({ resolver: zodResolver(sektorSchema) });
  const linkForm = useForm<LinkFormValues>({ resolver: zodResolver(linkSchema) });

  const handleOpenSektorForm = (sektor: SektorItem | null) => {
    setEditingSektor(sektor);
    // PERBAIKAN: Konversi nilai null menjadi string kosong saat reset form
    sektorForm.reset({
      nama: sektor?.nama || '',
      icon_name: sektor?.icon_name || '',
      urutan: sektor?.urutan ?? sektors.length + 1,
    });
    setShowSektorForm(true);
  };

  const handleOpenLinkForm = (link: LinkItem | null) => {
    setEditingLink(link);
    const defaultUrutan = selectedSektor ? selectedSektor.links.length + 1 : 1;
    // PERBAIKAN: Konversi nilai null menjadi string kosong saat reset form
    linkForm.reset({
      label: link?.label || '',
      href: link?.href || '',
      icon_name: link?.icon_name || '',
      description: link?.description || '',
      urutan: link?.urutan ?? defaultUrutan,
    });
    setShowLinkForm(true);
  };

  const handleErrorToast = (error: any, defaultMessage: string) => {
    const formError = error?._form?.[0];
    toast.error(formError || defaultMessage);
  }

  const handleSektorSubmit = async (values: SektorFormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, String(value)));
    startTransition(async () => {
      const result = await (editingSektor ? updateSektor(editingSektor.id, formData) : createSektor(formData));
      if (result?.success) {
        toast.success(editingSektor ? 'Sektor berhasil diperbarui.' : 'Sektor berhasil dibuat.');
        setShowSektorForm(false);
      } else {
        handleErrorToast(result?.error, 'Gagal menyimpan sektor.');
      }
    });
  };

  const handleLinkSubmit = async (values: LinkFormValues) => {
    if (!selectedSektor) return;
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, String(value || '')));
    formData.append('sektor_id', selectedSektor.id);
    startTransition(async () => {
      const result = await (editingLink ? updateLink(editingLink.id, formData) : createLink(formData));
      if (result?.success) {
        toast.success(editingLink ? 'Link berhasil diperbarui.' : 'Link berhasil dibuat.');
        setShowLinkForm(false);
      } else {
        handleErrorToast(result?.error, 'Gagal menyimpan link.');
      }
    });
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    startTransition(async () => {
      const result = await (itemToDelete.type === 'sektor' ? deleteSektor(itemToDelete.id) : deleteLink(itemToDelete.id));
      if (result?.success) {
        toast.success(`${itemToDelete.type === 'sektor' ? 'Sektor' : 'Link'} berhasil dihapus.`);
        if (itemToDelete.type === 'sektor' && selectedSektor?.id === itemToDelete.id) setSelectedSektor(null);
      } else {
        handleErrorToast(result?.error, 'Gagal menghapus item.');
      }
      setItemToDelete(null);
    });
  };

  useEffect(() => {
    setSektors(initialData);
    const currentId = selectedSektor?.id;
    if (!currentId || !initialData.find(s => s.id === currentId)) {
      setSelectedSektor(initialData[0] || null);
    } else {
      const updated = initialData.find(s => s.id === currentId);
      if (updated) setSelectedSektor(updated);
    }
  }, [initialData, selectedSektor?.id]);


  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm"><Settings className="mr-2 h-4 w-4" /> Kelola Konten</Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Manajemen Konten Bahan Produksi</DialogTitle>
            <DialogDescription>Tambah, edit, atau hapus sektor dan link.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
            <div className="md:col-span-1 flex flex-col gap-2 bg-muted/50 p-3 rounded-lg overflow-hidden">
              <h3 className="font-semibold px-2">Daftar Sektor</h3>
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="space-y-1 pr-2">
                  {sektors.map(sektor => (
                    <div key={sektor.id} onClick={() => setSelectedSektor(sektor)} className={cn("flex items-center p-2 rounded-md cursor-pointer", selectedSektor?.id === sektor.id && "bg-primary text-primary-foreground")}>                      <GripVertical className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="flex-1 font-medium truncate">{sektor.nama}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={(e) => { e.stopPropagation(); handleOpenSektorForm(sektor); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-500/10 text-red-500 hover:text-red-500 flex-shrink-0" onClick={(e) => { e.stopPropagation(); setItemToDelete({type: 'sektor', id: sektor.id, name: sektor.nama}) }}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button onClick={() => handleOpenSektorForm(null)} className="mt-2"><PlusCircle className="mr-2 h-4 w-4"/> Tambah Sektor</Button>
            </div>
            <div className="md:col-span-2 flex flex-col gap-2 p-3 overflow-hidden">
              {selectedSektor ? (
                <>
                  <h3 className="font-semibold px-2">Link untuk: <span className="text-primary">{selectedSektor.nama}</span></h3>
                  <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="space-y-1 pr-2">
                      {selectedSektor.links.map(link => (
                        <div key={link.id} className="grid grid-cols-[auto,1fr,auto] items-center gap-2 p-2 rounded-md border">
                          <div className="min-w-0">
                            <p className="font-medium truncate" title={link.label}>{link.label}</p>
                            <p className="text-xs text-muted-foreground truncate" title={link.href || ''}>{link.href}</p>
                          </div>
                          <div className="flex">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenLinkForm(link)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-500/10 text-red-500" onClick={() => setItemToDelete({type: 'link', id: link.id, name: link.label})}><Trash2 className="h-4 w-4"/></Button>
                          </div>
                        </div>
                      ))}
                      {selectedSektor.links.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">Belum ada link di sektor ini.</p>}
                    </div>
                  </ScrollArea>
                  <Button onClick={() => handleOpenLinkForm(null)} className="mt-2"><PlusCircle className="mr-2 h-4 w-4"/> Tambah Link</Button>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Pilih sebuah sektor untuk melihat link-nya.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showSektorForm} onOpenChange={setShowSektorForm}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editingSektor ? 'Edit Sektor' : 'Tambah Sektor Baru'}</DialogTitle></DialogHeader>
          <Form {...sektorForm}>
            <form onSubmit={sektorForm.handleSubmit(handleSektorSubmit)} className="space-y-4 py-4">
              <FormField name="nama" control={sektorForm.control} render={({field}) => (<FormItem><FormLabel>Nama Sektor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
              <FormField name="icon_name" control={sektorForm.control} render={({field}) => (<FormItem><FormLabel>Ikon</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Ikon"/></SelectTrigger></FormControl><SelectContent><ScrollArea className="h-60">{availableIcons.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</ScrollArea></SelectContent></Select><FormMessage/></FormItem>)}/>
              <FormField name="urutan" control={sektorForm.control} render={({field}) => (<FormItem><FormLabel>Urutan</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowSektorForm(false)} disabled={isPending}>Batal</Button>
                <Button type="submit" disabled={isPending}>{isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Simpan'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={showLinkForm} onOpenChange={setShowLinkForm}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editingLink ? 'Edit Link' : 'Tambah Link Baru'}</DialogTitle><DialogDescription>Menambahkan link ke sektor: {selectedSektor?.nama}</DialogDescription></DialogHeader>
          <Form {...linkForm}>
            <form onSubmit={linkForm.handleSubmit(handleLinkSubmit)} className="space-y-4 py-4">
              <FormField name="label" control={linkForm.control} render={({field}) => (<FormItem><FormLabel>Label</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
              <FormField name="href" control={linkForm.control} render={({field}) => (<FormItem><FormLabel>URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
              <FormField name="description" control={linkForm.control} render={({field}) => (<FormItem><FormLabel>Deskripsi (Opsional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
              <FormField name="icon_name" control={linkForm.control} render={({field}) => (<FormItem><FormLabel>Ikon</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Ikon"/></SelectTrigger></FormControl><SelectContent><ScrollArea className="h-60">{availableIcons.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</ScrollArea></SelectContent></Select><FormMessage/></FormItem>)}/>
              <FormField name="urutan" control={linkForm.control} render={({field}) => (<FormItem><FormLabel>Urutan</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)}/>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowLinkForm(false)} disabled={isPending}>Batal</Button>
                <Button type="submit" disabled={isPending}>{isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Simpan'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "{itemToDelete?.name}"? Aksi ini tidak dapat diurungkan.
              {itemToDelete?.type === 'sektor' && ' Menghapus sektor juga akan menghapus semua link di dalamnya.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}