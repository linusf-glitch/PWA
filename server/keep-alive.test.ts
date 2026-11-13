// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { handleKeepAlive } from './keep-alive.ts'

describe('handleKeepAlive', () => {
  it('answers 200 when the database read works', async () => {
    expect((await handleKeepAlive({ ping: async () => true })).status).toBe(200)
  })

  it('answers 503 when the read fails or throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await handleKeepAlive({ ping: async () => false })).status).toBe(503)
    expect((await handleKeepAlive({ ping: async () => { throw new Error('boom') } })).status).toBe(503)
  })
})
