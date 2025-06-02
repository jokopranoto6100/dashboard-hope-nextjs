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
    // Jika ada error saat getUser (misal, token tidak valid, jaringan, dll)
    // Anggap saja tidak ada sesi yang valid untuk keamanan
    console.warn('Middleware Supabase getUser error:', userError.message);
    // Anda mungkin ingin mengosongkan cookie Supabase di sini jika tokennya jelas tidak valid,
    // tetapi untuk saat ini, kita akan memperlakukannya sebagai tidak ada sesi.
  }
  // console.log(`Middleware: Path='${req.nextUrl.pathname}', User=${user ? user.id : 'null'}`);

  const { pathname } = req.nextUrl;
  const sessionExists = !!user; // Anggap sesi ada jika user berhasil diambil

  const publicPaths = ['/auth/login', '/auth/register'];
  if (!sessionExists && !publicPaths.some(p => pathname.startsWith(p)) && !pathname.startsWith('/api/auth')) {
    console.log(`Middleware: No authenticated user, redirecting to /auth/login from ${pathname}`);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (sessionExists && pathname.startsWith('/auth') && !pathname.startsWith('/api/auth')) {
    console.log(`Middleware: Authenticated user, redirecting to / from ${pathname}`);
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (sessionExists && pathname.startsWith('/pengguna')) {
    const userRole = user?.user_metadata?.role; // user dari getUser() sudah terverifikasi
    // console.log(`Middleware: User trying to access ${pathname}. Role: ${userRole}`);

    if (userRole !== 'super_admin') {
      console.log(`Middleware: Unauthorized access attempt to ${pathname} by role ${userRole}. Redirecting to /.`);
      return NextResponse.redirect(new URL('/', req.url));
    }
    // console.log(`Middleware: Authorized access to ${pathname} for role ${userRole}.`);
  }

  // console.log(`Middleware: Proceeding with request for ${pathname}`);
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};