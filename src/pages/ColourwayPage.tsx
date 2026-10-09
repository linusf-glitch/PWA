import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'

import { shoeColourFor } from '@/components/illustration/shoe-colour'
import { ShoeSticker } from '@/components/illustration/shoe-sticker'
import { PageHeader } from '@/components/shell/page-header'
import { SettingChip } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'
import { orderBaseSchema } from '@/features/scan/events'
import { useKids } from '@/features/kids/useKids'
import { newReturnToken } from '@/features/shop/order'
import { createCheckoutUrl, fetchColourways, type Colourway } from '@/features/shop/shop'
import { readShopEnv } from '@/lib/env'

// S08 Choose colourway: the size is fixed by the scan, the parent picks the colour. Sold out ones
// are greyed. The scan result comes in the router state. The button goes straight to Shopify's own
// checkout (payment runs there); size, setting, measurement and child travel as cart attributes
// for the order webhook.
export default function ColourwayPage() {
  const navigate = useNavigate()
  const { selected } = useKids()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string>()
  const parsed = orderBaseSchema.safeParse(useLocation().state)
  const scan = parsed.success ? parsed.data : null
  const [colourways, setColourways] = useState<Colourway[] | 'error' | null>(null)
  const [chosen, setChosen] = useState<string>()
  const size = scan?.size

  useEffect(() => {
    if (size === undefined) return
    fetchColourways(size)
      .then((list) => {
        setColourways(list)
        setChosen(list.find((c) => c.available)?.name)
      })
      .catch(() => setColourways('error'))
  }, [size])

  if (!scan) return <Navigate to="/scan" replace />
  const list = Array.isArray(colourways) ? colourways : []
  const pick = list.find((c) => c.name === chosen)
  const soldOut = list.filter((c) => !c.available)

  function simulatePayment() {
    if (pick && scan) navigate('/order/done', { state: { ...scan, variantId: pick.variantId, colourway: pick.name } })
  }

  async function goToCheckout() {
    if (!pick || !scan) return
    // Demo (no Shopify keys): skip Shopify and show what comes after payment.
    if (!readShopEnv()) return simulatePayment()
    setBusy(true)
    setMessage(undefined)
    try {
      window.location.assign(
        await createCheckoutUrl(pick.variantId, {
          size: String(scan.size),
          setting: scan.setting ?? 'yellow',
          ...(scan.measurement_id && { measurement_id: scan.measurement_id }),
          _return_token: newReturnToken(),
          ...(selected && { kid_name: selected.name, kid_birth: selected.birthDate.slice(0, 7) }),
        }),
      )
    } catch {
      setBusy(false)
      setMessage('Die Kasse konnte nicht geöffnet werden. Bitte versuch es gleich noch einmal.')
    }
  }

  return (
    <>
      <PageHeader title="Farbe wählen" kidSwitcher back="step" />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        <section className="flex items-center gap-3 rounded-xl bg-card p-4">
          {pick?.image ? (
            <img src={pick.image} alt="" className="size-21 shrink-0 rounded-lg object-cover" />
          ) : (
            <ShoeSticker colour={shoeColourFor(chosen)} size={84} className="shrink-0" />
          )}
          <div className="flex flex-col gap-1">
            <p className="text-h3">Classic Schuh, EU {scan.size}</p>
            <SettingChip setting={scan.setting ?? 'yellow'} />
          </div>
        </section>

        {colourways === null && <p role="status" className="text-muted-foreground">Wir laden die Farben …</p>}
        {colourways === 'error' && (
          <p role="alert" className="text-destructive">
            Die Farben konnten nicht geladen werden. Bitte versuch es gleich noch einmal.
          </p>
        )}
        {Array.isArray(colourways) && list.length === 0 && (
          <div className="flex flex-col items-start gap-2">
            <p className="text-body">Die Größe {scan.size} gibt es noch nicht im Shop.</p>
            <Button asChild variant="link">
              <Link to="/scan">Noch einmal scannen</Link>
            </Button>
          </div>
        )}
        {list.length > 0 && (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-h3">Welche Farbe?</legend>
            <div className="grid grid-cols-3 gap-3">
              {list.map((c) => (
                <label
                  key={c.name}
                  className="flex min-h-11 flex-col items-center gap-2 rounded-xl border-2 bg-card p-2 text-center has-checked:border-ink has-disabled:opacity-50 has-focus-visible:ring-2 has-focus-visible:ring-ring"
                >
                  <input
                    type="radio"
                    name="colourway"
                    className="sr-only"
                    checked={chosen === c.name}
                    disabled={!c.available}
                    onChange={() => setChosen(c.name)}
                  />
                  {c.image ? (
                    <img src={c.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
                  ) : (
                    <span className="flex aspect-square w-full items-center justify-center">
                      <ShoeSticker colour={shoeColourFor(c.name)} size={84} />
                    </span>
                  )}
                  <span className="text-label">{c.name}</span>
                  {!c.available && <span className="text-caption">Ausverkauft</span>}
                </label>
              ))}
            </div>
            {soldOut.length > 0 && (
              <p className="text-body-small text-muted-foreground">
                {soldOut.map((c) => c.name).join(', ')} {soldOut.length > 1 ? 'sind' : 'ist'} in Größe {scan.size} gerade ausverkauft.
              </p>
            )}
          </fieldset>
        )}

        <p className="text-body-small text-muted-foreground">
          Die Zahlung läuft bei Shopify. Größe und Einstellung{selected && ` von ${selected.name}`} reisen mit, du musst nichts noch einmal eingeben.
        </p>
        {message && (
          <p role="status" className="text-body-small">
            {message}
          </p>
        )}
        <Button size="lg" className="w-full" disabled={!pick || busy} onClick={goToCheckout}>
          Weiter zur Kasse
        </Button>
        {/* Test helper: only shows where VITE_TEST_TOOLS=true is set (Vercel, Preview and Production for now). */}
        {import.meta.env.VITE_TEST_TOOLS === 'true' && (
          <Button size="lg" variant="outline" className="w-full" disabled={!pick} onClick={simulatePayment}>
            Test: Zahlung simulieren
          </Button>
        )}
      </main>
    </>
  )
}
