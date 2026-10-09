import { CalendarDays, Lock, TrendingUp, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { Headline } from '@/components/illustration/illustration'
import { shoeColourFor } from '@/components/illustration/shoe-colour'
import { ShoeSticker } from '@/components/illustration/shoe-sticker'
import { KidSwitcher } from '@/components/shell/kid-switcher'
import { BentoTile } from '@/components/sizeless/bento-tile'
import { SettingChip } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { daysUntil, formatDate, homeState, type HomeState, type Kid } from '@/features/kids/kids'
import { useKids } from '@/features/kids/useKids'

// Home is the hub: one dominant action for the selected child (see homeState), then the
// child's overview. Other children are reached through the kid switcher.
export default function HomePage() {
  const { selected } = useKids()
  return (
    <>
      <header className="sz-glass-bar sticky top-0 z-10 flex min-h-14 items-center gap-2 px-4 pt-[env(safe-area-inset-top)] lg:hidden">
        <h1>
          <img src="/sizeless-logo.png" alt="Sizeless" className="h-[26px] w-auto" />
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
            <Overview kid={selected} />
          </>
        ) : (
          <EmptyHome />
        )}
      </main>
    </>
  )
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
    <section data-state={state} className="flex flex-col gap-3 pt-2">
      {'title' in copy && <p className="text-caption font-semibold text-muted-foreground">{copy.eyebrow}</p>}
      <Headline as="h2" size="h2" animate>
        {'title' in copy ? copy.title : copy.eyebrow}
      </Headline>
      <p className="text-body">{copy.text}</p>
      <Button asChild size="lg" className="mt-2 w-full">
        <Link to={kid.shoe ? '/rescan' : '/scan'}>{copy.action}</Link>
      </Button>
    </section>
  )
}

// Bento overview (design system 2.2): one idea per tile. Apricot = shoe, sage = growth, lilac = calendar.
function Overview({ kid }: { kid: Kid }) {
  return (
    <section aria-labelledby="overview" className="flex flex-col gap-3">
      <h2 id="overview" className="mt-2 text-caption text-muted-foreground">
        Übersicht für {kid.name}
      </h2>
      <div className="grid grid-flow-dense grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <BentoTile
          span="wide"
          tone="apricot"
          href="/shoes"
          eyebrow="Aktueller Schuh"
          title={kid.shoe ? `Größe ${kid.shoe.size}` : 'Noch keine Schuhe'}
          art={<ShoeSticker colour={shoeColourFor(kid.shoe?.model)} size={136} tilt={-8} />}
          className="min-h-[150px] pr-36"
        >
          {kid.shoe && <SettingChip setting={kid.shoe.setting} className="mt-2" />}
        </BentoTile>
        <BentoTile
          span={kid.nextFitCheck ? undefined : 'wide'}
          tone="sage"
          href="/growth"
          icon={<TrendingUp />}
          eyebrow="Wachstum"
          value={kid.measurements}
        >
          <span className="text-body-small">{kid.measurements === 1 ? 'Messung' : 'Messungen'}</span>
        </BentoTile>
        {kid.nextFitCheck && (
          <BentoTile tone="lilac" href="/account" icon={<CalendarDays />} eyebrow="Nächster Passform-Check" title={`ca. ${formatDate(kid.nextFitCheck)}`}>
            <span className="mt-auto text-body-small text-muted-foreground">Wir fragen per WhatsApp</span>
          </BentoTile>
        )}
      </div>
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
