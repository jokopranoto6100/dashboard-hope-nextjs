// src/app/kehutanan/page.tsx

import { HardHat, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Asumsi Anda menggunakan Button dari Shadcn/ui

export default function KehutananPage() {
  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center rounded-lg border-2 border-dashed bg-background">
      <div className="flex flex-col items-center text-center p-8">
        <div className="mb-6 rounded-full bg-amber-100 p-4 dark:bg-amber-900/50">
          <HardHat className="h-12 w-12 text-amber-500 dark:text-amber-400" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Halaman Sedang Dibangun
        </h1>
        
        <p className="mt-4 max-w-lg text-muted-foreground">
          Kami sedang menyiapkan halaman Kehutanan. Fitur-fitur menarik akan segera hadir di sini. Silakan kembali lagi nanti!
        </p>
        
        <div className="mt-8">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}