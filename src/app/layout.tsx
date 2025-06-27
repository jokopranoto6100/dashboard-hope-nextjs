// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { YearProvider } from '@/context/YearContext';
import { AuthProvider } from '@/context/AuthContext';
import { Analytics } from '@vercel/analytics/react'; // <-- 1. Tambahkan import ini

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dashboard HOPE',
  description: 'Statistik Produksi Pertanian BPS Kalbar',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id"> 
      <body className={inter.className}>
        <AuthProvider>
          <YearProvider>
            {children}
          </YearProvider>
        </AuthProvider>
        <Toaster />
        <Analytics /> 
      </body>
    </html>
  );
}