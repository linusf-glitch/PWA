import { z } from 'zod'

export const emailSchema = z.email().max(254)
export const codeSchema = z.string().regex(/^\d{6}$/)
