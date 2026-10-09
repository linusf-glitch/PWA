import { Link, Navigate, useParams } from 'react-router'

import { Headline } from '@/components/illustration/illustration'
import { shoeColourFor } from '@/components/illustration/shoe-colour'
import { ShoeSticker } from '@/components/illustration/shoe-sticker'
import { PageHeader } from '@/components/shell/page-header'
import { SettingChip } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'
import { formatDate, shoesOf } from '@/features/kids/kids'
import { useKids } from '@/features/kids/useKids'

// S16 Shoe detail: one pair. Still in use: size and setting now. Outgrown: the settings it went
// through and the dates worn, and no "buy again". Buying again / the next size come with backlog 11.
export default function ShoeDetailPage() {
  const { selected } = useKids()
  const { id } = useParams()
  const shoe = selected && shoesOf(selected).find((s) => s.id === id)
  if (!selected || !shoe) return <Navigate to="/shoes" replace />
  const outgrown = shoe.status === 'outgrown'
  // A newer pair is already in use: the old pair needs no rescan prompt.
  const replaced = outgrown && selected.shoe
  const rows: [string, React.ReactNode][] = [
    ['Für', selected.name],
    ['Größe', `EU ${shoe.size}`],
    [outgrown ? 'Einstellungen' : 'Einstellung jetzt', shoe.settings.map((s, i) => <SettingChip key={i} setting={s} size="sm" className={i > 0 ? 'ml-3' : ''} />)],
    ['Farbe', shoe.colourway],
    [outgrown ? 'Getragen' : 'Im Einsatz', outgrown ? `${formatDate(shoe.since)} bis ${formatDate(shoe.until!)}` : `seit ${formatDate(shoe.since)}`],
    ['Gekauft', shoe.fromScan ? 'nach einem Scan' : 'nur Größe, ohne Scan'],
  ]
  return (
    <>
      <PageHeader title={`Größe ${shoe.size}`} kidSwitcher back="step" />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        <section className="flex flex-col items-center gap-3 text-center">
          <ShoeSticker colour={shoeColourFor(shoe.colourway)} size={150} tilt={-8} animate label={`Sizeless-Schuh ${shoe.colourway}`} />
          <Headline as="h2" size="h2" animate className="flex flex-col items-center">
            Classic Schuh
          </Headline>
        </section>
        <dl className="flex flex-col gap-2 rounded-xl bg-card p-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <dt className="text-body-small text-muted-foreground">{label}</dt>
              <dd className="text-label">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-body">
          {replaced
            ? `${selected.name} ist aus Größe ${shoe.size} herausgewachsen und trägt jetzt Größe ${selected.shoe!.size}.`
            : outgrown
            ? `${selected.name} ist aus Größe ${shoe.size} herausgewachsen. Miss die Füße erst neu, damit das nächste Paar heute passt.`
            : `Größe ${shoe.size} ist weiterhin die Größe von ${selected.name}.`}
        </p>
        {!replaced && (
          <Button asChild size="lg" variant={outgrown ? 'default' : 'outline'} className="w-full">
            <Link to="/scan">{outgrown ? 'Erst neu scannen' : `Füße von ${selected.name} neu scannen`}</Link>
          </Button>
        )}
      </main>
    </>
  )
}
