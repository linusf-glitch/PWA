import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { checkConsent, CONSENT_TEXT_VERSION, type Channel, type ConsentErrors } from './consent'

// S10 opt-in: two separate unticked boxes (fit checks / tips and offers), then WhatsApp or email on
// the same screen. This only requests; consent counts once the parent confirms (JA reply or link).
export function ConsentForm({ name, token }: { name?: string; token?: string }) {
  const [fitChecks, setFitChecks] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [channel, setChannel] = useState<Channel | null>(null)
  const [contact, setContact] = useState('')
  const [errors, setErrors] = useState<ConsentErrors>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<Channel | null>(null)
  const [failed, setFailed] = useState(false)
  const kid = name ?? 'dein Kind'

  async function submit() {
    const { errors: found, contact: clean } = checkConsent({ fitChecks, marketing, channel, contact })
    setErrors(found)
    setFailed(false)
    if (!clean || !channel) return
    // Demo (no return link): nothing is sent.
    if (!token) return setDone(channel)
    setBusy(true)
    try {
      const res = await fetch('/api/consent-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, channel, contact: clean, fit_checks: fitChecks, marketing, text_version: CONSENT_TEXT_VERSION }),
      })
      if (!res.ok) throw new Error('failed')
      setDone(channel)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  if (done)
    return (
      <p role="status" className="text-body">
        Fast geschafft: Wir schicken dir gleich eine Nachricht zur Bestätigung.{' '}
        {done === 'whatsapp' ? 'Antworte mit JA, dann ist alles aktiv.' : 'Klicke dort auf den Link, dann ist alles aktiv.'} Bis dahin senden wir nichts.
      </p>
    )

  return (
    <div className="flex flex-col gap-3">
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Was möchtest du bekommen?</legend>
        <label className="flex min-h-11 items-start gap-2 text-body-small">
          <input type="checkbox" className="mt-1 size-5" checked={fitChecks} onChange={(e) => setFitChecks(e.target.checked)} />
          <span>
            <strong>Fit-Checks für {kid}:</strong> etwa alle 6 Wochen fragen wir, ob die Schuhe passen, und erinnern dich ans Neuscannen.
          </span>
        </label>
        <label className="flex min-h-11 items-start gap-2 text-body-small">
          <input type="checkbox" className="mt-1 size-5" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
          <span>
            <strong>Tipps und Angebote:</strong> saisonale Schuhe und gelegentliche Angebote, höchstens 2 pro Monat.
          </span>
        </label>
        {errors.choice && (
          <p role="alert" className="text-body-small text-destructive">
            {errors.choice}
          </p>
        )}
      </fieldset>

      <div role="group" aria-label="Kanal" className="flex gap-2">
        {(['whatsapp', 'email'] as const).map((c) => (
          <Button
            key={c}
            type="button"
            variant={channel === c ? 'default' : 'outline'}
            aria-pressed={channel === c}
            className="flex-1"
            onClick={() => {
              setChannel(c)
              setContact(c === 'whatsapp' ? '+49 ' : '')
            }}
          >
            {c === 'whatsapp' ? 'Per WhatsApp' : 'Per E-Mail'}
          </Button>
        ))}
      </div>
      {errors.channel && (
        <p role="alert" className="text-body-small text-destructive">
          {errors.channel}
        </p>
      )}
      {channel && (
        <label className="flex flex-col gap-1 text-label">
          {channel === 'whatsapp' ? 'WhatsApp-Nummer' : 'E-Mail-Adresse'}
          <Input
            type={channel === 'whatsapp' ? 'tel' : 'email'}
            inputMode={channel === 'whatsapp' ? 'tel' : 'email'}
            autoComplete={channel === 'whatsapp' ? 'tel' : 'email'}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            aria-invalid={!!errors.contact}
          />
          {errors.contact && (
            <span role="alert" className="text-body-small text-destructive">
              {errors.contact}
            </span>
          )}
        </label>
      )}
      <p className="text-caption text-muted-foreground">
        Absender ist Sizeless. Du kannst jederzeit mit STOP antworten oder im Konto abmelden. Mehr in der Datenschutzerklärung.
      </p>
      {failed && (
        <p role="alert" className="text-body-small text-destructive">
          Das hat nicht geklappt. Bitte versuch es gleich noch einmal.
        </p>
      )}
      <Button disabled={busy} onClick={submit}>
        Bestätigen
      </Button>
    </div>
  )
}
