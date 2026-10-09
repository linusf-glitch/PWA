import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

import { hashToken, TOKEN_PATTERN } from './return-token.js'

// "Bestellung bestätigt" without a login: the link carries a random token from the cart. We hand out
// the minimum (child's first name, size, setting, product) and only for 30 days after payment.

const VALID_DAYS = 30

export type ReturnOrder = { kid_name: string; size: number; setting: 'turquoise' | 'yellow' | 'red'; model: string }
export type ReturnStore = { find(tokenHash: string): Promise<(ReturnOrder & { paidAt: string }) | null> }

export async function handleOrderReturn(token: string | null, store: ReturnStore, now = new Date()) {
  const reply = (status: number, body: object) => ({ status, body: JSON.stringify(body) })
  if (!token || !TOKEN_PATTERN.test(token)) return reply(404, { error: 'not found' })
  try {
    const found = await store.find(hashToken(token))
    const ageDays = found ? (now.getTime() - new Date(found.paidAt).getTime()) / 86_400_000 : Infinity
    if (!found || ageDays > VALID_DAYS) return reply(404, { error: 'not found' })
    const { paidAt: _paidAt, ...order } = found
    return reply(200, order)
  } catch {
    console.error('order return: lookup failed')
    return reply(500, { error: 'lookup failed' })
  }
}

const rowSchema = z.object({
  paid_at: z.string(),
  shoes: z.array(
    z.object({
      size_eu: z.coerce.number(),
      setting_colour: z.enum(['turquoise', 'yellow', 'red']).nullable(),
      model: z.string(),
      children: z.object({ name: z.string() }).nullable(),
    }),
  ),
})

export function supabaseReturnStore(client: SupabaseClient): ReturnStore {
  return {
    async find(tokenHash) {
      const { data, error } = await client
        .from('orders')
        .select('paid_at, shoes(size_eu, setting_colour, model, children(name))')
        .eq('return_token_hash', tokenHash)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      const row = rowSchema.parse(data)
      const shoe = row.shoes[0]
      if (!shoe) return null
      return { paidAt: row.paid_at, kid_name: shoe.children?.name ?? 'Kind', size: shoe.size_eu, setting: shoe.setting_colour ?? 'yellow', model: shoe.model }
    },
  }
}
