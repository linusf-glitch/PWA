import { ChevronRight, Footprints } from 'lucide-react'
import { Link } from 'react-router'

import { Headline } from '@/components/illustration/illustration'
import { shoeColourFor } from '@/components/illustration/shoe-colour'
import { ShoeSticker } from '@/components/illustration/shoe-sticker'
import { PageHeader } from '@/components/shell/page-header'
import { SettingChip } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'
import { formatDate, shoesOf, type ShoeEntry } from '@/features/kids/kids'
import { useKids } from '@/features/kids/useKids'

function Row({ shoe }: { shoe: ShoeEntry }) {
  const dates = shoe.until ? `${formatDate(shoe.since)} bis ${formatDate(shoe.until)}` : `seit ${formatDate(shoe.since)}`
  return (
    <li>
      <Link to={`/shoes/${shoe.id}`} className="flex min-h-11 items-center gap-3 rounded-xl bg-card p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ShoeSticker colour={shoeColourFor(shoe.colourway)} size={56} className="shrink-0" />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-label">Classic Schuh, Größe {shoe.size}</span>
          <SettingChip setting={shoe.settings[shoe.settings.length - 1]} size="sm" />
          <span className="text-caption text-muted-foreground">
            {dates} · {shoe.fromScan ? 'nach Scan' : 'nur Größe, ohne Scan'}
          </span>
        </span>
        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  )
}

// S16 Shoes: every pair of the selected child, "Im Einsatz" and "Zu klein geworden". Sample data until
// shoes are read from Supabase (phase 6).
export default function ShoesPage() {
  const { selected } = useKids()
  const shoes = selected ? shoesOf(selected) : []
  const groups = [
    { title: 'Im Einsatz', items: shoes.filter((s) => s.status === 'inUse') },
    { title: 'Zu klein geworden', items: shoes.filter((s) => s.status === 'outgrown') },
  ]
  return (
    <>
      <PageHeader title="Schuhe" kidSwitcher />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        {shoes.length === 0 ? (
          <section className="flex flex-col items-start gap-3">
            <Headline as="h2" size="h2" animate>
              Noch keine Schuhe
            </Headline>
            <p className="text-body">
              {selected ? `${selected.name} hat noch keine Sizeless-Schuhe.` : 'Hier erscheinen die Schuhe deines Kindes.'} Sobald das erste Paar da ist, steht es hier mit Größe, Einstellung und Datum.
            </p>
          </section>
        ) : (
          groups.map(
            (g) =>
              g.items.length > 0 && (
                <section key={g.title} aria-label={g.title} className="flex flex-col gap-3">
                  <h2 className="text-caption text-muted-foreground">{g.title}</h2>
                  <ul className="flex flex-col gap-3">
                    {g.items.map((s) => (
                      <Row key={s.id} shoe={s} />
                    ))}
                  </ul>
                </section>
              ),
          )
        )}
        {selected && (
          <Button asChild variant="outline" className="w-full">
            <Link to="/scan">
              <Footprints aria-hidden="true" />
              Füße von {selected.name} neu scannen
            </Link>
          </Button>
        )}
      </main>
    </>
  )
}
