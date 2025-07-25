// /app/auth/register/page.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useDarkMode } from '@/context/DarkModeContext';

import { registerUserAction } from './_actions';
import { registerFormSchema, type RegisterFormValues } from './schema';
import { daftarSatker } from '@/lib/satker-data';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown, Check, Loader2, Moon, Sun, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { isDark, toggleDarkMode } = useDarkMode();

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
        router.push('/auth/registration-success');
      } else {
        toast.error('Registrasi Gagal', {
          description: result.message,
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 sm:p-4">
      {/* Dark Mode Toggle */}
      <button
        className="fixed top-4 right-4 sm:top-4 sm:right-4 p-2 rounded-full border bg-background hover:bg-muted transition z-50 shadow-sm"
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
        type="button"
      >
        {isDark ? <Sun size={18} className="sm:w-5 sm:h-5 text-orange-500" /> : <Moon size={18} className="sm:w-5 sm:h-5 text-foreground" />}
      </button>
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col lg:flex-row-reverse">
        
        <div className="w-full lg:w-1/2 p-8 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          
          {/* === TAMBAHAN: Mengembalikan header formulir yang hilang === */}
          <div className="mb-8 sm:mb-8 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Buat Akun Baru</h1>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">Mulai perjalanan Anda bersama Dashboard HOPE</p>
          </div>

          {/* Informasi Penting tentang Proses Aktivasi */}
          <Alert className="mb-8 sm:mb-8 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm sm:text-base">
              <strong>Perhatian:</strong> Setelah registrasi, akun Anda perlu diaktifkan oleh Admin BPS Kalbar sebelum dapat login.
            </AlertDescription>
          </Alert>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-6">
              
              <FormField control={form.control} name="fullname" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap Anda" {...field} className="h-12 sm:h-12 text-base sm:text-lg px-4 sm:px-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-teal-500 dark:focus:border-teal-400 focus:ring focus:ring-teal-200 dark:focus:ring-teal-800" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username Anda" {...field} className="h-12 sm:h-12 text-base sm:text-lg px-4 sm:px-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-teal-500 dark:focus:border-teal-400 focus:ring focus:ring-teal-200 dark:focus:ring-teal-800" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email Anda" {...field} className="h-12 sm:h-12 text-base sm:text-lg px-4 sm:px-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-teal-500 dark:focus:border-teal-400 focus:ring focus:ring-teal-200 dark:focus:ring-teal-800" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password Anda" {...field} className="h-12 sm:h-12 text-base sm:text-lg px-4 sm:px-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-teal-500 dark:focus:border-teal-400 focus:ring focus:ring-teal-200 dark:focus:ring-teal-800" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            
              {/* Ganti blok FormField satker_id Anda dengan ini */}
              <FormField
                control={form.control}
                name="satker_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm sm:text-base">Satuan Kerja</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "h-12 sm:h-12 w-full justify-between text-sm sm:text-base font-normal px-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? daftarSatker.find(
                                  // PERBAIKAN: Konversi satker.value ke Number sebelum membandingkan
                                  (satker) => Number(satker.value) === field.value
                                )?.label
                              : "Pilih Satuan Kerja"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 h-[250px] sm:h-[300px]">
                        <Command>
                          <CommandInput placeholder="Cari satuan kerja..." className="h-9 sm:h-10 text-sm sm:text-sm" />
                          <CommandEmpty>Satuan kerja tidak ditemukan.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {daftarSatker.map((satker) => (
                                <CommandItem
                                  value={satker.label}
                                  key={satker.value}
                                  className="text-sm sm:text-sm py-2.5 sm:py-2"
                                  onSelect={() => {
                                    // PERBAIKAN: Pastikan nilai yang disimpan ke form adalah number
                                    form.setValue("satker_id", Number(satker.value));
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      // PERBAIKAN: Konversi satker.value ke Number sebelum membandingkan
                                      Number(satker.value) === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
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
                )}
              />
              
              <Button type="submit" className="w-full h-12 sm:h-12 text-base sm:text-lg bg-teal-500 dark:bg-teal-600 text-white hover:bg-teal-600 dark:hover:bg-teal-700" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Daftar
              </Button>
            </form>
          </Form>

          <div className="mt-8 sm:mt-8 text-center text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-teal-600 dark:text-teal-400 hover:underline font-semibold">
              Login di sini
            </Link>
          </div>
        </div>

        {/* Kolom Kanan: Ilustrasi */}
        <div className="hidden lg:flex w-1/2 bg-gray-100 dark:bg-gray-700 items-center justify-center p-8 sm:p-12">
            <div className="relative w-full h-full flex items-center justify-center">
                {/* === PERBAIKAN: Menggunakan gambar yang sesuai untuk registrasi === */}
                <div className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-80"
                     style={{ backgroundImage: 'url("/images/login-illustration.png")', backgroundSize: '80%', backgroundPosition: 'center' }}>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}