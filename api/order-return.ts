import { createClient } from '@supabase/supabase-js'

import { handleOrderReturn, supabaseReturnStore } from '../server/order-return.js'

// Vercel function: the app asks for the order behind a return link (token from the cart).
export async function GET(request: Request) {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('order return not configured, missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return new Response('not configured', { status: 500 })
  }
  const store = supabaseReturnStore(createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }))
  const { status, body } = await handleOrderReturn(new URL(request.url).searchParams.get('t'), store)
  return new Response(body, { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
}
