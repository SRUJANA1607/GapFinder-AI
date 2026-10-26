import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/profile
 * Returns the authenticated user's profile details.
 * Enforces server-side authorization: users can only fetch their own profile.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to view your profile.' },
        { status: 401 }
      );
    }

    // Fetch corresponding profile record from public.profiles
    let profileData: Record<string, unknown> | null = null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        profileData = data;
      }
    } catch {
      // Graceful fallback to user_metadata
    }

    const metadata = user.user_metadata || {};
    const trustedRole =
      (profileData?.role as string) ||
      (metadata?.role as string) ||
      (user.app_metadata?.role as string) ||
      'student';

    const profile = {
      id: user.id,
      email: user.email || '',
      emailVerified: !!user.email_confirmed_at,
      role: trustedRole,
      createdAt: user.created_at,
      name:
        (profileData?.name as string) ||
        (metadata?.name as string) ||
        (metadata?.full_name as string) ||
        (user.email ? user.email.split('@')[0] : 'User'),
      phone: (profileData?.phone as string) ?? (metadata?.phone as string) ?? '',
      bio: (profileData?.bio as string) ?? (metadata?.bio as string) ?? '',
      institution: (profileData?.institution as string) ?? (metadata?.institution as string) ?? '',
      degree: (profileData?.degree as string) ?? (metadata?.degree as string) ?? '',
      department: (profileData?.department as string) ?? (metadata?.department as string) ?? '',
      yearSemester: (profileData?.year_semester as string) ?? (metadata?.year_semester as string) ?? '',
      rollNumber: (profileData?.roll_number as string) ?? (metadata?.roll_number as string) ?? '',
      academicInterests:
        (profileData?.academic_interests as string) ??
        (metadata?.academic_interests as string) ??
        '',
      avatarUrl: (profileData?.avatar_url as string) ?? (metadata?.avatar_url as string) ?? '',
    };

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (err: unknown) {
    console.error('Error fetching profile:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error fetching profile.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Updates the authenticated user's editable profile details.
 * Security enforcement:
 * - Only the authenticated user can edit their own profile (auth.uid() = id).
 * - Never allows modifying role, user ID, email, or email verification status.
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to update your profile.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 1. Validate & Sanitize allowed fields
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Full Name is required and cannot be empty.' },
        { status: 400 }
      );
    }
    if (name.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Full Name cannot exceed 100 characters.' },
        { status: 400 }
      );
    }

    const phone = typeof body?.phone === 'string' ? body.phone.trim().slice(0, 25) : '';
    const bio = typeof body?.bio === 'string' ? body.bio.trim().slice(0, 500) : '';
    const institution = typeof body?.institution === 'string' ? body.institution.trim().slice(0, 150) : '';
    const degree = typeof body?.degree === 'string' ? body.degree.trim().slice(0, 100) : '';
    const department = typeof body?.department === 'string' ? body.department.trim().slice(0, 100) : '';
    const yearSemester = typeof body?.yearSemester === 'string' ? body.yearSemester.trim().slice(0, 50) : '';
    const rollNumber = typeof body?.rollNumber === 'string' ? body.rollNumber.trim().slice(0, 50) : '';
    const academicInterests = typeof body?.academicInterests === 'string' ? body.academicInterests.trim().slice(0, 300) : '';

    // 2. Persist to auth.users user_metadata (always available and persistent)
    await supabase.auth.updateUser({
      data: {
        name,
        phone,
        bio,
        institution,
        degree,
        department,
        year_semester: yearSemester,
        roll_number: rollNumber,
        academic_interests: academicInterests,
      },
    });

    // 3. Persist to public.profiles table
    const fullPayload: Record<string, unknown> = {
      name,
      phone,
      bio,
      institution,
      degree,
      department,
      year_semester: yearSemester,
      roll_number: rollNumber,
      academic_interests: academicInterests,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(fullPayload)
        .eq('id', user.id);

      // If additive columns are not present in schema yet, fallback to updating name
      if (profileError) {
        await supabase
          .from('profiles')
          .update({ name })
          .eq('id', user.id);
      }
    } catch {
      // Fallback update
      try {
        await supabase
          .from('profiles')
          .update({ name })
          .eq('id', user.id);
      } catch {
        // user_metadata already persisted
      }
    }

    // 4. Return updated profile with read-only fields intact
    let role = user.user_metadata?.role || user.app_metadata?.role || 'student';
    try {
      const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (p?.role) role = p.role;
    } catch {
      // ignore
    }

    const updatedProfile = {
      id: user.id,
      email: user.email || '',
      emailVerified: !!user.email_confirmed_at,
      role,
      createdAt: user.created_at,
      name,
      phone,
      bio,
      institution,
      degree,
      department,
      yearSemester,
      rollNumber,
      academicInterests,
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updatedProfile,
    });
  } catch (err: unknown) {
    console.error('Error updating profile:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error updating profile.' },
      { status: 500 }
    );
  }
}
