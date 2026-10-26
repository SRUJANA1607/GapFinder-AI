import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { customServerFetch } from './custom-fetch';

export async function createClient() {
  const cookieStore = await cookies();

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== ''
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : 'https://placeholder.supabase.co';

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() !== ''
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : 'placeholder-anon-key';

  return createServerClient(url, anonKey, {
    global: {
      fetch: customServerFetch,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored if called from a Server Component
        }
      },
    },
  });
}
