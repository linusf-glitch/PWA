// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { handleOrderReturn, type ReturnStore } from './order-return.ts'
import { hashToken } from './return-token.ts'

const TOKEN = 'abcdefghijklmnopqrstuvwxyz012345'
const now = new Date('2026-10-10T10:00:00Z')
const found = { paidAt: '2026-10-09T10:00:00Z', kid_name: 'Emil', size: 27, setting: 'yellow' as const, model: 'Sizeless Reef' }
const storeWith = (value: Awaited<ReturnType<ReturnStore['find']>>) => ({ find: vi.fn<ReturnStore['find']>().mockResolvedValue(value) })

describe('handleOrderReturn', () => {
  it('looks the order up by the token hash and returns only the minimum', async () => {
    const store = storeWith(found)
    const res = await handleOrderReturn(TOKEN, store, now)
    expect(store.find).toHaveBeenCalledWith(hashToken(TOKEN))
    expect(res.status).toBe(200)
    expect(JSON.parse(res.body)).toEqual({ kid_name: 'Emil', size: 27, setting: 'yellow', model: 'Sizeless Reef' })
  })

  it('answers 404 for a missing, malformed or unknown token without asking the database for bad ones', async () => {
    const store = storeWith(null)
    expect((await handleOrderReturn(null, store, now)).status).toBe(404)
    expect((await handleOrderReturn('1234', store, now)).status).toBe(404)
    expect(store.find).not.toHaveBeenCalled()
    expect((await handleOrderReturn(TOKEN, store, now)).status).toBe(404)
  })

  it('stops working 30 days after payment', async () => {
    const old = storeWith({ ...found, paidAt: '2026-09-01T10:00:00Z' })
    expect((await handleOrderReturn(TOKEN, old, now)).status).toBe(404)
  })

  it('answers 500 when the lookup fails', async () => {
    const store = { find: vi.fn<ReturnStore['find']>().mockRejectedValue(new Error('db')) }
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await handleOrderReturn(TOKEN, store, now)).status).toBe(500)
  })
})
