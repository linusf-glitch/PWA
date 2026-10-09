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
  // ponytail: not in Footprint's documented payload. Only the stand-in sends it; replace with the real source of the setting once Footprint answers.
  setting: z.enum(['turquoise', 'yellow', 'red']).optional(),
})
export type ScanResult = z.infer<typeof scanResultSchema>

export function parseScanResult(event: Event): ScanResult | null {
  const parsed = scanResultSchema.safeParse((event as CustomEvent).detail)
  return parsed.success ? parsed.data : null
}

// A failed scan: the widget reports an error code instead of a size (flow.md S14, outcome C).
export const scanErrorSchema = z.object({ error_code: z.string().min(1) })

export function parseScanError(event: Event): boolean {
  return scanErrorSchema.safeParse((event as CustomEvent).detail).success
}
