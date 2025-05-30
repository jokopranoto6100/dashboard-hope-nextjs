// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import ClientLayoutWrapper from './client-layout-wrapper';
import { YearProvider } from '@/context/YearContext'; // Import YearProvider

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dashboard HOPE',
  description: 'Statistik Produksi Pertanian BPS Kalbar',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <YearProvider> {/* Bungkus seluruh aplikasi dengan YearProvider */}
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </YearProvider>
        <Toaster />
      </body>
    </html>
  );
}