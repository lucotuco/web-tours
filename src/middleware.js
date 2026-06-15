import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Verificamos si el usuario tiene una sesión activa en el servidor
  const { data: { session } } = await supabase.auth.getSession();
  const url = request.nextUrl.clone();

  // Bloqueo: Si intenta entrar a /admin pero NO está logueado y tampoco está ya en la pantalla de login
  if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')) {
    if (!session) {
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

// Filtro para que Next.js solo aplique este guardián en las rutas del administrador
export const config = {
  matcher: ['/admin/:path*'],
};