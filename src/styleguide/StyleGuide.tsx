import { CalendarDays, TrendingUp } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Confetti, Doodle, Headline } from '@/components/illustration/illustration'
import { ShoeSticker } from '@/components/illustration/shoe-sticker'
import { BentoTile } from '@/components/sizeless/bento-tile'
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
    <Section title="Stickers and motion">
      <div className="relative flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <Headline key={`h${play}`} as="h2" animate>
          Mias Füße sind gewachsen.
        </Headline>
        <div className="sz-sticker-row py-2">
          <ShoeSticker key={`p${play}`} colour="purple" size={110} tilt={-6} animate />
          <ShoeSticker key={`b${play}`} colour="blue" size={110} tilt={4} animate />
          <ShoeSticker key={`g${play}`} colour="green" size={110} tilt={-4} animate />
        </div>
        <p className="text-caption text-muted-foreground">Galaxy = Lila, Reef = Blau, Sprout = Grün</p>
        <div className="flex items-center gap-3">
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
          <div className="grid grid-flow-dense grid-cols-2 gap-3">
            <BentoTile span="wide" tone="apricot" eyebrow="Aktueller Schuh" title="Größe 27" art={<ShoeSticker size={136} tilt={-8} />} className="min-h-[150px] pr-36">
              <SettingChip setting="turquoise" className="mt-2" />
            </BentoTile>
            <BentoTile tone="sage" icon={<TrendingUp />} eyebrow="Seit März" value="+4 mm" />
            <BentoTile tone="lilac" icon={<CalendarDays />} eyebrow="Nächster Check in" value="3 Wochen" />
          </div>
          <NavCard tone="apricot" eyebrow="Liste" title="Sneaker, Größe 26" media={<ShoeSticker size={56} />} onClick={() => {}}>
            <SettingChip setting="yellow" size="sm" />
          </NavCard>
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
          <SettingChip setting="turquoise" size="sm" />
          <SettingChip setting="yellow" size="sm" />
          <SettingChip setting="red" size="sm" />
        </div>
        <SettingChip setting="turquoise" size="lg" prefix="Einstellung" animate />
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
