import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Helper to copy refreshed auth cookies onto redirect responses
  const createRedirectResponse = (targetUrl: URL) => {
    const redirectResponse = NextResponse.redirect(targetUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  // 1. Normalize path typos or capitalized routes
  const lowerPath = pathname.toLowerCase();
  if (lowerPath === '/dahsboard' || lowerPath === '/dashbaord' || lowerPath === '/dashbord' || pathname === '/Dashboard') {
    return createRedirectResponse(new URL('/dashboard', request.url));
  }
  if (pathname === '/Teacher') {
    return createRedirectResponse(new URL('/teacher', request.url));
  }

  // 2. Root route: always redirect to /login by default
  if (pathname === '/') {
    return createRedirectResponse(new URL('/login', request.url));
  }

  // Protected application routes
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/topics') ||
    pathname.startsWith('/quiz') ||
    pathname.startsWith('/gap-report') ||
    pathname.startsWith('/revision-plan') ||
    pathname.startsWith('/assistant') ||
    pathname.startsWith('/upload');

  // If this is a public route (e.g. /login, /auth/*, /api/*), let it render immediately
  if (!isProtectedRoute) {
    return supabaseResponse;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
    return createRedirectResponse(new URL('/login', request.url));
  }

  // 3. Fast-path check: If no auth token cookies exist at all, redirect immediately
  const hasAuthCookies = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'));

  if (!hasAuthCookies) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return createRedirectResponse(loginUrl);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // 4. Authenticate session safely
  let user = null;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      user = sessionData.session.user;
    } else {
      const { data: userData } = await supabase.auth.getUser();
      user = userData?.user || null;
    }
  } catch {
    user = null;
  }

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return createRedirectResponse(loginUrl);
  }

  // 5. Resolve trusted server-side role
  const trustedRole = user.app_metadata?.role || user.user_metadata?.role || 'student';

  // 6. Strict Teacher Route Protection
  if (pathname.startsWith('/teacher') && trustedRole !== 'teacher') {
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('unauthorized', 'teacher_only');
    return createRedirectResponse(dashboardUrl);
  }

  return supabaseResponse;
}
