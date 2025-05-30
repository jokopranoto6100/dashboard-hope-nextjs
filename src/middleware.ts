// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Hapus baris ini: res.headers.set('x-pathname', req.nextUrl.pathname);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          req.cookies.set({ name, value: '', ...options });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('Supabase getSession error:', sessionError);
  }

  console.log('Middleware Pathname:', req.nextUrl.pathname);
  console.log('Session exists:', !!session);

  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    console.log('Redirecting to /auth/login');
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    console.log('Redirecting to /');
    return NextResponse.redirect(new URL('/', req.url));
  }

  console.log('Proceeding with request');
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)',
  ],
};