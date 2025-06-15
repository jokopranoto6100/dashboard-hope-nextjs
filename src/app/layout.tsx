// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { YearProvider } from '@/context/YearContext';
import { AuthProvider } from '@/context/AuthContext'; // <== Tambahkan import ini

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
        <AuthProvider> {/* <== Tambahkan AuthProvider membungkus semua children */}
          <YearProvider>
            {children}
          </YearProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
