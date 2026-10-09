/** Version of the consent texts on S10. Bump it whenever a text changes; the server only accepts known versions. */
export const CONSENT_TEXT_VERSION = 's10-2026-10-09'

export type Channel = 'whatsapp' | 'email'

/** Phone number in international form: "0151 123" becomes +49151123 (Germany is our market), "0049…" becomes +49…. */
export function normalizePhone(input: string): string {
  const digits = input.replace(/[\s()./-]/g, '')
  if (digits.startsWith('00')) return `+${digits.slice(2)}`
  if (digits.startsWith('0')) return `+49${digits.slice(1)}`
  return digits
}

export type ConsentErrors = { choice?: string; channel?: string; contact?: string }

/** Checks the S10 form. Returns the contact to send (normalised) when everything is valid. */
export function checkConsent(v: { fitChecks: boolean; marketing: boolean; channel: Channel | null; contact: string }): {
  errors: ConsentErrors
  contact?: string
} {
  const errors: ConsentErrors = {}
  if (!v.fitChecks && !v.marketing) errors.choice = 'Wähle mindestens eine Option.'
  if (!v.channel) return { errors: { ...errors, channel: 'Wähle WhatsApp oder E-Mail.' } }
  const contact = v.channel === 'whatsapp' ? normalizePhone(v.contact) : v.contact.trim()
  const valid = v.channel === 'whatsapp' ? /^\+[1-9]\d{7,14}$/.test(contact) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
  if (!valid)
    errors.contact =
      v.channel === 'whatsapp' ? 'Bitte gib die Nummer mit Landesvorwahl an, z. B. +49 151 1234567.' : 'Bitte gib eine gültige E-Mail-Adresse an.'
  return { errors, contact: Object.keys(errors).length ? undefined : contact }
}
