// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          req.cookies.set({ name, value: '', ...options });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Alih-alih getSession(), gunakan getUser() untuk validasi sisi server yang lebih aman
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.warn('Middleware Supabase getUser error:', userError.message);
  }

  const { pathname } = req.nextUrl;
  const sessionExists = !!user; // Anggap sesi ada jika user berhasil diambil

  const publicPaths = ['/auth/login', '/auth/register'];
  if (!sessionExists && !publicPaths.some(p => pathname.startsWith(p)) && !pathname.startsWith('/api/auth')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (sessionExists && pathname.startsWith('/auth') && !pathname.startsWith('/api/auth')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (sessionExists && pathname.startsWith('/pengguna')) {
    const userRole = user?.user_metadata?.role; // user dari getUser() sudah terverifikasi
    if (userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};