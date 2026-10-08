import { z } from 'zod'

// Window events the Footprint widget fires (docs/integrations.md). The payload comes from a third
// party, so it is validated before use.
export const FPT_EVENTS = {
  addToCart: 'fpt-add-to-cart',
  backToShop: 'fpt-back-to-shop',
  cancel: 'fpt-cancel',
} as const

export const scanResultSchema = z.object({
  matching_id: z.string().optional(),
  measurement_id: z.string(),
  session_id: z.string().optional(),
  size: z.coerce.number().int().min(15).max(45),
  error_code: z.string().optional(),
  article_number: z.string(),
})
export type ScanResult = z.infer<typeof scanResultSchema>

export function parseScanResult(event: Event): ScanResult | null {
  const parsed = scanResultSchema.safeParse((event as CustomEvent).detail)
  return parsed.success ? parsed.data : null
}
