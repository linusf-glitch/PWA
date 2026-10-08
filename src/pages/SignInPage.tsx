import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Headline, Illustration } from '@/components/illustration/illustration'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthProvider'
import { emailSchema } from '@/features/auth/schemas'

export default function SignInPage() {
  const { sendCode } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    if (!emailSchema.safeParse(email.trim()).success) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.')
      return
    }
    setBusy(true)
    const result = await sendCode(email)
    setBusy(false)
    if (result.ok) {
      navigate('/sign-in/code', { state: { email: email.trim() } })
    } else if (result.reason === 'rate_limited') {
      setError('Zu viele Versuche. Bitte warte eine Minute und versuch es dann noch einmal.')
    } else if (result.reason === 'not_configured') {
      setError('Die Anmeldung ist noch nicht eingerichtet.')
    } else {
      setError("Wir konnten den Code nicht senden. Prüf deine Verbindung und versuch es noch einmal.")
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <div className="space-y-2">
        <Illustration name="footprints" size={120} boil />
        <Headline animate>Anmelden</Headline>
        <p className="text-muted-foreground">Wir schicken dir einen 6-stelligen Code per E-Mail. Kein Passwort nötig.</p>
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            E-Mail
          </label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'email-error' : undefined}
          />
          {error && (
            <p id="email-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? 'Wird gesendet …' : 'Code senden'}
        </Button>
      </form>
    </main>
  )
}
