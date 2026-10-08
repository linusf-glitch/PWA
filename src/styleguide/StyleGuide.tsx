import { Footprints, TrendingUp } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Confetti, Doodle, Headline, Illustration, SvgDefs } from '@/components/illustration/illustration'
import { DRAWINGS, type DrawingName } from '@/components/illustration/drawings'

import { NavCard } from '@/components/sizeless/nav-card'
import { SettingChip } from '@/components/sizeless/setting-chip'
import { SizeBadge } from '@/components/sizeless/size-badge'
import { Button } from '@/components/ui/button'

// Internal page (/styleguide.html) showing the design tokens and base components, so they can be
// checked on a phone in each Vercel preview. Not linked from the app.

const COLOURS: Array<[string, string]> = [
  ['primary', 'bg-primary'],
  ['primary-pressed', 'bg-primary-pressed'],
  ['ink / foreground', 'bg-ink'],
  ['background', 'bg-background'],
  ['card', 'bg-card'],
  ['muted-foreground', 'bg-muted-foreground'],
  ['secondary / muted', 'bg-muted'],
  ['accent-apricot', 'bg-accent-apricot'],
  ['accent-apricot-soft', 'bg-accent-apricot-soft'],
  ['accent-lilac', 'bg-accent-lilac'],
  ['accent-lilac-soft', 'bg-accent-lilac-soft'],
  ['accent-sage', 'bg-accent-sage'],
  ['accent-sage-soft', 'bg-accent-sage-soft'],
  ['border', 'bg-border'],
  ['border-strong', 'bg-border-strong'],
  ['input', 'bg-input'],
  ['destructive', 'bg-destructive'],
  ['success', 'bg-success'],
  ['warning', 'bg-warning'],
  ['info', 'bg-info'],
]

const TYPE: Array<[string, string, string]> = [
  ['display', 'text-display', 'Passt der Schuh noch?'],
  ['h1', 'text-h1', 'Wachstum von Mia'],
  ['h2', 'text-h2', 'Deine Schuhe'],
  ['h3', 'text-h3', 'Nächster Passform-Check'],
  ['body', 'text-body', 'Kinderfüße wachsen schnell. Ein neuer Scan dauert eine Minute.'],
  ['body-small', 'text-body-small', 'Letzter Scan vor 9 Wochen'],
  ['label', 'text-label', 'E-Mail-Adresse'],
  ['caption', 'text-caption', 'Seit März +4 mm'],
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-h2">{title}</h2>
      {children}
    </section>
  )
}

function Drawings() {
  const [play, setPlay] = useState(0)
  return (
    <Section title="Drawings and motion">
      <div className="relative flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <Headline key={`h${play}`} as="h2" animate>
          Mias Füße sind gewachsen.
        </Headline>
        <div className="grid grid-cols-4 gap-3">
          {(Object.keys(DRAWINGS) as DrawingName[]).map((name) => (
            <Illustration key={`${name}${play}`} name={name} size={72} draw />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Illustration key={`b${play}`} name="hand" size={120} boil />
          <Doodle name="star" color="lilac" />
          <Doodle name="squiggle" color="apricot" />
          <Doodle name="dots" color="sage" />
          <Doodle name="spark" color="apricot" />
        </div>
        <Confetti play={play} />
        <Button variant="outline" onClick={() => setPlay((n) => n + 1)}>
          Nochmal abspielen
        </Button>
      </div>
    </Section>
  )
}

export default function StyleGuide() {
  return (
    <main className="mx-auto flex max-w-[560px] flex-col gap-12 px-4 py-8">
      <SvgDefs />
      <header className="flex flex-col gap-2">
        <p className="text-caption text-muted-foreground">Sizeless App · Design system</p>
        <h1 className="text-display">Styleguide</h1>
      </header>

      <Section title="Home example">
        <div className="flex flex-col gap-6 rounded-xl border bg-background p-4">
          <div className="flex flex-col gap-2">
            <p className="text-body-small text-muted-foreground">Letzter Scan vor 9 Wochen</p>
            <p className="text-display">Mias Füße sind gewachsen.</p>
          </div>
          <Button size="lg" className="w-full">
            Füße von Mia neu scannen
          </Button>
          <div className="flex flex-col gap-3">
            <NavCard tone="apricot" eyebrow="Aktueller Schuh" title="Sizeless Sneaker" onClick={() => {}}>
              <SizeBadge size={27} />
              <SettingChip setting="turquoise" size="sm" />
            </NavCard>
            <NavCard
              tone="lilac"
              eyebrow="Wachstum"
              title="+4 mm seit März"
              media={<TrendingUp aria-hidden="true" className="size-6 text-chart-2" />}
              onClick={() => {}}
            />
            <NavCard
              tone="sage"
              eyebrow="Nächster Passform-Check"
              title="In 3 Wochen"
              media={<Footprints aria-hidden="true" className="size-6 text-ink" />}
              onClick={() => {}}
            />
          </div>
        </div>
      </Section>

      <Drawings />

      <Section title="Buttons">
        <Button size="lg" className="w-full">
          Code senden
        </Button>
        <Button size="lg" variant="outline" className="w-full">
          Später erinnern
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Weiter</Button>
          <Button variant="link">Wie es funktioniert</Button>
          <Button disabled>Deaktiviert</Button>
        </div>
      </Section>

      <Section title="Shoe setting (not the shoe colour)">
        <div className="flex flex-wrap gap-3">
          <SettingChip setting="turquoise" />
          <SettingChip setting="yellow" />
          <SettingChip setting="red" />
        </div>
        <div className="flex flex-wrap gap-3">
          <SettingChip setting="turquoise" tone="soft" size="sm" />
          <SettingChip setting="yellow" tone="soft" size="sm" />
          <SettingChip setting="red" tone="soft" size="sm" />
        </div>
      </Section>

      <Section title="Size badge">
        <div className="flex gap-3">
          <SizeBadge size={25} />
          <SizeBadge size={27} />
        </div>
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-3">
          {TYPE.map(([name, cls, sample]) => (
            <div key={name} className="flex flex-col">
              <span className="text-caption text-muted-foreground">{name}</span>
              <span className={cls}>{sample}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Colours">
        <ul className="grid grid-cols-2 gap-3">
          {COLOURS.map(([name, cls]) => (
            <li key={name} className="flex items-center gap-3">
              <span className={`size-10 shrink-0 rounded-md border ${cls}`} />
              <span className="text-body-small">{name}</span>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  )
}
