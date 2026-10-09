import { createClient } from '@supabase/supabase-js'

import { handleConsentRequest, supabaseConsentStore } from '../server/consent-request.js'

// Vercel function: the S10 screen asks to log a WhatsApp / email consent request.
export async function POST(request: Request) {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('consent request not configured, missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return new Response('not configured', { status: 500 })
  }
  const store = supabaseConsentStore(createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }))
  const { status, body } = await handleConsentRequest(await request.text(), store)
  return new Response(body, { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
}
