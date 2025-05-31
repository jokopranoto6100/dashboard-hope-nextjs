// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { YearProvider } from '@/context/YearContext';
// Hapus import ClientLayoutWrapper dan MainLayout dari sini jika tidak digunakan lagi secara langsung

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
    <html lang="en">
      <body className={inter.className}>
        <YearProvider>
          {children} {/* Langsung render children */}
        </YearProvider>
        <Toaster />
      </body>
    </html>
  );
}