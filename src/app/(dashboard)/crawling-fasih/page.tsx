// src/app/(dashboard)/crawling-fasih/page.tsx
import { CrawlingClient } from './crawling-client';

export default function CrawlingFasihPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Fasih Data Crawler</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Otomatisasi pengambilan data dari aplikasi FASIH secara terpandu.
      </p>
      
      {/* Cukup panggil satu komponen klien utama yang akan mengatur semua layout */}
      <CrawlingClient />
    </div>
  );
}