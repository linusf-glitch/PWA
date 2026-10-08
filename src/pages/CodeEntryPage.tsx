import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'

import { Headline, Illustration } from '@/components/illustration/illustration'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
          ? "We couldn't check the code. Check your connection and try again."
          : "That code didn't work. It may be wrong or expired. Check the latest email, or send a new code.",
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
      setNotice('A new code is on its way.')
      setCooldown(RESEND_SECONDS)
    } else {
      setError(
        result.reason === 'rate_limited'
          ? 'Too many tries. Please wait a minute and try again.'
          : "We couldn't send a new code. Try again in a moment.",
      )
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-6">
      <Button asChild variant="ghost" size="icon" className="-ml-2 self-start">
        <Link to="/sign-in" aria-label="Back">
          <ArrowLeft />
        </Link>
      </Button>
      <div className="space-y-2">
        <Illustration name="stars" size={110} boil />
        <Headline animate>Enter your code</Headline>
        <p className="text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
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
          <label htmlFor="code" className="text-sm font-medium">
            6-digit code
          </label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            className="text-center text-2xl tracking-[0.5em]"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            disabled={busy}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'code-error' : undefined}
          />
          {error && (
            <p id="code-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-sm text-muted-foreground">
              {notice}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy || code.length !== 6}>
          {busy ? 'Checking…' : 'Continue'}
        </Button>
      </form>
      <Button type="button" variant="link" onClick={resend} disabled={cooldown > 0 || busy}>
        {cooldown > 0 ? `Send a new code in ${cooldown}s` : 'Send a new code'}
      </Button>
    </main>
  )
}
