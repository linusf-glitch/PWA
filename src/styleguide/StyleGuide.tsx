import { Footprints, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'

import { NavCard } from '@/components/sizeless/nav-card'
import { SettingChip } from '@/components/sizeless/setting-chip'
import { SizeBadge } from '@/components/sizeless/size-badge'
import { Button } from '@/components/ui/button'

// Internal page (/styleguide.html) showing the design tokens and base components, so they can be
// checked on a phone in each Vercel preview. Not linked from the app.

const COLOURS: Array<[string, string]> = [
  ['primary', 'bg-primary'],
  ['primary-pressed', 'bg-primary-pressed'],
  ['brand-teal-light', 'bg-brand-teal-light'],
  ['brand-deep-turquoise', 'bg-brand-deep-turquoise'],
  ['foreground', 'bg-foreground'],
  ['muted-foreground', 'bg-muted-foreground'],
  ['secondary / muted', 'bg-muted'],
  ['accent', 'bg-accent'],
  ['border', 'bg-border'],
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

export default function StyleGuide() {
  return (
    <main className="mx-auto flex max-w-[560px] flex-col gap-12 px-4 py-8">
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
            <NavCard eyebrow="Aktueller Schuh" title="Sizeless Sneaker" onClick={() => {}}>
              <SizeBadge size={27} />
              <SettingChip setting="turquoise" size="sm" />
            </NavCard>
            <NavCard
              eyebrow="Wachstum"
              title="+4 mm seit März"
              media={<TrendingUp aria-hidden="true" className="size-6 text-chart-2" />}
              onClick={() => {}}
            />
            <NavCard
              eyebrow="Nächster Passform-Check"
              title="In 3 Wochen"
              media={<Footprints aria-hidden="true" className="size-6 text-primary" />}
              onClick={() => {}}
            />
          </div>
        </div>
      </Section>

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
