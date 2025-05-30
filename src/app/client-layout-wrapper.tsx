// src/app/client-layout-wrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import React, { useState } from 'react';
import { YearProvider } from '@/context/YearContext'; // Import YearProvider

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAuthPage = pathname.startsWith('/auth');

  return (
    <>
      {isAuthPage ? (
        children
      ) : (
        // Bungkus MainLayout dengan YearProvider
        <YearProvider>
          <MainLayout isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
            {children}
          </MainLayout>
        </YearProvider>
      )}
    </>
  );
}