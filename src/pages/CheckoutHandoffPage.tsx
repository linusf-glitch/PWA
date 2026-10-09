import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'

import { Headline } from '@/components/illustration/illustration'
import { shoeColourFor } from '@/components/illustration/shoe-colour'
import { ShoeSticker } from '@/components/illustration/shoe-sticker'
import { PageHeader } from '@/components/shell/page-header'
import { SettingChip } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'
import { useKids } from '@/features/kids/useKids'
import { scanResultSchema } from '@/features/scan/events'
import { createCheckoutUrl } from '@/features/shop/shop'
import { readShopEnv } from '@/lib/env'

const handoffSchema = scanResultSchema.extend({ variantId: z.string(), colourway: z.string() })

// S09 Hand-off: summary of the order, then on to Shopify's own checkout (payment runs there).
// Size, setting and measurement travel along as cart attributes for the order webhook.
export default function CheckoutHandoffPage() {
  const { selected } = useKids()
  const navigate = useNavigate()
  const parsed = handoffSchema.safeParse(useLocation().state)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string>()
  if (!parsed.success) return <Navigate to="/scan" replace />
  const { size, setting = 'yellow', colourway, variantId, measurement_id } = parsed.data

  async function goToCheckout() {
    // Demo (no Shopify keys): skip Shopify and show what comes after payment.
    if (!readShopEnv()) return navigate('/order/done', { state: parsed.data })
    setBusy(true)
    setMessage(undefined)
    try {
      window.location.assign(
        await createCheckoutUrl(variantId, { size: String(size), setting, measurement_id, ...(selected && { kid_name: selected.name }) }),
      )
    } catch {
      setBusy(false)
      setMessage('Die Kasse konnte nicht geöffnet werden. Bitte versuch es gleich noch einmal.')
    }
  }

  return (
    <>
      <PageHeader title="Kasse" kidSwitcher back="step" />
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 p-4 text-center lg:p-8">
        <ShoeSticker colour={shoeColourFor(colourway)} size={150} tilt={-8} animate label={`Sizeless-Schuh ${colourway}`} />
        <Headline as="h2" size="h2" animate className="flex flex-col items-center">
          Weiter zur sicheren Kasse
        </Headline>
        <p className="text-body">Die Zahlung läuft bei Shopify. Größe und Einstellung{selected && ` von ${selected.name}`} reisen mit, du musst nichts noch einmal eingeben.</p>
        <section aria-label="Deine Bestellung" className="flex w-full flex-col items-center gap-2 rounded-xl bg-card p-4">
          <p className="text-label">
            Classic Schuh, {colourway}, EU {size}
          </p>
          <SettingChip setting={setting} />
        </section>
        {message && (
          <p role="status" className="text-body-small">
            {message}
          </p>
        )}
        <Button size="lg" className="w-full" disabled={busy} onClick={goToCheckout}>
          Weiter zur Kasse
        </Button>
      </main>
    </>
  )
}
