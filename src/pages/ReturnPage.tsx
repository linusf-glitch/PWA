import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { PageHeader } from '@/components/shell/page-header'
import { Button } from '@/components/ui/button'
import { returnOrderSchema } from '@/features/shop/order'

import { OrderConfirmedView } from './OrderConfirmedView'

type State = 'loading' | 'missing' | { name: string; size: number; model: string; setting: 'turquoise' | 'yellow' | 'red' }

// The way back from Shopify's thank-you page or the order email: /return?t=<token from the cart>.
// Public (no login): the server only shows the child's first name, size and setting.
export default function ReturnPage() {
  const token = useSearchParams()[0].get('t')
  const [state, setState] = useState<State>(token ? 'loading' : 'missing')

  useEffect(() => {
    if (!token) return
    let current = true
    // The webhook may still be saving the order when the parent lands here: retry a few times.
    const load = async (tries: number): Promise<unknown> => {
      const res = await fetch(`/api/order-return?t=${encodeURIComponent(token)}`)
      if (res.ok) return res.json()
      if (tries <= 0 || !current) throw new Error('not found')
      await new Promise((r) => setTimeout(r, 2000))
      return load(tries - 1)
    }
    load(4)
      .then((json) => {
        const order = returnOrderSchema.parse(json)
        if (current) setState({ name: order.kid_name, size: order.size, model: order.model, setting: order.setting })
      })
      .catch(() => current && setState('missing'))
    return () => {
      current = false
    }
  }, [token])

  if (state === 'loading') return <p role="status" className="p-4 text-muted-foreground">Wir suchen deine Bestellung …</p>
  if (state === 'missing')
    return (
      <>
        <PageHeader title="Bestellung" back="none" />
        <main className="mx-auto flex max-w-2xl flex-col items-start gap-4 p-4 lg:p-8">
          <p className="text-body">Dieser Link ist abgelaufen oder nicht gültig. Du kannst dich mit einem Code per E-Mail anmelden.</p>
          <Button asChild size="lg">
            <Link to="/sign-in">Anmelden</Link>
          </Button>
        </main>
      </>
    )
  return <OrderConfirmedView name={state.name} shoeTitle={`${state.model}, EU ${state.size}`} colourway={state.model} setting={state.setting} token={token ?? undefined} />
}
