// src/app/(dashboard)/bahan-produksi/materi-pedoman-card.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookMarked } from "lucide-react";
import { MateriPedomanDialog } from "./materi-pedoman-dialog";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

export function MateriPedomanCard() {
  const { userRole, supabase } = useAuth(); // ✅ FIXED: Gunakan userRole dari AuthContext
  const [materiPedomanLink, setMateriPedomanLink] = useState('#');
  const [isLoading, setIsLoading] = useState(true);

  // ✅ SIMPLIFIED: Tidak perlu state isAdmin, langsung gunakan userRole
  const isAdmin = userRole === 'super_admin';

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;
      
      try {
        // Fetch materi pedoman link
        const { data: linkData } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'materi_pedoman_link')
          .single();
        
        if (linkData?.value) {
          setMateriPedomanLink(linkData.value);
        }
      } catch (error) {
        console.error('Error fetching materi pedoman data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase]); // ✅ SIMPLIFIED: Removed user dependency

  if (isLoading) {
    return null; // ✅ SIMPLIFIED: No individual skeleton, handled by main BahanProduksiSkeleton
  }
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BookMarked className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Materi dan Pedoman Survei</CardTitle>
              <CardDescription>
                Pusat dokumentasi untuk materi dan buku pedoman pelaksanaan survei.
              </CardDescription>
            </div>
          </div>
          {isAdmin && <MateriPedomanDialog initialHref={materiPedomanLink} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* ✅ SIMPLE: Native <a> tag tanpa animasi berlebihan */}
          <a 
            href={materiPedomanLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block"
            style={{
              WebkitTapHighlightColor: 'rgba(0,0,0,0)',
              outline: 'none'
            }}
          >
            <Button className="w-fit mx-auto">
              <BookMarked className="mr-2 h-4 w-4" />
              Buka Materi dan Pedoman
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}