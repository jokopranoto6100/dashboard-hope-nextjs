// src/app/client-layout-wrapper.tsx
'use client';

import React, { useState, useCallback } from 'react';
import MainLayout from '@/components/layout/main-layout'; // Sesuaikan path jika perlu
import { getCookie } from 'cookies-next'; // Untuk membaca cookie

// Nama cookie ini harus SAMA dengan yang digunakan oleh SidebarProvider di components/ui/sidebar.tsx
// Di components/ui/sidebar.tsx Anda, namanya adalah SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_OPEN_STATE_COOKIE_NAME = "sidebar_state";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  // ✅ OPTIMALISASI 6: Simplified state initialization dengan lazy loading
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const cookieValue = getCookie(SIDEBAR_OPEN_STATE_COOKIE_NAME);
      if (cookieValue === undefined || cookieValue === null) {
        return false; // Default: sidebar terbuka
      }
      const isOpen = JSON.parse(cookieValue as string);
      return !isOpen; // isCollapsed adalah kebalikan dari isOpen
    } catch (error) {
      console.error("Error parsing sidebar state cookie:", error);
      return false; // Default jika parsing gagal
    }
  });

  // ✅ OPTIMALISASI 7: Memoize callback untuk mengurangi re-render
  const setAndPersistIsCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    // SidebarProvider akan menangani penulisan cookie
  }, []);

  return (
    <MainLayout isCollapsed={isCollapsed} setIsCollapsed={setAndPersistIsCollapsed}>
      {children}
    </MainLayout>
  );
}