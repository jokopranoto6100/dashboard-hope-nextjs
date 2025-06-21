import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookMarked } from "lucide-react";
import Link from "next/link";
import { BahanProduksiClient } from "./bahan-produksi-client"; // <-- Akan kita buat di langkah berikutnya

export default function BahanProduksiPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      {/* 1. Card Statis untuk Materi & Pedoman */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <BookMarked className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Materi dan Pedoman Survei</CardTitle>
              <CardDescription>
                Pusat dokumentasi untuk semua materi, buku pedoman, dan panduan pelaksanaan survei.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Temukan semua dokumen yang Anda butuhkan untuk memastikan pelaksanaan survei berjalan
            sesuai dengan standar dan metodologi yang telah ditetapkan.
          </p>
          <Button asChild>
            <Link href="#">
              Lihat Semua Dokumen <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      {/* 3. Komponen Client untuk Tampilan Sektor (Grid & Detail) */}
      <div>
        <BahanProduksiClient />
      </div>
    </div>
  );
}