// @vitest-environment node
import { createHmac } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

import { handleOrderPaid, supabaseStore, type PaidOrder, type Store } from './order-webhook.ts'

const SECRET = 'whsec'
const sign = (body: string) => createHmac('sha256', SECRET).update(body).digest('base64')

const order = (properties: { name: string; value: string }[], extra = {}) =>
  JSON.stringify({
    id: 820982911946154,
    name: '#1001',
    email: 'Parent@Example.com',
    currency: 'EUR',
    total_price: '99.99',
    created_at: '2026-10-08T17:00:00Z',
    line_items: [{ title: 'Sizeless Reef', properties }],
    ...extra,
  })
const appProps = [
  { name: 'size', value: '27' },
  { name: 'setting', value: 'yellow' },
  { name: 'measurement_id', value: 'fp-1' },
  { name: 'kid_name', value: 'Emil' },
]

function fakeStore(recorded = true) {
  const recordOrder = vi.fn<Store['recordOrder']>().mockResolvedValue(recorded)
  const userIdForEmail = vi.fn<Store['userIdForEmail']>().mockResolvedValue('user-1')
  return { store: { recordOrder, userIdForEmail } satisfies Store, recordOrder, userIdForEmail }
}

describe('handleOrderPaid', () => {
  it('rejects a wrong or missing signature without touching the store', async () => {
    const { store, recordOrder, userIdForEmail } = fakeStore()
    const body = order(appProps)
    expect((await handleOrderPaid(body, 'AAAA', SECRET, store)).status).toBe(401)
    expect((await handleOrderPaid(body, null, SECRET, store)).status).toBe(401)
    expect(userIdForEmail).not.toHaveBeenCalled()
    expect(recordOrder).not.toHaveBeenCalled()
  })

  it('records an app order for the parent found or created by email', async () => {
    const { store, recordOrder, userIdForEmail } = fakeStore()
    const body = order(appProps)
    const res = await handleOrderPaid(body, sign(body), SECRET, store)
    expect(res).toEqual({ status: 200, body: JSON.stringify({ recorded: true }) })
    expect(userIdForEmail).toHaveBeenCalledWith('parent@example.com')
    expect(recordOrder).toHaveBeenCalledWith('user-1', {
      userEmail: 'parent@example.com',
      shopifyOrderId: '820982911946154',
      orderNumber: '#1001',
      totalMinor: 9999,
      currency: 'EUR',
      paidAt: '2026-10-08T17:00:00Z',
      kidName: 'Emil',
      measurementId: 'fp-1',
      sizeEu: 27,
      setting: 'yellow',
      model: 'Sizeless Reef',
    } satisfies PaidOrder)
  })

  it('reports a repeated order as already recorded', async () => {
    const { store } = fakeStore(false)
    const body = order(appProps)
    expect(JSON.parse((await handleOrderPaid(body, sign(body), SECRET, store)).body)).toEqual({ recorded: false })
  })

  it('ignores orders that did not come from the app', async () => {
    const { store, recordOrder } = fakeStore()
    const body = order([])
    expect(await handleOrderPaid(body, sign(body), SECRET, store)).toEqual({ status: 200, body: JSON.stringify({ ignored: true }) })
    const noEmail = order(appProps, { email: null })
    expect((await handleOrderPaid(noEmail, sign(noEmail), SECRET, store)).status).toBe(200)
    expect(recordOrder).not.toHaveBeenCalled()
  })

  it('answers 400 for a malformed order and 500 (so Shopify retries) when saving fails', async () => {
    const { store, recordOrder } = fakeStore()
    expect((await handleOrderPaid('not json', sign('not json'), SECRET, store)).status).toBe(400)
    const bad = order(appProps, { currency: 'EURO' })
    expect((await handleOrderPaid(bad, sign(bad), SECRET, store)).status).toBe(400)
    recordOrder.mockRejectedValue(new Error('db down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const body = order(appProps)
    expect((await handleOrderPaid(body, sign(body), SECRET, store)).status).toBe(500)
  })
})

describe('supabaseStore', () => {
  it('falls back to the existing profile when the account already exists', async () => {
    const client = {
      auth: { admin: { createUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'exists' } }) } },
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'existing' } }) }) }) }),
    } as unknown as SupabaseClient
    expect(await supabaseStore(client).userIdForEmail('a@b.de')).toBe('existing')
  })

  it('uses the new account when one is created', async () => {
    const client = { auth: { admin: { createUser: async () => ({ data: { user: { id: 'new' } }, error: null }) } } } as unknown as SupabaseClient
    expect(await supabaseStore(client).userIdForEmail('a@b.de')).toBe('new')
  })
})
