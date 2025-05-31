// src/app/(dashboard)/layout.tsx
import React from 'react';
import ClientLayoutWrapper from '../client-layout-wrapper'; // Path relatif ke ClientLayoutWrapper

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}