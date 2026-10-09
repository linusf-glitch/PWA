import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import { checkConsent, CONSENT_TEXT_VERSION, type Channel, type ConsentErrors } from './consent'

// S10 opt-in: two separate toggles, both off (fit checks / tips and offers; a pre-set toggle is no valid
// consent), WhatsApp pre-selected with its number field open, email one tap away on the same screen. This only requests; consent counts once the parent confirms (JA reply or link).
export function ConsentForm({ name, token }: { name?: string; token?: string }) {
  const [fitChecks, setFitChecks] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [channel, setChannel] = useState<Channel | null>('whatsapp')
  const [contact, setContact] = useState('+49 ')
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
        <Switch checked={fitChecks} onChange={(e) => setFitChecks(e.target.checked)}>
          <strong>Fit-Checks für {kid}:</strong> etwa alle 6 Wochen fragen wir, ob die Schuhe passen, und erinnern dich ans Neuscannen.
        </Switch>
        <Switch checked={marketing} onChange={(e) => setMarketing(e.target.checked)}>
          <strong>Tipps und Angebote:</strong> saisonale Schuhe und gelegentliche Angebote, höchstens 2 pro Monat.
        </Switch>
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
            variant="outline"
            aria-pressed={channel === c}
            className={cn('flex-1', channel === c && 'ring-2 ring-ink')}
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
        </label>
      )}
      {errors.contact && (
        <p role="alert" className="text-body-small text-destructive">
          {errors.contact}
        </p>
      )}
      <p className="text-caption text-muted-foreground">
        Absender ist Sizeless. Du kannst jederzeit mit STOP antworten oder im Konto abmelden. Mehr in der Datenschutzerklärung.
      </p>
      {failed && (
        <p role="alert" className="text-body-small text-destructive">
          Das hat nicht geklappt. Bitte versuch es gleich noch einmal.
        </p>
      )}
      <Button variant="outline" disabled={busy} onClick={submit}>
        Bestätigen
      </Button>
    </div>
  )
}
