// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server'; // Import client sisi server

export async function GET(request: Request) {
  try {
    const { data: users, error } = await supabaseServer
      .from('users')
      .select('id, username, email, role, created_at'); // Pilih kolom yang ingin Anda expose

    if (error) {
      console.error('Error fetching users from Supabase:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(users, { status: 200 });
  } catch (e: any) {
    console.error('Unexpected error in /api/users GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}