import { ChevronRight, Lock, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { Headline, Illustration } from '@/components/illustration/illustration'
import type { DrawingName } from '@/components/illustration/drawings'
import { KidSwitcher } from '@/components/shell/kid-switcher'
import { NavCard } from '@/components/sizeless/nav-card'
import { SettingChip } from '@/components/sizeless/setting-chip'
import { SizeBadge } from '@/components/sizeless/size-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { daysUntil, formatDate, homeState, type HomeState, type Kid } from '@/features/kids/kids'
import { useKids } from '@/features/kids/useKids'

// Home is the hub: one dominant action for the selected child (see homeState), then the
// child's overview. Other children with something to do get one line each.
export default function HomePage() {
  const { kids, selected, select } = useKids()
  return (
    <>
      <header className="sz-glass-bar sticky top-0 z-10 flex min-h-14 items-center gap-2 px-4 pt-[env(safe-area-inset-top)] lg:hidden">
        <h1 className="text-h3 tracking-wide text-foreground">
          <span aria-hidden="true">SIZELESS</span>
          <span className="sr-only">Sizeless</span>
        </h1>
        <KidSwitcher className="ml-auto" />
        <Link
          to="/account"
          className="flex min-h-11 items-center gap-2 rounded-full py-1 pr-3 pl-1 text-label outline-none active:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-muted">
            <UserRound aria-hidden="true" className="size-5" />
          </span>
          Konto
        </Link>
      </header>
      <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 lg:p-8">
        {selected ? (
          <>
            <Hero kid={selected} state={homeState(selected)} />
            {kids
              .filter((k) => k.id !== selected.id && homeState(k) !== 'normal')
              .map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => select(k.id)}
                  className="flex min-h-12 items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left outline-none active:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-7 items-center justify-center rounded-full bg-accent text-caption font-semibold text-accent-foreground"
                  >
                    {k.name.charAt(0)}
                  </span>
                  <span className="flex-1 text-body-small">
                    <span className="font-semibold">{k.name}:</span> {OTHER_KID_LINE[homeState(k)]}
                  </span>
                  <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
                </button>
              ))}
            <Overview kid={selected} />
          </>
        ) : (
          <EmptyHome />
        )}
      </main>
    </>
  )
}

const OTHER_KID_LINE: Record<HomeState, string> = {
  noShoes: 'erster Scan fällig',
  fitCheck: 'Schuhe drücken, neu scannen',
  rescanDue: 'Scan bald fällig',
  season: 'Größe für den Winter prüfen',
  normal: '',
}

const HERO_DRAWING: Record<HomeState, DrawingName> = {
  noShoes: 'footprints',
  fitCheck: 'measure',
  rescanDue: 'ruler',
  season: 'sock',
  normal: 'hand',
}

function Hero({ kid, state }: { kid: Kid; state: HomeState }) {
  const copy = {
    noShoes: {
      eyebrow: `Nächster Schritt für ${kid.name}`,
      text: `${kid.name} hat noch keine Sizeless-Schuhe. Ein Scan zeigt die richtige Größe.`,
      action: `Füße von ${kid.name} scannen`,
    },
    fitCheck: {
      eyebrow: 'Aus deiner WhatsApp-Antwort',
      title: 'Du hast gesagt, die Schuhe drücken',
      text: `Ein neuer Scan zeigt, ob eine andere Einstellung reicht oder ${kid.name} die nächste Größe braucht.`,
      action: 'Jetzt neu scannen',
    },
    rescanDue: {
      eyebrow:
        kid.nextFitCheck && daysUntil(kid.nextFitCheck) > 0
          ? `Scan fällig in ${daysUntil(kid.nextFitCheck)} Tagen`
          : 'Scan fällig',
      text: `Wenn die Schuhe schon eng sitzen, prüf es jetzt.`,
      action: `${kid.name} neu scannen`,
    },
    season: {
      eyebrow: 'Der Winter kommt',
      text: `Prüf in 2 Minuten die Größe von ${kid.name} für den Winterstiefel.`,
      action: 'Für Winterstiefel scannen',
    },
    normal: {
      eyebrow: `Nächster Schritt für ${kid.name}`,
      text: `Ein Scan in 2 Minuten zeigt, ob die Einstellung von ${kid.name} wechseln muss.`,
      action: `Füße von ${kid.name} neu scannen`,
    },
  }[state]

  return (
    <section data-state={state} className="flex flex-col gap-3 rounded-xl bg-accent p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-3">
          <p className="text-caption font-semibold text-accent-foreground">{copy.eyebrow}</p>
          {'title' in copy && <h2 className="text-h2">{copy.title}</h2>}
          <p className="text-body">{copy.text}</p>
        </div>
        <Illustration name={HERO_DRAWING[state]} size={92} boil={state === 'normal'} className="-mt-1 -mr-1 shrink-0" />
      </div>
      <Button asChild size="lg" className="w-full">
        <Link to="/scan">{copy.action}</Link>
      </Button>
    </section>
  )
}

function Overview({ kid }: { kid: Kid }) {
  return (
    <section aria-labelledby="overview" className="flex flex-col gap-3">
      <h2 id="overview" className="mt-2 text-caption text-muted-foreground">
        Übersicht für {kid.name}
      </h2>
      <NavCard
        href="/shoes"
        eyebrow="Schuhe"
        title={kid.shoe ? `${kid.shoe.model}-Schuh` : 'Noch keine Schuhe'}
        tone="apricot"
        media={<Illustration name="shoe" size={48} />}
      >
        {kid.shoe && (
          <>
            <SizeBadge size={kid.shoe.size} />
            <SettingChip setting={kid.shoe.setting} size="sm" />
          </>
        )}
      </NavCard>
      <NavCard
        href="/growth"
        eyebrow="Wachstum"
        title={kid.measurements === 1 ? '1 Messung' : `${kid.measurements} Messungen`}
        tone="lilac"
        media={<Illustration name="sprout" size={48} />}
      />
      {kid.nextFitCheck && (
        <NavCard
          href="/account"
          eyebrow="Nächster Passform-Check"
          title={`ca. ${formatDate(kid.nextFitCheck)}`}
          tone="sage"
          media={<Illustration name="tape" size={48} />}
        >
          Wir fragen per WhatsApp
        </NavCard>
      )}
    </section>
  )
}

// No child yet: gift or referral recipient. The scan creates the child.
function EmptyHome() {
  const [name, setName] = useState('')
  const trimmed = name.trim()
  return (
    <>
      <section className="flex flex-col gap-3 rounded-xl bg-accent p-5">
        <p className="text-caption font-semibold text-accent-foreground">Willkommen bei Sizeless</p>
        <Headline as="h2" size="h2" animate>
          Wen messen wir?
        </Headline>
        <label htmlFor="kid-name" className="text-label">
          Vorname
        </label>
        <Input id="kid-name" value={name} autoComplete="off" onChange={(e) => setName(e.target.value)} />
        <Button asChild size="lg" className="w-full">
          <Link to="/scan">{trimmed ? `Füße von ${trimmed} scannen` : 'Füße deines Kindes scannen'}</Link>
        </Button>
      </section>
      <p className="flex gap-3 text-body-small text-muted-foreground">
        <Lock aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        Die Scan-Fotos werden nur zum Messen der Füße genutzt. Wir geben sie nie weiter und zeigen sie niemandem.
      </p>
    </>
  )
}
