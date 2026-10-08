import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
})

/** Public Supabase settings, or null when the app is not configured yet. */
export function readEnv(raw: Record<string, unknown> = import.meta.env) {
  const parsed = envSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}
