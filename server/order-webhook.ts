import { createHmac, timingSafeEqual } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

import { hashToken, TOKEN_PATTERN } from './return-token.js'

// Shopify "order paid" webhook (docs/integrations.md): verify the signature, validate the order,
// create the parent's account from the order email, then record child, scan and shoe.
// Orders that did not come from the app (no size/setting on a line item) are ignored.

const orderSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  name: z.string().optional(),
  email: z.email().nullish(),
  currency: z.string().length(3),
  total_price: z.string(),
  processed_at: z.string().nullish(),
  created_at: z.string(),
  line_items: z.array(
    z.object({ title: z.string(), properties: z.array(z.object({ name: z.string(), value: z.unknown() })).default([]) }),
  ),
})

// The cart attributes the app sets (src/pages/CheckoutHandoffPage.tsx) arrive as line item properties.
const shoeSchema = z.object({
  size: z.coerce.number().min(10).max(50),
  setting: z.enum(['turquoise', 'yellow', 'red']),
  measurement_id: z.string().min(1).max(200).optional(),
  kid_name: z.string().trim().min(1).max(60).default('Kind'),
  // Birth month, YYYY-MM (the app only asks for month and year).
  // Random token for the return link after payment; only its hash is stored.
  _return_token: z.string().regex(TOKEN_PATTERN).optional().catch(undefined),
  kid_birth: z.string().regex(/^(19|20)\d{2}-(0[1-9]|1[0-2])$/).optional().catch(undefined),
})

export type PaidOrder = {
  userEmail: string
  shopifyOrderId: string
  orderNumber?: string
  totalMinor: number
  currency: string
  paidAt: string
  kidName: string
  /** First of the birth month, YYYY-MM-01. */
  birthDate?: string
  measurementId?: string
  returnTokenHash?: string
  sizeEu: number
  setting: 'turquoise' | 'yellow' | 'red'
  model: string
}

export type Store = {
  /** The parent's user id for this email; creates the account the first time. */
  userIdForEmail(email: string): Promise<string>
  /** Records everything in one transaction. False when this order was already recorded. */
  recordOrder(userId: string, order: PaidOrder): Promise<boolean>
}

export function validSignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest()
  const given = Buffer.from(signature, 'base64')
  return given.length === expected.length && timingSafeEqual(given, expected)
}

/** The paid order we care about, or null when it is not a Sizeless app order. */
export function parseOrder(rawBody: string): PaidOrder | null {
  const order = orderSchema.parse(JSON.parse(rawBody))
  if (!order.email) return null
  // ponytail: one shoe per order (the cart holds one line). A second pair added in checkout is not recorded yet.
  for (const line of order.line_items) {
    const props = Object.fromEntries(line.properties.map((p) => [p.name, p.value]))
    const shoe = shoeSchema.safeParse(props)
    if (!shoe.success) continue
    return {
      userEmail: order.email.toLowerCase(),
      shopifyOrderId: order.id,
      orderNumber: order.name,
      totalMinor: Math.round(Number(order.total_price) * 100),
      currency: order.currency,
      paidAt: order.processed_at ?? order.created_at,
      kidName: shoe.data.kid_name,
      birthDate: shoe.data.kid_birth && `${shoe.data.kid_birth}-01`,
      measurementId: shoe.data.measurement_id,
      returnTokenHash: shoe.data._return_token && hashToken(shoe.data._return_token),
      sizeEu: shoe.data.size,
      setting: shoe.data.setting,
      model: line.title,
    }
  }
  return null
}

export async function handleOrderPaid(rawBody: string, signature: string | null, secret: string, store: Store) {
  const reply = (status: number, body: object) => ({ status, body: JSON.stringify(body) })
  if (!validSignature(rawBody, signature, secret)) return reply(401, { error: 'bad signature' })
  let order: PaidOrder | null
  try {
    order = parseOrder(rawBody)
  } catch {
    return reply(400, { error: 'invalid order' })
  }
  if (!order) return reply(200, { ignored: true })
  try {
    const recorded = await store.recordOrder(await store.userIdForEmail(order.userEmail), order)
    return reply(200, { recorded })
  } catch {
    // No order details in logs (privacy); Shopify retries on a 5xx and the record is idempotent.
    console.error(`order ${order.shopifyOrderId}: could not record`)
    return reply(500, { error: 'could not record order' })
  }
}

export function supabaseStore(client: SupabaseClient): Store {
  return {
    async userIdForEmail(email) {
      const { data, error } = await client.auth.admin.createUser({ email, email_confirm: true })
      if (data.user) return data.user.id
      // Returning parent: the profile has the same id as the auth user.
      const { data: profile } = await client.from('profiles').select('id').eq('email', email).maybeSingle()
      if (profile) return profile.id as string
      throw error ?? new Error('no user')
    },
    async recordOrder(userId, o) {
      const { data, error } = await client.rpc('record_paid_order', {
        p_user_id: userId,
        p_shopify_order_id: o.shopifyOrderId,
        p_order_number: o.orderNumber ?? null,
        p_total_minor: o.totalMinor,
        p_currency: o.currency,
        p_paid_at: o.paidAt,
        p_kid_name: o.kidName,
        p_birth_date: o.birthDate ?? null,
        p_footprint_measurement_id: o.measurementId ?? null,
        p_size_eu: o.sizeEu,
        p_setting: o.setting,
        p_model: o.model,
      })
      if (error) throw error
      // Also on a repeated webhook, so a failed first attempt is repaired by Shopify's retry.
      if (o.returnTokenHash) {
        const { error: tokenError } = await client
          .from('orders')
          .update({ return_token_hash: o.returnTokenHash })
          .eq('shopify_order_id', o.shopifyOrderId)
          .is('return_token_hash', null)
        if (tokenError) throw tokenError
      }
      return data === true
    },
  }
}
