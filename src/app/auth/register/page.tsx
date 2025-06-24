// /app/auth/register/page.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// Impor dari file baru
import { registerUserAction } from './_actions';
import { registerFormSchema, type RegisterFormValues } from './schema';

// Data Satker
import { daftarSatker } from '@/lib/satker-data';

// Komponen UI dari shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
      fullname: '',
      satker_id: undefined,
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    startTransition(async () => {
      const result = await registerUserAction(values);

      if (result.success) {
        toast.success('Registrasi Berhasil!', {
          description: result.message,
        });
        router.push('/auth/login');
      } else {
        toast.error('Registrasi Gagal', {
          description: result.message,
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col lg:flex-row-reverse">
        
        {/* Kolom Kiri: Formulir */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* FormField untuk fullname */}
              <FormField control={form.control} name="fullname" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap Anda" {...field} className="h-12 text-lg focus:border-teal-500 focus:ring-teal-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              {/* === KESALAHAN DIPERBAIKI DI SINI === */}
              {/* FormField untuk username */}
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username Anda" {...field} className="h-12 text-lg focus:border-teal-500 focus:ring-teal-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              {/* FormField untuk email */}
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email Anda" {...field} className="h-12 text-lg focus:border-teal-500 focus:ring-teal-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              
              {/* FormField untuk password */}
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password Anda" {...field} className="h-12 text-lg focus:border-teal-500 focus:ring-teal-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              
              {/* FormField untuk satker_id */}
              <FormField control={form.control} name="satker_id" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Satuan Kerja</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          // TAMBAHKAN `font-normal` di sini untuk menyamakan ketebalan font
                          className={cn(
                            "h-12 w-full justify-between text-lg font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? daftarSatker.find((satker) => satker.value === field.value)?.label
                            : "Pilih Satuan Kerja"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 h-[300px]">
                      <Command>
                        <CommandInput placeholder="Cari satuan kerja..." />
                        <CommandEmpty>Satuan kerja tidak ditemukan.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {daftarSatker.map((satker) => (
                              <CommandItem value={satker.label} key={satker.value} onSelect={() => { form.setValue("satker_id", satker.value); }}>
                                <Check className={cn("mr-2 h-4 w-4", satker.value === field.value ? "opacity-100" : "opacity-0")}/>
                                {satker.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}/>
              
              <Button type="submit" className="w-full h-12 text-lg bg-teal-500 hover:bg-teal-600" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Daftar
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-teal-600 hover:underline font-semibold">
              Login di sini
            </Link>
          </div>
        </div>

        {/* Kolom Kanan: Ilustrasi */}
        <div className="hidden lg:flex w-1/2 bg-gray-100 items-center justify-center p-8">
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-80"
                     style={{ backgroundImage: 'url("/images/login-illustration.png")', backgroundSize: '80%', backgroundPosition: 'center' }}>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}