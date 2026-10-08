import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { FieldError, Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthProvider'

const RESEND_SECONDS = 60

export default function CodeEntryPage() {
  const { sendCode, verifyCode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_SECONDS)

  const counting = cooldown > 0
  useEffect(() => {
    if (!counting) return
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [counting])

  if (!email) return <Navigate to="/sign-in" replace />

  async function submit(value: string) {
    if (!email || busy) return
    setBusy(true)
    setError(null)
    setNotice(null)
    const result = await verifyCode(email, value)
    setBusy(false)
    if (result.ok) {
      navigate('/', { replace: true })
    } else {
      setCode('')
      setError(
        result.reason === 'network'
          ? 'Wir konnten den Code nicht prüfen. Prüf deine Verbindung und versuch es noch einmal.'
          : 'Der Code hat nicht funktioniert. Er ist falsch oder abgelaufen. Schau in die neueste E-Mail oder lass dir einen neuen Code schicken.',
      )
    }
  }

  function onChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 6)
    setCode(digits)
    if (digits.length === 6) void submit(digits)
  }

  async function resend() {
    if (!email) return
    setError(null)
    const result = await sendCode(email)
    if (result.ok) {
      setNotice('Ein neuer Code ist unterwegs.')
      setCooldown(RESEND_SECONDS)
    } else {
      setError(
        result.reason === 'rate_limited'
          ? 'Zu viele Versuche. Bitte warte eine Minute und versuch es dann noch einmal.'
          : 'Wir konnten keinen neuen Code senden. Versuch es gleich noch einmal.',
      )
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-6">
      <Button asChild variant="ghost" size="icon" className="-ml-2 self-start">
        <Link to="/sign-in" aria-label="Zurück">
          <ArrowLeft />
        </Link>
      </Button>
      <div className="space-y-2">
        <h1 className="text-h1">Code eingeben</h1>
        <p className="text-body text-muted-foreground">
          Wir haben einen 6-stelligen Code an <span className="font-medium text-foreground">{email}</span> geschickt.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (code.length === 6) void submit(code)
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <label htmlFor="code" className="block text-label">
            6-stelliger Code
          </label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            className="h-14 text-center text-h2 tracking-[0.5em]"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            disabled={busy}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'code-error' : undefined}
          />
          {error && (
            <FieldError id="code-error">{error}</FieldError>
          )}
          {notice && (
            <p role="status" className="text-body-small text-muted-foreground">
              {notice}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy || code.length !== 6}>
          {busy ? 'Wird geprüft …' : 'Weiter'}
        </Button>
      </form>
      <Button type="button" variant="link" onClick={resend} disabled={cooldown > 0 || busy}>
        {cooldown > 0 ? `Neuen Code senden (in ${cooldown} s)` : 'Neuen Code senden'}
      </Button>
    </main>
  )
}
