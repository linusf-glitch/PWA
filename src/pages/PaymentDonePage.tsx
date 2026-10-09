import { Link, Navigate, useLocation } from 'react-router'

import { Headline } from '@/components/illustration/illustration'
import { shoeColourFor } from '@/components/illustration/shoe-colour'
import { ShoeSticker } from '@/components/illustration/shoe-sticker'
import { PageHeader } from '@/components/shell/page-header'
import { Button } from '@/components/ui/button'
import { useKids } from '@/features/kids/useKids'
import { orderSchema } from '@/features/shop/order'

// "Zahlung erledigt": where Shopify sends the parent back to. No back arrow, going back would
// reopen the checkout. The order data comes in the router state (demo) for now.
export default function PaymentDonePage() {
  const { selected } = useKids()
  const state = useLocation().state
  const order = orderSchema.safeParse(state)
  if (!order.success) return <Navigate to="/" replace />
  return (
    <>
      <PageHeader title="Zahlung erledigt" back="none" />
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 p-4 text-center lg:p-8">
        <ShoeSticker colour={shoeColourFor(order.data.colourway)} size={150} tilt={-8} animate />
        <Headline as="h2" size="h2" animate className="flex flex-col items-center">
          Danke für deine Bestellung
        </Headline>
        <p role="status" className="text-body">
          Wir richten {selected ? `${selected.name}s` : 'das'} Profil ein. Das dauert einen Moment.
        </p>
        <Button asChild size="lg" className="w-full">
          <Link to="/order/confirmed" state={state}>
            Weiter
          </Link>
        </Button>
      </main>
    </>
  )
}
