// src/app/auth/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { useDarkMode } from '@/context/DarkModeContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Moon, Sun } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isDark, toggleDarkMode } = useDarkMode();

  const { supabase } = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      toast.error('Login Gagal', {
        description: authError.message,
      });
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, role, is_active')
        .eq('email', authData.user.email)
        .single();

      if (userError) {
        toast.error('Error Memuat Data User', {
          description: 'Gagal mengambil informasi peran user.',
        });
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (userData) {
        if (userData.is_active === false) {
          toast.error('Login Gagal', {
            description: 'Akun Anda telah dinonaktifkan oleh admin.',
          });
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            username: userData.username,
            role: userData.role,
          },
        });

        if (updateError) {
          toast.error('Error Update Profil', {
            description: updateError.message,
          });
          setLoading(false);
          return;
        }
      }
    }

    toast.success('Login Berhasil!', {
      description: 'Anda akan diarahkan ke dashboard.',
    });
    router.push('/');
    setLoading(false);
  };

  return (
    // UBAH: Menggunakan warna latar belakang abu-abu sangat muda agar lebih lembut
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      {/* Dark Mode Toggle */}
      <button
        className="fixed top-4 right-4 p-2 rounded-full border bg-background hover:bg-muted transition z-50 shadow-sm"
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
        type="button"
      >
        {isDark ? <Sun size={20} className="text-foreground" /> : <Moon size={20} className="text-foreground" />}
      </button>
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Kolom Kiri - Form Login */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          {/* Anda bisa menambahkan logo di sini jika mau */}
          {/* <Image src="/logo-hope.png" alt="HOPE Logo" width={150} height={50} className="mb-8" /> */}

          <div className="mb-8">
            {/* UBAH: Menyesuaikan warna heading agar cocok dengan abu-abu di logo */}
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">Hey!</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Welcome back to your hope</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder="Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                // UBAH: Mengubah warna focus ring menjadi teal
                className="h-12 text-lg px-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-teal-500 dark:focus:border-teal-400 focus:ring focus:ring-teal-200 dark:focus:ring-teal-800"
              />
            </div>
            <div>
              <Label htmlFor="password" className="sr-only">Password</Label>
              <Input
                type="password"
                id="password"
                placeholder="Password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                // UBAH: Mengubah warna focus ring menjadi teal
                className="h-12 text-lg px-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-teal-500 dark:focus:border-teal-400 focus:ring focus:ring-teal-200 dark:focus:ring-teal-800"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                  checked={rememberMe}
                  className="mr-2"
                />
                <Label htmlFor="remember-me" className="text-gray-600 dark:text-gray-300 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link href="/auth/forgot-password" passHref>
                 {/* UBAH: Mengubah warna link menjadi teal */}
                <span className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer">Forgot Password?</span>
              </Link>
            </div>
             {/* UBAH: Mengubah warna tombol menjadi teal */}
            <Button type="submit" className="w-full h-12 text-lg bg-teal-500 dark:bg-teal-600 text-white hover:bg-teal-600 dark:hover:bg-teal-700" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-8 text-center text-gray-600 dark:text-gray-300">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" passHref>
               {/* UBAH: Mengubah warna link menjadi teal */}
              <span className="text-teal-600 dark:text-teal-400 hover:underline font-semibold cursor-pointer">Sign Up</span>
            </Link>
          </div>
        </div>

        {/* Kolom Kanan - Ilustrasi */}
        {/* UBAH: Mengganti gradien ungu-indigo dengan gradien abu-abu gelap ke teal yang sesuai logo */}
        <div className="hidden lg:flex w-1/2 bg-gray-100 dark:bg-gray-700 items-center justify-center p-12">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Anda bisa mengganti ilustrasi ini dengan logo HOPE ukuran besar jika lebih suka */}
            <div className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-80"
                 style={{ backgroundImage: 'url("/images/login-illustration.png")', backgroundSize: '90%', backgroundPosition: 'center' }}>
            </div>
            {/* Contoh jika ingin menampilkan logo HOPE di panel kanan */}
            {/* <Image src="/logo-hope.png" alt="HOPE Logo" width={300} height={100} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}