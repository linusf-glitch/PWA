import { Navigate, useLocation } from 'react-router'

import { useKids } from '@/features/kids/useKids'
import { orderSchema } from '@/features/shop/order'

import { OrderConfirmedView } from './OrderConfirmedView'

// Demo and in-app path: the order comes in the router state. The real way back from Shopify is /return.
export default function OrderConfirmedPage() {
  const { selected } = useKids()
  const parsed = orderSchema.safeParse(useLocation().state)
  if (!parsed.success) return <Navigate to="/" replace />
  const { size, setting = 'yellow', colourway } = parsed.data
  return <OrderConfirmedView name={selected?.name} shoeTitle={`Classic Schuh, ${colourway}, EU ${size}`} colourway={colourway} setting={setting} />
}
