// src/app/api/produksi/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server'; // Import client sisi server

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tahun = searchParams.get('tahun'); // Ambil parameter 'tahun' dari URL

    let query = supabaseServer.from('produksi_statistik').select('*'); // Ambil semua kolom

    if (tahun) {
      // Terapkan filter tahun jika parameter 'tahun' ada
      query = query.eq('tahun', parseInt(tahun)); // Pastikan kolom 'tahun' di DB adalah integer
    }

    // Anda bisa menambahkan filtering, pagination, atau sorting lain di sini
    // query = query.limit(10);
    // query = query.order('tanggal', { ascending: false });

    const { data: produksiData, error } = await query;

    if (error) {
      console.error('Error fetching produksi data from Supabase:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(produksiData, { status: 200 });
  } catch (e: any) {
    console.error('Unexpected error in /api/produksi GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}