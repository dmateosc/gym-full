import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

type SupabaseLike = ReturnType<typeof createClient>;

const supabaseStub: SupabaseLike = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }) as any,
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => undefined } },
    }) as any,
    signInWithPassword: async () => ({ data: {}, error: { message: 'Supabase no configurado' } }) as any,
    signUp: async () => ({ data: {}, error: { message: 'Supabase no configurado' } }) as any,
    signInWithOAuth: async () => ({ data: {}, error: { message: 'Supabase no configurado' } }) as any,
    signOut: async () => ({ error: null }) as any,
  },
} as any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase no configurado: el frontend funcionará sin Auth de Supabase. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para habilitarlo.',
  );
}

export const supabase: SupabaseLike =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : supabaseStub;
