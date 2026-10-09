import { checkConsent, normalizePhone } from './consent'

describe('consent form checks', () => {
  it('turns German national numbers into international ones', () => {
    expect(normalizePhone('0151 123 4567')).toBe('+491511234567')
    expect(normalizePhone('+49 (151) 123-4567')).toBe('+491511234567')
    expect(normalizePhone('0049 151 1234567')).toBe('+491511234567')
  })

  it('needs a box, a channel and a valid contact', () => {
    expect(checkConsent({ fitChecks: false, marketing: false, channel: null, contact: '' }).errors).toEqual({
      choice: 'Wähle mindestens eine Option.',
      channel: 'Wähle WhatsApp oder E-Mail.',
    })
    expect(checkConsent({ fitChecks: true, marketing: false, channel: 'whatsapp', contact: '+49 1' }).errors.contact).toMatch(/Landesvorwahl/)
    expect(checkConsent({ fitChecks: true, marketing: false, channel: 'email', contact: 'nope' }).errors.contact).toMatch(/E-Mail/)
    expect(checkConsent({ fitChecks: true, marketing: true, channel: 'whatsapp', contact: '0151 1234567' })).toEqual({ errors: {}, contact: '+491511234567' })
  })
})
