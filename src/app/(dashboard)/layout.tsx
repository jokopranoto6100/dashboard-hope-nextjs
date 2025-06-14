// src/app/(dashboard)/layout.tsx
import React from 'react';
import ClientLayoutWrapper from '../client-layout-wrapper'; //
import { AuthProvider } from '@/context/AuthContext'; // <-- Impor AuthProvider
import { DarkModeProvider } from '@/context/DarkModeContext'; // Import provider


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DarkModeProvider>
      <AuthProvider> 
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper> {/* */}
      </AuthProvider>
    </DarkModeProvider>
  );
}