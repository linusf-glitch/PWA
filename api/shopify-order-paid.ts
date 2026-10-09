import { createClient } from '@supabase/supabase-js'

import { handleOrderPaid, supabaseStore } from '../server/order-webhook.js'

// Vercel function: Shopify calls this when an order is paid. Secrets live in Vercel env variables only.
export async function POST(request: Request) {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!url || !key || !secret) return new Response('not configured', { status: 500 })

  const store = supabaseStore(createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }))
  const { status, body } = await handleOrderPaid(await request.text(), request.headers.get('x-shopify-hmac-sha256'), secret, store)
  return new Response(body, { status, headers: { 'content-type': 'application/json' } })
}
