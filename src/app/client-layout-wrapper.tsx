// src/app/client-layout-wrapper.tsx
'use client';

import React, { useState} from 'react';
import MainLayout from '@/components/layout/main-layout'; // Sesuaikan path jika perlu
import { getCookie } from 'cookies-next'; // Untuk membaca cookie

// Nama cookie ini harus SAMA dengan yang digunakan oleh SidebarProvider di components/ui/sidebar.tsx
// Di components/ui/sidebar.tsx Anda, namanya adalah SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_OPEN_STATE_COOKIE_NAME = "sidebar_state";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  // Inisialisasi state 'isCollapsed'.
  // 'isCollapsed' adalah kebalikan dari 'isOpen' yang disimpan di cookie.
  // Jika cookie 'sidebar_state' adalah 'true' (berarti sidebar OPEN/EXPANDED), maka isCollapsed harus 'false'.
  // Jika cookie 'sidebar_state' adalah 'false' (berarti sidebar CLOSED/COLLAPSED), maka isCollapsed harus 'true'.
  // Default jika tidak ada cookie: sidebar tidak diciutkan (isCollapsed = false).
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const cookieValue = getCookie(SIDEBAR_OPEN_STATE_COOKIE_NAME);
    if (cookieValue === undefined || cookieValue === null) {
      // Tidak ada cookie, default ke sidebar terbuka (tidak diciutkan)
      // SidebarProvider memiliki defaultOpen = true, yang berarti open = true, jadi isCollapsed = false.
      return false;
    }
    try {
      const isOpen = JSON.parse(cookieValue as string); // Cookie menyimpan status 'open'
      return !isOpen; // isCollapsed adalah kebalikan dari isOpen
    } catch (error) {
      console.error("Error parsing sidebar state cookie:", error);
      return false; // Default jika parsing gagal
    }
  });

  // `SidebarProvider` di dalam `MainLayout` akan menangani penulisan cookie
  // ketika prop `open` (yang merupakan `!isCollapsed`) berubah.
  // Fungsi `setAndPersistIsCollapsed` hanya perlu memanggil `setIsCollapsed`.
  const setAndPersistIsCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    // Tidak perlu menulis cookie di sini karena SidebarProvider (di dalam MainLayout) akan melakukannya
    // berdasarkan prop 'open' yang diterimanya (!collapsed).
  };

  return (
    <MainLayout isCollapsed={isCollapsed} setIsCollapsed={setAndPersistIsCollapsed}>
      {children}
    </MainLayout>
  );
}