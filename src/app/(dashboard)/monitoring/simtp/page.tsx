// /app/(dashboard)/monitoring/simtp/page.tsx
"use client"; // DIUBAH: Menjadikan ini Client Component

import { SimtpMonitoringClient } from './SimtpMonitoringClient';

// Komponen ini tidak lagi async dan tidak melakukan fetch data
export default function MonitoringSimtpPage() {
  return (
    <div className="flex flex-col gap-8 min-w-0">
      {/* Langsung merender komponen client tanpa props data awal */}
      <SimtpMonitoringClient />
    </div>
  );
}