import { z } from 'zod'

import { scanResultSchema } from '@/features/scan/events'

// What the order screens need to know: the scan result plus the chosen colourway.
export const orderSchema = scanResultSchema.extend({ colourway: z.string() })
