import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next');

  // Resolve true origin behind reverse proxies (e.g. Vercel) while keeping localhost in local dev
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const redirectBase = isLocalEnv
    ? origin
    : forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : origin;

  // Handle provider cancellation or OAuth errors
  if (error || errorDescription) {
    const errorMsg = errorDescription || error || 'OAuth authentication failed';
    return NextResponse.redirect(`${redirectBase}/login?error=${encodeURIComponent(errorMsg)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError && data.user) {
      const cookieStore = await cookies();

      // Check trusted role from public.profiles table
      let role = 'student';
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile?.role) {
          role = profile.role;
        } else {
          role = data.user.app_metadata?.role || data.user.user_metadata?.role || 'student';
        }
      } catch {
        role = data.user.app_metadata?.role || data.user.user_metadata?.role || 'student';
      }

      // Ensure next param is a valid relative path to prevent open redirect vulnerabilities
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
      const targetPath = safeNext || (role === 'teacher' ? '/teacher' : '/dashboard');
      const redirectResponse = NextResponse.redirect(`${redirectBase}${targetPath}`);
      cookieStore.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    } else if (exchangeError) {
      return NextResponse.redirect(
        `${redirectBase}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }
  }

  // If error or code missing, return to login with error param
  return NextResponse.redirect(`${redirectBase}/login?error=auth_callback_failed`);
}
