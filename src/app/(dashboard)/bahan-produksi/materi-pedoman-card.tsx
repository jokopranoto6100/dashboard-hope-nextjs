// src/app/(dashboard)/bahan-produksi/materi-pedoman-card.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookMarked } from "lucide-react";
import Link from "next/link";
import { MateriPedomanDialog } from "./materi-pedoman-dialog";

interface MateriPedomanCardProps {
  initialHref: string;
  isAdmin: boolean;
}

export function MateriPedomanCard({ initialHref, isAdmin }: MateriPedomanCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BookMarked className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Materi dan Pedoman Survei</CardTitle>
              <CardDescription>
                Pusat dokumentasi untuk semua materi, buku pedoman, dan panduan pelaksanaan survei.
              </CardDescription>
            </div>
          </div>
          {isAdmin && <MateriPedomanDialog initialHref={initialHref} />}
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild>
          {/* Link ini sekarang dinamis */}
          <Link href={initialHref} target="_blank" rel="noopener noreferrer">
            Lihat Semua Dokumen <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}