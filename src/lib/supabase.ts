import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { readEnv } from '@/lib/env'

let client: SupabaseClient | null | undefined

/** The browser Supabase client, or null when env vars are missing. */
export function getSupabase(): SupabaseClient | null {
  if (client === undefined) {
    const env = readEnv()
    client = env
      ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
          // Long session: keep the login in this browser and refresh it silently.
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
        })
      : null
  }
  return client
}
