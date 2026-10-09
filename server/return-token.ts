import { createHash } from 'node:crypto'

// Random URL-safe token made by the app (src/features/shop/order.ts). We keep only its hash.
export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,100}$/
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')
