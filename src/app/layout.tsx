// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { YearProvider } from '@/context/YearContext';
import { AuthProvider } from '@/context/AuthContext';
import { DarkModeProvider } from '@/context/DarkModeContext';
import { Analytics } from '@vercel/analytics/react'; // <-- 1. Tambahkan import ini
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import SplashWrapper from '@/components/SplashWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dashboard HOPE',
  description: 'Statistik Produksi Pertanian BPS Kalbar',
  manifest: '/manifest.json',
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon/hope.png',
    shortcut: '/icon/hope.png',
    apple: '/icon/hope.png',
  },
};

// Export viewport tanpa themeColor untuk menghindari splash screen
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id"> 
      <head>
        <meta name="application-name" content="Dashboard HOPE" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dashboard HOPE" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#8984d8" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#8984d8" />
        
        <link rel="apple-touch-icon" href="/icon/hope.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon/hope.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon/hope.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icon/hope.png" />
        
        {/* iOS Splash Screen */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-startup-image" href="/icon/icon-512x512.png" />
        
        <link rel="icon" type="image/png" sizes="32x32" href="/icon/hope.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon/hope.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icon/hope.png" color="#8984d8" />
        <link rel="shortcut icon" href="/icon/hope.png" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://yourapp.com" />
        <meta name="twitter:title" content="Dashboard HOPE" />
        <meta name="twitter:description" content="Statistik Produksi Pertanian BPS Kalbar" />
        <meta name="twitter:image" content="https://yourapp.com/icon/hope.png" />
        <meta name="twitter:creator" content="@BPSKalbar" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Dashboard HOPE" />
        <meta property="og:description" content="Statistik Produksi Pertanian BPS Kalbar" />
        <meta property="og:site_name" content="Dashboard HOPE" />
        <meta property="og:url" content="https://yourapp.com" />
        <meta property="og:image" content="https://yourapp.com/icon/hope.png" />
      </head>
      <body className={inter.className}>
        <SplashWrapper>
          <DarkModeProvider>
            <AuthProvider>
              <YearProvider>
                {children}
              </YearProvider>
            </AuthProvider>
          </DarkModeProvider>
          <Toaster />
          <PWAInstallPrompt />
          <OfflineIndicator />
          <Analytics /> 
        </SplashWrapper>
      </body>
    </html>
  );
}