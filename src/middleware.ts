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
          req.cookies.set({ name, value, ...options }); // Update request cookies
          res.cookies.set({ name, value, ...options }); // Update response cookies
        },
        remove: (name: string, options: CookieOptions) => {
          req.cookies.set({ name, value: '', ...options }); // Update request cookies
          res.cookies.set({ name, value: '', ...options }); // Update response cookies
        },
      },
    }
  );

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  // Log untuk debugging
  if (sessionError) {
    console.error('Middleware Supabase getSession error:', sessionError.message);
  }
  console.log(`Middleware: Path='${req.nextUrl.pathname}', Session=${!!session}`);

  // Jika tidak ada sesi dan path BUKAN bagian dari /auth, redirect ke login
  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    console.log(`Middleware: No session, redirecting to /auth/login from ${req.nextUrl.pathname}`);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Jika ADA sesi dan path ADALAH bagian dari /auth, redirect ke dashboard
  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    console.log(`Middleware: Session exists, redirecting to / from ${req.nextUrl.pathname}`);
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Jika tidak ada kondisi redirect yang terpenuhi, lanjutkan request
  console.log(`Middleware: Proceeding with request for ${req.nextUrl.pathname}`);
  return res;
}

export const config = {
  matcher: [
    // Cocokkan semua path kecuali yang secara eksplisit dikecualikan:
    // - _next/static (file statis Next.js)
    // - _next/image (optimasi gambar Next.js)
    // - favicon.ico
    // - api/ (rute API Anda)
    // - file dengan ekstensi (misalnya .png, .svg)
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)',
  ],
};