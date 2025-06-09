// src/app/auth/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      return; // Hentikan eksekusi jika ada error otentikasi
    }

    // --- Bagian BARU untuk mengambil peran dari public.users dan mengupdate user_metadata ---
    if (authData.user) {
      // Ambil user dari tabel public.users
      const { data: userData, error: userError } = await supabase
        .from('users') // Nama tabel user Anda
        .select('id, username, role') // Pilih kolom yang dibutuhkan
        .eq('email', authData.user.email) // Cocokkan dengan email user yang login
        .single(); // Harusnya hanya ada satu user dengan email tersebut

      if (userError) {
        toast.error('Error Memuat Data User', {
          description: 'Gagal mengambil informasi peran user. Pastikan RLS diizinkan.',
        });
        // Mungkin tetap lanjut login tapi dengan role default atau error
        setLoading(false);
        return;
      }

      if (userData) {
        // Update user_metadata di Supabase Auth dengan peran dari tabel public.users
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            username: userData.username, // Update username jika ada di tabel Anda
            role: userData.role, // Simpan peran yang sebenarnya
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
    // --- Akhir Bagian BARU ---

    toast.success('Login Berhasil!', {
      description: 'Anda akan diarahkan ke dashboard.',
    });
    router.push('/');
    setLoading(false);
  };

  return (
    // ... (Kode UI yang sama persis seperti sebelumnya)
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col lg:flex-row">
        {/* Bagian Kiri (Form Login) */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Holla,</h1>
            <p className="text-gray-600 text-lg">Hey, welcome back to your hope</p>
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
                className="h-12 text-lg px-4 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
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
                className="h-12 text-lg px-4 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked: boolean) => setRememberMe(checked)}
                  className="mr-2"
                />
                <Label htmlFor="remember-me" className="text-gray-600 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <Button type="submit" className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-8 text-center text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline font-semibold">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Bagian Kanan (Ilustrasi) */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-500 to-indigo-600 items-center justify-center p-8">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-80"
                 style={{ backgroundImage: 'url("/images/login-illustration.svg")', backgroundSize: '80%', backgroundPosition: 'center' }}>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}