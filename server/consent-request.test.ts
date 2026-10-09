// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { CONSENT_TEXT_VERSION, handleConsentRequest, type ConsentStore } from './consent-request.ts'
import { CONSENT_TEXT_VERSION as APP_VERSION } from '../src/features/consent/consent.ts'
import { hashToken } from './return-token.ts'

const TOKEN = 'abcdefghijklmnopqrstuvwxyz012345'
const now = new Date('2026-10-10T10:00:00Z')
const body = (extra = {}) =>
  JSON.stringify({ token: TOKEN, channel: 'whatsapp', contact: '+4915112345678', fit_checks: true, marketing: false, text_version: CONSENT_TEXT_VERSION, ...extra })
const store = (parent: Awaited<ReturnType<ConsentStore['parentForToken']>> = { userId: 'u1', paidAt: '2026-10-09T10:00:00Z' }) => ({
  parentForToken: vi.fn<ConsentStore['parentForToken']>().mockResolvedValue(parent),
  log: vi.fn<ConsentStore['log']>().mockResolvedValue(),
})

describe('handleConsentRequest', () => {
  it('knows the consent text version the app shows', () => {
    expect(APP_VERSION).toBe(CONSENT_TEXT_VERSION)
  })

  it('logs one "requested" row per ticked box for the parent behind the token', async () => {
    const s = store()
    const res = await handleConsentRequest(body({ marketing: true }), s, now)
    expect(res.status).toBe(200)
    expect(s.parentForToken).toHaveBeenCalledWith(hashToken(TOKEN))
    const rows = s.log.mock.calls[0][0]
    expect(rows.map((r) => r.purpose)).toEqual(['fit_checks', 'marketing'])
    expect(rows.every((r) => r.user_id === 'u1' && r.action === 'requested' && r.contact === '+4915112345678' && r.text_version === CONSENT_TEXT_VERSION && r.source === 's10')).toBe(true)
  })

  it('accepts an email for the email channel', async () => {
    const s = store()
    expect((await handleConsentRequest(body({ channel: 'email', contact: 'mama@example.com' }), s, now)).status).toBe(200)
  })

  it.each([
    ['nothing ticked', { fit_checks: false, marketing: false }],
    ['a phone number without country code', { contact: '0151 123' }],
    ['an email on the WhatsApp channel', { contact: 'a@b.de' }],
    ['a bad email', { channel: 'email', contact: 'nope' }],
    ['an unknown consent text version', { text_version: 'other' }],
    ['a malformed token', { token: 'short' }],
  ])('rejects %s without touching the database', async (_name, extra) => {
    const s = store()
    expect((await handleConsentRequest(body(extra), s, now)).status).toBe(400)
    expect(s.parentForToken).not.toHaveBeenCalled()
    expect(s.log).not.toHaveBeenCalled()
  })

  it('rejects text that is not JSON', async () => {
    expect((await handleConsentRequest('nope', store(), now)).status).toBe(400)
  })

  it('answers 404 for an unknown token and for one older than 30 days, and logs nothing', async () => {
    const unknown = store(null)
    expect((await handleConsentRequest(body(), unknown, now)).status).toBe(404)
    const old = store({ userId: 'u1', paidAt: '2026-09-01T10:00:00Z' })
    expect((await handleConsentRequest(body(), old, now)).status).toBe(404)
    expect(unknown.log).not.toHaveBeenCalled()
    expect(old.log).not.toHaveBeenCalled()
  })

  it('answers 500 when saving fails', async () => {
    const s = store()
    s.log.mockRejectedValue(new Error('db'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await handleConsentRequest(body(), s, now)).status).toBe(500)
  })
})
