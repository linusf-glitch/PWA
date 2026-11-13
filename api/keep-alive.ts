import { createClient } from '@supabase/supabase-js'

import { handleKeepAlive, supabaseKeepAliveStore } from '../server/keep-alive.js'

// Vercel function, called once a day by the cron in vercel.json. Reads a row count only; returns no data.
export async function GET() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('keep-alive not configured, missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return new Response('not configured', { status: 500 })
  }
  const store = supabaseKeepAliveStore(createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }))
  const { status, body } = await handleKeepAlive(store)
  return new Response(body, { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
}
