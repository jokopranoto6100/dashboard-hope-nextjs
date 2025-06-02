// src/app/(dashboard)/layout.tsx
import React from 'react';
import ClientLayoutWrapper from '../client-layout-wrapper'; //
import { AuthProvider } from '@/context/AuthContext'; // <-- Impor AuthProvider

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider> {/* Bungkus ClientLayoutWrapper dengan AuthProvider */}
      <ClientLayoutWrapper>{children}</ClientLayoutWrapper> {/* */}
    </AuthProvider>
  );
}