"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Kegiatan, type JadwalItem } from "./jadwal.config";

const formSchema = z.object({
  kegiatan_id: z.string().uuid({ message: "Kegiatan harus dipilih." }),
  nama: z.string().min(3, { message: "Nama jadwal minimal 3 karakter." }),
  keterangan: z.string().optional(),
  tanggal: z.object({
    from: z.date({ required_error: "Tanggal mulai harus diisi." }),
    to: z.date({ required_error: "Tanggal selesai harus diisi." }),
  }),
  warna: z.enum(['blue', 'green', 'amber', 'sky', 'slate'], { required_error: "Warna harus dipilih."}),
});

interface JadwalFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  kegiatanList: Kegiatan[];
  onSuccess: () => void;
  jadwalItem?: JadwalItem | null;
}

export function JadwalForm({ isOpen, setIsOpen, kegiatanList, onSuccess, jadwalItem }: JadwalFormProps) {
  const { supabase } = useAuth();
  const isEditMode = !!jadwalItem;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  React.useEffect(() => {
    if (isOpen && jadwalItem) {
      form.reset({
        kegiatan_id: jadwalItem.kegiatan_id,
        nama: jadwalItem.nama,
        keterangan: jadwalItem.keterangan || "",
        tanggal: { from: new Date(jadwalItem.startDate), to: new Date(jadwalItem.endDate) },
        warna: jadwalItem.warna,
      });
    } else if (isOpen && !jadwalItem) {
      form.reset({
        kegiatan_id: undefined, nama: "", keterangan: "", tanggal: { from: undefined, to: undefined }, warna: undefined
      });
    }
  }, [isOpen, jadwalItem, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formatDateForDB = (date: Date) => date.toISOString().split('T')[0];

    const rpcPayload = {
      p_nama: values.nama,
      p_keterangan: values.keterangan,
      p_start_date: formatDateForDB(values.tanggal.from),
      p_end_date: formatDateForDB(values.tanggal.to),
      p_warna: values.warna,
    };

    const promiseAction = async () => {
      const rpcToCall = isEditMode ? 'update_jadwal_item' : 'create_jadwal_item';
      const finalPayload = isEditMode
        ? { ...rpcPayload, p_item_id: jadwalItem!.id }
        : { ...rpcPayload, p_kegiatan_id: values.kegiatan_id };
      
      const { error } = await supabase.rpc(rpcToCall, finalPayload);
      if (error) {
        throw new Error(error.message);
      }
    };

    toast.promise(promiseAction(), {
      loading: isEditMode ? "Menyimpan perubahan..." : "Menambahkan jadwal...",
      success: () => {
        onSuccess();
        return `Jadwal berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}.`;
      },
      error: (err) => `Gagal: ${err.message}`,
    });
  };
  
  const selectableKegiatanList = React.useMemo(() => {
    return kegiatanList.flatMap(kegiatan => {
      if (kegiatan.subKegiatan && kegiatan.subKegiatan.length > 0) {
        return kegiatan.subKegiatan.map(sub => ({
          id: sub.id,
          name: `${kegiatan.kegiatan} > ${sub.kegiatan}`
        }));
      }
      if (!kegiatan.subKegiatan || kegiatan.subKegiatan.length === 0) {
        return [{ id: kegiatan.id, name: kegiatan.kegiatan }];
      }
      return [];
    });
  }, [kegiatanList]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Jadwal" : "Tambah Jadwal Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="kegiatan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kegiatan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kegiatan..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectableKegiatanList.map(k => (
                        <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Jadwal</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: Pencacahan Lapangan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Deskripsi singkat jadwal (opsional)..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tanggal"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Rentang Tanggal</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("pl-3 text-left font-normal", !field.value?.from && "text-muted-foreground")}
                        >
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {field.value.from.toLocaleDateString('id-ID', { dateStyle: 'long' })} - {field.value.to.toLocaleDateString('id-ID', { dateStyle: 'long' })}
                              </>
                            ) : (
                              field.value.from.toLocaleDateString('id-ID', { dateStyle: 'long' })
                            )
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={field.value}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="warna"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warna</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih warna..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sky">Biru Langit</SelectItem>
                      <SelectItem value="green">Hijau</SelectItem>
                      <SelectItem value="amber">Kuning</SelectItem>
                      <SelectItem value="blue">Biru Tua</SelectItem>
                      <SelectItem value="slate">Abu-abu</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}