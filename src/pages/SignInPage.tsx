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
      setError('Please enter a valid email address.')
      return
    }
    setBusy(true)
    const result = await sendCode(email)
    setBusy(false)
    if (result.ok) {
      navigate('/sign-in/code', { state: { email: email.trim() } })
    } else if (result.reason === 'rate_limited') {
      setError('Too many tries. Please wait a minute and try again.')
    } else if (result.reason === 'not_configured') {
      setError('Sign-in is not set up yet.')
    } else {
      setError("We couldn't send the code. Check your connection and try again.")
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <div className="space-y-2">
        <Illustration name="footprints" size={120} boil />
        <Headline animate>Sign in</Headline>
        <p className="text-muted-foreground">We'll email you a 6-digit code. No password needed.</p>
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
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
          {busy ? 'Sending…' : 'Send code'}
        </Button>
      </form>
    </main>
  )
}
