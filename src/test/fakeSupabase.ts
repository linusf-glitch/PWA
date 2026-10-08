import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { vi } from 'vitest'

type AuthError = { code?: string; status?: number; message: string } | null
type Listener = (event: string, session: Session | null) => void

const fakeSession = { access_token: 'test', user: { id: 'u1', email: 'parent@example.com' } } as unknown as Session

/** A tiny stand-in for the Supabase client: just the auth calls the app uses. */
export function makeFakeSupabase(options: { session?: Session | null } = {}) {
  let current = options.session === undefined ? null : options.session
  const listeners = new Set<Listener>()
  const emit = (event: string) => listeners.forEach((l) => l(event, current))

  const auth = {
    getSession: vi.fn(async () => ({ data: { session: current }, error: null })),
    onAuthStateChange: vi.fn((cb: Listener) => {
      listeners.add(cb)
      return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } }
    }),
    signInWithOtp: vi.fn(async (): Promise<{ error: AuthError }> => ({ error: null })),
    verifyOtp: vi.fn(async (): Promise<{ error: AuthError }> => {
      current = fakeSession
      emit('SIGNED_IN')
      return { error: null }
    }),
    signOut: vi.fn(async () => {
      current = null
      emit('SIGNED_OUT')
      return { error: null }
    }),
  }
  return { client: { auth } as unknown as SupabaseClient, auth, fakeSession }
}
