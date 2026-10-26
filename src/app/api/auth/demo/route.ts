import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetRole = body?.role === 'teacher' ? 'teacher' : 'student';

    // Server-only credentials — strictly hidden from client JavaScript and browser bundles
    const email =
      targetRole === 'teacher'
        ? process.env.DEMO_TEACHER_EMAIL
        : process.env.DEMO_STUDENT_EMAIL;

    const password =
      targetRole === 'teacher'
        ? process.env.DEMO_TEACHER_PASSWORD
        : process.env.DEMO_STUDENT_PASSWORD;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          notConfigured: true,
          role: targetRole,
          message: `Demo ${targetRole} credentials are not configured in .env.local. Please ensure DEMO_${targetRole.toUpperCase()}_EMAIL and DEMO_${targetRole.toUpperCase()}_PASSWORD are set.`,
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Authenticate with genuine Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        {
          success: false,
          message: error?.message || 'Authentication failed for demo account.',
        },
        { status: 401 }
      );
    }

    // Resolve trusted role from public.profiles table
    let trustedRole = targetRole;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile) {
        if (targetRole === 'teacher' && profile.role !== 'teacher') {
          // Ensure demo teacher has the authorized teacher role in public.profiles
          await supabase
            .from('profiles')
            .update({ role: 'teacher' })
            .eq('id', data.user.id);
          trustedRole = 'teacher';
        } else {
          trustedRole = profile.role || targetRole;
        }
      } else {
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: targetRole === 'teacher' ? 'Demo Teacher' : 'Demo Student',
            role: targetRole,
          });
        trustedRole = targetRole;
      }
    } catch {
      trustedRole = data.user.app_metadata?.role || data.user.user_metadata?.role || targetRole;
    }

    if (data.user.user_metadata?.role !== trustedRole) {
      try {
        await supabase.auth.updateUser({ data: { role: trustedRole } });
      } catch {
        // ignore
      }
    }

    const redirectUrl = trustedRole === 'teacher' ? '/teacher' : '/dashboard';

    return NextResponse.json({
      success: true,
      role: trustedRole,
      redirectUrl,
      userId: data.user.id,
      userName: data.user.user_metadata?.name || data.user.user_metadata?.full_name || email.split('@')[0],
      userEmail: data.user.email,
    });
  } catch (err: unknown) {
    console.error('DEMO AUTH ERROR:', err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Server error during demo authentication.',
      },
      { status: 500 }
    );
  }
}
