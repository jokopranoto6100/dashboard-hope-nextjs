// src/app/auth/register/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner'; // Import toast dari sonner

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { supabase }= useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (error) {
      toast.error('Registrasi Gagal', {
        description: error.message,
      });
    } else {
      toast.success('Registrasi Berhasil!', {
        description: 'Silakan cek email Anda untuk verifikasi (jika diaktifkan).',
      });
      router.push('/auth/login');
    }
    setLoading(false);
  };

  return (
    // ... (Kode UI yang sama)
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col lg:flex-row-reverse">
        <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Buat Akun Baru</h1>
            <p className="text-gray-600 text-lg">Mulai perjalanan Anda bersama Dashboard HOPE</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <Label htmlFor="username" className="sr-only">Username</Label>
              <Input
                type="text"
                id="username"
                placeholder="Username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 text-lg px-4 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
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
            <Button type="submit" className="w-full h-12 text-lg bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Registering...' : 'Daftar'}
            </Button>
          </form>
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