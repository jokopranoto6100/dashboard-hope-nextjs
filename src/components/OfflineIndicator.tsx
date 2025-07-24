"use client";

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    // Listen untuk perubahan status koneksi
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hanya tampilkan jika offline
  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800 p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <WifiOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Tidak ada koneksi internet
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              Anda sedang menggunakan data yang tersimpan offline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
