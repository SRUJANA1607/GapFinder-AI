import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next');

  // Handle provider cancellation or OAuth errors
  if (error || errorDescription) {
    const errorMsg = errorDescription || error || 'OAuth authentication failed';
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMsg)}`);
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

      const targetPath = next || (role === 'teacher' ? '/teacher' : '/dashboard');
      const redirectResponse = NextResponse.redirect(`${origin}${targetPath}`);
      cookieStore.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    } else if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }
  }

  // If error or code missing, return to login with error param
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
