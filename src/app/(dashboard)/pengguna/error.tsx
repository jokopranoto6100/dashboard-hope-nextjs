// src/app/(dashboard)/pengguna/error.tsx
'use client';

import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error untuk debugging
    console.error('Pengguna page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Terjadi Kesalahan!</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">
            Gagal memuat halaman manajemen pengguna. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.
          </p>
          <details className="text-xs text-muted-foreground mb-4">
            <summary className="cursor-pointer hover:text-foreground">Detail error</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
          <Button onClick={reset} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
