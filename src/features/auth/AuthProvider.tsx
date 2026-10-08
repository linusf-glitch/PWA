import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { codeSchema, emailSchema } from './schemas'

export type AuthFailure = 'invalid_input' | 'rate_limited' | 'invalid_or_expired' | 'network' | 'not_configured'
export type AuthResult = { ok: true } | { ok: false; reason: AuthFailure }

type AuthApi = {
  session: Session | null
  /** True until we know whether a saved session exists. */
  loading: boolean
  sendCode: (email: string) => Promise<AuthResult>
  verifyCode: (email: string, code: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthApi | null>(null)

function failureFrom(error: { code?: string; status?: number }): AuthFailure {
  if (error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit' || error.status === 429) {
    return 'rate_limited'
  }
  // Supabase gives the same error for a wrong and an expired code.
  if (error.code === 'otp_expired' || error.code === 'validation_failed' || error.status === 403 || error.status === 422) {
    return 'invalid_or_expired'
  }
  return 'network'
}

export function AuthProvider({ client, children }: { client: SupabaseClient | null; children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(client !== null)

  useEffect(() => {
    if (!client) return
    let active = true
    void client.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })
    const { data } = client.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [client])

  const sendCode = useCallback(
    async (email: string): Promise<AuthResult> => {
      if (!client) return { ok: false, reason: 'not_configured' }
      const parsed = emailSchema.safeParse(email.trim())
      if (!parsed.success) return { ok: false, reason: 'invalid_input' }
      try {
        // shouldCreateUser: false. Accounts come from the first Shopify order, never from this screen.
        const { error } = await client.auth.signInWithOtp({
          email: parsed.data,
          options: { shouldCreateUser: false },
        })
        // Unknown emails get the same "success" answer as known ones, so nobody can probe who has an account.
        if (error && error.code !== 'otp_disabled' && error.code !== 'signup_disabled' && error.code !== 'user_not_found') {
          return { ok: false, reason: failureFrom(error) }
        }
        return { ok: true }
      } catch {
        return { ok: false, reason: 'network' }
      }
    },
    [client],
  )

  const verifyCode = useCallback(
    async (email: string, code: string): Promise<AuthResult> => {
      if (!client) return { ok: false, reason: 'not_configured' }
      const parsedEmail = emailSchema.safeParse(email.trim())
      const parsedCode = codeSchema.safeParse(code)
      if (!parsedEmail.success || !parsedCode.success) return { ok: false, reason: 'invalid_input' }
      try {
        const { error } = await client.auth.verifyOtp({ email: parsedEmail.data, token: parsedCode.data, type: 'email' })
        return error ? { ok: false, reason: failureFrom(error) } : { ok: true }
      } catch {
        return { ok: false, reason: 'network' }
      }
    },
    [client],
  )

  const signOut = useCallback(async () => {
    if (client) await client.auth.signOut()
  }, [client])

  const value = useMemo(
    () => ({ session, loading, sendCode, verifyCode, signOut }),
    [session, loading, sendCode, verifyCode, signOut],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- hook lives next to its provider
export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
