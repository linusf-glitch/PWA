import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

import { hashToken, TOKEN_PATTERN } from './return-token.js'

// "Bestellung bestätigt" (S10): the parent ticks what they want and gives a phone number or an email.
// We only log the request here. Consent counts once they confirm (JA reply / link): see docs/integrations.md.
// Identified by the return-link token, so no login is needed.

/** The consent text the parent saw. Keep in sync with src/features/consent/consent.ts (a test checks it). */
export const CONSENT_TEXT_VERSION = 's10-2026-10-09'

const VALID_DAYS = 30

const requestSchema = z
  .object({
    token: z.string().regex(TOKEN_PATTERN),
    channel: z.enum(['whatsapp', 'email']),
    contact: z.string().trim().max(200),
    fit_checks: z.boolean(),
    marketing: z.boolean(),
    text_version: z.literal(CONSENT_TEXT_VERSION),
  })
  .refine((r) => r.fit_checks || r.marketing, { message: 'nothing ticked' })
  .refine((r) => (r.channel === 'whatsapp' ? /^\+[1-9]\d{7,14}$/.test(r.contact) : z.email().safeParse(r.contact).success), {
    message: 'bad contact',
  })

export type ConsentRow = {
  user_id: string
  channel: 'whatsapp' | 'email'
  purpose: 'fit_checks' | 'marketing'
  action: 'requested'
  contact: string
  text_version: string
  source: 's10'
}
export type ConsentStore = {
  /** The parent behind a return token and when the order was paid, or null. */
  parentForToken(tokenHash: string): Promise<{ userId: string; paidAt: string } | null>
  log(rows: ConsentRow[]): Promise<void>
}

export async function handleConsentRequest(rawBody: string, store: ConsentStore, now = new Date()) {
  const reply = (status: number, body: object) => ({ status, body: JSON.stringify(body) })
  let json: unknown
  try {
    json = JSON.parse(rawBody)
  } catch {
    return reply(400, { error: 'invalid request' })
  }
  const parsed = requestSchema.safeParse(json)
  if (!parsed.success) return reply(400, { error: 'invalid request' })
  const r = parsed.data
  try {
    const parent = await store.parentForToken(hashToken(r.token))
    const ageDays = parent ? (now.getTime() - new Date(parent.paidAt).getTime()) / 86_400_000 : Infinity
    if (!parent || ageDays > VALID_DAYS) return reply(404, { error: 'not found' })
    const purposes = [r.fit_checks && 'fit_checks', r.marketing && 'marketing'].filter((p): p is 'fit_checks' | 'marketing' => !!p)
    await store.log(
      purposes.map((purpose) => ({ user_id: parent.userId, channel: r.channel, purpose, action: 'requested', contact: r.contact, text_version: r.text_version, source: 's10' })),
    )
    return reply(200, { requested: purposes })
  } catch {
    // No contact details in logs (privacy).
    console.error('consent request: could not save')
    return reply(500, { error: 'could not save' })
  }
}

export function supabaseConsentStore(client: SupabaseClient): ConsentStore {
  return {
    async parentForToken(tokenHash) {
      const { data, error } = await client.from('orders').select('user_id, paid_at').eq('return_token_hash', tokenHash).maybeSingle()
      if (error) throw error
      return data ? { userId: data.user_id as string, paidAt: data.paid_at as string } : null
    },
    async log(rows) {
      const { error } = await client.from('consent_log').insert(rows)
      if (error) throw error
    },
  }
}
