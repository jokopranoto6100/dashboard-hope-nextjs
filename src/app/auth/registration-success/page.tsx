'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Phone, AlertCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { useDarkMode } from '@/context/DarkModeContext';
import { Sun, Moon } from 'lucide-react';

export default function RegistrationSuccessPage() {
  const [countdown, setCountdown] = useState(10);
  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      window.location.href = '/auth/login';
    }, 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-3 sm:p-4">
      {/* Dark Mode Toggle */}
      <button
        className="fixed top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full border bg-background hover:bg-muted transition z-50 shadow-sm"
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
        type="button"
      >
        {isDark ? <Sun size={18} className="sm:w-5 sm:h-5 text-foreground" /> : <Moon size={18} className="sm:w-5 sm:h-5 text-foreground" />}
      </button>

      <div className="w-full max-w-2xl">
        <Card className="shadow-xl mx-2 sm:mx-0">
          <CardHeader className="text-center pb-4 px-4 sm:px-6">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">
              Registrasi Berhasil!
            </CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Akun Anda telah terdaftar dalam sistem HOPE BPS Kalbar
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            {/* Status Alert */}
            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong>Akun Anda belum aktif.</strong> Diperlukan persetujuan admin sebelum dapat mengakses dashboard.
              </AlertDescription>
            </Alert>

            {/* Instructions */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                Langkah Selanjutnya:
              </h3>
              
              <div className="space-y-2 sm:space-y-3 pl-6 sm:pl-7">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <p className="text-xs sm:text-sm">
                    <strong>Chat WhatsApp Admin Produksi BPS Provinsi Kalbar</strong> untuk mengaktifkan akun Anda
                  </p>
                </div>
                
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <p className="text-xs sm:text-sm">
                    Berikan informasi: <strong>Nama Lengkap</strong>, <strong>Email</strong>, dan <strong>Satuan Kerja</strong> Anda
                  </p>
                </div>
                
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <p className="text-xs sm:text-sm">
                    Setelah akun diaktifkan, Anda dapat login menggunakan email dan password
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
              <h4 className="font-semibold text-center text-sm sm:text-base">Kontak Admin BPS Kalbar:</h4>
              <div className="flex flex-col gap-2 sm:gap-3 justify-center">
                <div className="flex items-center gap-2 justify-center">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                  <a href="https://wa.me/628174954463" className="text-teal-600 dark:text-teal-400 hover:underline text-xs sm:text-sm">
                    WhatsApp: +62 817-4954-463
                  </a>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                  <a href="tel:+62561740158" className="text-teal-600 dark:text-teal-400 hover:underline text-xs sm:text-sm">
                    Telp: (0561) 740158
                  </a>
                </div>
              </div>
            </div>

            {/* Warning */}
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Penting:</strong> Jangan mencoba login sebelum akun diaktifkan oleh admin. 
                Chat WhatsApp terlebih dahulu untuk proses aktivasi yang lebih cepat.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-3 sm:pt-4">
              <Button
                asChild
                variant="outline"
                className="w-full h-10 sm:h-auto text-sm sm:text-base"
              >
                <Link href="/auth/login">
                  Kembali ke Login
                </Link>
              </Button>
              
              <Button
                asChild
                className="w-full h-10 sm:h-auto text-sm sm:text-base bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700"
              >
                <a 
                  href="https://wa.me/628174954463?text=Halo%20Admin%20BPS%20Kalbar%2C%0A%0ASaya%20telah%20mendaftar%20di%20sistem%20Dashboard%20HOPE%20dan%20memerlukan%20aktivasi%20akun.%0A%0AInformasi%20Akun%3A%0A-%20Nama%3A%20%5BIsi%20nama%20lengkap%5D%0A-%20Email%3A%20%5BIsi%20email%20yang%20didaftarkan%5D%0A-%20Satuan%20Kerja%3A%20%5BIsi%20satuan%20kerja%5D%0A%0AMohon%20untuk%20mengaktifkan%20akun%20saya.%0A%0ATerima%20kasih."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Chat WhatsApp Admin
                </a>
              </Button>
            </div>

            {/* Auto redirect info */}
            <p className="text-center text-xs sm:text-sm text-muted-foreground">
              Halaman ini akan otomatis redirect ke login dalam {countdown} detik
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 inline ml-1" />
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
