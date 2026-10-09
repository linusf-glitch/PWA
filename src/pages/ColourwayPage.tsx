import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'

import { shoeColourFor } from '@/components/illustration/shoe-colour'
import { ShoeSticker } from '@/components/illustration/shoe-sticker'
import { PageHeader } from '@/components/shell/page-header'
import { SettingChip } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'
import { scanResultSchema } from '@/features/scan/events'
import { fetchColourways, type Colourway } from '@/features/shop/shop'

// S08 Choose colourway: the size is fixed by the scan, the parent picks the colour. Sold out ones
// are greyed. The scan result comes in the router state.
export default function ColourwayPage() {
  const navigate = useNavigate()
  const parsed = scanResultSchema.safeParse(useLocation().state)
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

  return (
    <>
      <PageHeader title="Farbe wählen" kidSwitcher back="step" />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        <section className="flex items-center gap-3 rounded-xl bg-card p-4">
          <ShoeSticker colour={shoeColourFor(chosen)} size={84} className="shrink-0" />
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

        <Button
          size="lg"
          className="w-full"
          disabled={!pick}
          onClick={() => pick && navigate('/checkout/go', { state: { ...scan, variantId: pick.variantId, colourway: pick.name } })}
        >
          Weiter zur Kasse
        </Button>
      </main>
    </>
  )
}
