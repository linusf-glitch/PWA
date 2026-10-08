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

const shopEnvSchema = z.object({
  VITE_SHOPIFY_STORE_DOMAIN: z.string().min(1),
  VITE_SHOPIFY_STOREFRONT_TOKEN: z.string().min(1),
})

/** Public Shopify Storefront settings (the token is public by design), or null when not set up yet. */
export function readShopEnv(raw: Record<string, unknown> = import.meta.env) {
  const parsed = shopEnvSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}
