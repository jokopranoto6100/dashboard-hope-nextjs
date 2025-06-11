'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// Data Satker
import { daftarSatker } from '@/lib/satker-data';

// Komponen UI dari shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronsUpDown, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClientComponentSupabaseClient } from '@/lib/supabase';

// Skema Validasi Form dengan Zod
const formSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
  username: z.string().min(3, { message: 'Username minimal 3 karakter.' }),
  fullname: z.string().min(3, { message: 'Nama lengkap harus diisi.' }),
  satker_id: z.string({ required_error: 'Satuan kerja harus dipilih.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
      fullname: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      // Langkah 1: SignUp ke auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (authError || !authData.user) {
        toast.error('Registrasi Gagal', {
          description: authError?.message || 'Gagal membuat pengguna di sistem otentikasi.',
        });
        return;
      }

      // Langkah 2: Insert data lengkap ke public.users
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        username: values.username,
        full_name: values.fullname,
        satker_id: values.satker_id,
        role: 'viewer', // Atur peran default untuk pengguna baru
      });

      if (profileError) {
        toast.error('Gagal Menyimpan Profil', {
          description: `Username mungkin sudah ada. Error: ${profileError.message}`,
        });
        // Rollback: Hapus user dari auth jika gagal insert profil
        await supabase.auth.admin.deleteUser(authData.user.id);
        return;
      }
      
      toast.success('Registrasi Berhasil!', {
        description: 'Silakan cek email Anda untuk verifikasi.',
      });
      router.push('/auth/login');
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col lg:flex-row-reverse">
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Buat Akun Baru</h1>
            <p className="text-gray-600 text-lg">Mulai perjalanan Anda bersama Dashboard HOPE</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="fullname" render={({ field }) => (
                <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input placeholder="Nama lengkap Anda" {...field} className="h-12" /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="Username Anda" {...field} className="h-12" /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="Email Anda" {...field} className="h-12" /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="Password Anda" {...field} className="h-12" /></FormControl><FormMessage /></FormItem>
              )}/>
              
              <FormField control={form.control} name="satker_id" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Satuan Kerja</FormLabel>
                  <Popover><PopoverTrigger asChild>
                    <FormControl><Button variant="outline" role="combobox" className={cn("h-12 w-full justify-between", !field.value && "text-muted-foreground")}>
                      {field.value ? daftarSatker.find((satker) => satker.value === field.value)?.label : "Pilih Satuan Kerja"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button></FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0 h-[300px]"><Command>
                    <CommandInput placeholder="Cari satuan kerja..." />
                    <CommandEmpty>Satuan kerja tidak ditemukan.</CommandEmpty>
                    <CommandList><CommandGroup>
                      {daftarSatker.map((satker) => (
                        <CommandItem value={satker.label} key={satker.value} onSelect={() => { form.setValue("satker_id", satker.value); }}>
                          <Check className={cn("mr-2 h-4 w-4", satker.value === field.value ? "opacity-100" : "opacity-0")}/>
                          {satker.label}
                        </CommandItem>
                      ))}
                    </CommandGroup></CommandList>
                  </Command></PopoverContent></Popover>
                  <FormMessage />
                </FormItem>
              )}/>

              <Button type="submit" className="w-full h-12 text-lg bg-green-600 hover:bg-green-700" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Daftar
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
              Login di sini
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-500 to-green-600 items-center justify-center p-8">
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-80"
                    style={{ backgroundImage: 'url("/images/register-illustration.svg")', backgroundSize: '80%', backgroundPosition: 'center' }}>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}