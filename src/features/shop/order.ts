import { z } from 'zod'

import { orderBaseSchema } from '@/features/scan/events'

// What the order screens need to know: the scan result plus the chosen colourway.
export const orderSchema = orderBaseSchema.extend({ colourway: z.string() })

/** Random token for the return link after payment. The server keeps only its hash. */
export function newReturnToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// The minimum the return link shows (api/order-return.ts).
export const returnOrderSchema = z.object({
  kid_name: z.string(),
  size: z.number(),
  setting: z.enum(['turquoise', 'yellow', 'red']),
  model: z.string(),
})
