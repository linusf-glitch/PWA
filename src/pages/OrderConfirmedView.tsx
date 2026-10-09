import { Link } from 'react-router'

import { Confetti, Headline } from '@/components/illustration/illustration'
import { shoeColourFor } from '@/components/illustration/shoe-colour'
import { ShoeSticker } from '@/components/illustration/shoe-sticker'
import { PageHeader } from '@/components/shell/page-header'
import { SettingChip, type ShoeSetting } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'
import { ConsentForm } from '@/features/consent/ConsentForm'

// S10 Order confirmed: the profile is saved, how to sign in, and the WhatsApp opt-in (only here,
// after purchase). No back arrow: the order is done. Shown from the router state (demo) and from the
// return link (ReturnPage).
export function OrderConfirmedView({ name, shoeTitle, colourway, setting, token }: { name?: string; shoeTitle: string; colourway: string; setting: ShoeSetting; token?: string }) {
  return (
    <>
      <PageHeader title="Bestellung bestätigt" back="none" />
      <main className="relative mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        <Confetti />
        <section className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Headline as="h2" size="h2" animate>
              Danke für deine Bestellung
            </Headline>
            <p className="text-body">
              Bestellung bestätigt. {name ? `${name}s` : 'Das'} Profil ist gespeichert.
            </p>
          </div>
          <ShoeSticker colour={shoeColourFor(colourway)} size={110} tilt={-8} animate className="mt-2 shrink-0" />
        </section>

        <section aria-label="Gespeichert" className="flex flex-col gap-2 rounded-xl bg-card p-4">
          <p className="text-caption text-muted-foreground">{name ? `Gespeichert für ${name}` : 'Gespeichert'}</p>
          <p className="text-label">{shoeTitle}</p>
          <SettingChip setting={setting} />
        </section>

        <section aria-labelledby="wa" className="flex flex-col gap-3 rounded-xl bg-accent p-4">
          <h3 id="wa" className="text-h3">
            Wissen, wann {name ? `${name}s` : 'die'} Füße wachsen
          </h3>
          <ConsentForm name={name} token={token} />
        </section>

        <section aria-labelledby="konto" className="flex flex-col gap-3 border-t border-border pt-6">
          <h3 id="konto" className="text-h3">
            Dein Konto
          </h3>
          <p className="text-body-small text-muted-foreground">Wir schicken dir einen Code per E-Mail, damit du dein Profil jederzeit öffnen kannst.</p>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/sign-in">Jetzt anmelden</Link>
          </Button>
        </section>
      </main>
    </>
  )
}
