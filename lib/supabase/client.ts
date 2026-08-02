import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'defined' : 'missing');
  console.log('Anon key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'defined' : 'missing');

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
