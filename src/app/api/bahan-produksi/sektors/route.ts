// src/app/api/bahan-produksi/sektors/route.ts

import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic'; // Pastikan data selalu fresh

export async function GET() {
  try {
    const { data, error } = await supabaseServer
        .from('sektors')
        .select('*, links(*)') // Query yang sama seperti sebelumnya
        .order('urutan', { ascending: true })
        .order('urutan', { foreignTable: 'links', ascending: true });

    if (error) {
      console.error("API Error fetching sectors:", error);
      throw new Error(error.message);
    }

    return NextResponse.json(data);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}