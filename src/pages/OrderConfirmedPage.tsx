import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router'

import { Confetti, Headline, Illustration } from '@/components/illustration/illustration'
import { PageHeader } from '@/components/shell/page-header'
import { SettingChip } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'
import { useKids } from '@/features/kids/useKids'
import { orderSchema } from '@/features/shop/order'

// S10 Order confirmed: the profile is saved, how to sign in, and the WhatsApp opt-in (only here,
// after purchase). No back arrow: the order is done.
export default function OrderConfirmedPage() {
  const { selected } = useKids()
  const parsed = orderSchema.safeParse(useLocation().state)
  const [note, setNote] = useState(false)
  if (!parsed.success) return <Navigate to="/" replace />
  const { size, setting = 'yellow', colourway } = parsed.data
  const name = selected?.name

  return (
    <>
      <PageHeader title="Bestellung bestätigt" back="none" />
      <main className="relative mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        <Confetti />
        <section className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Headline as="h2" size="h2" animate>
              Bestellung bestätigt
            </Headline>
            <p className="text-body">
              {name ? `${name}s` : 'Das'} Profil ist gespeichert. Wenn du dich anmelden willst, schicken wir dir einen Code per E-Mail.
            </p>
          </div>
          <Illustration name="shoe" size={96} draw className="shrink-0" />
        </section>

        <section aria-label="Gespeichert" className="flex flex-col gap-2 rounded-xl bg-card p-4">
          <p className="text-caption text-muted-foreground">{name ? `Gespeichert für ${name}` : 'Gespeichert'}</p>
          <p className="text-label">
            Classic Schuh, {colourway}, EU {size}
          </p>
          <SettingChip setting={setting} />
        </section>

        <section aria-labelledby="wa" className="flex flex-col gap-3 rounded-xl bg-accent p-4">
          <h3 id="wa" className="text-h3">
            Wissen, wann {name ? `${name}s` : 'die'} Füße wachsen
          </h3>
          <p className="text-body-small">
            Etwa 6 Wochen nach der Lieferung fragen wir per WhatsApp, ob der Schuh noch passt. Du antwortest mit einem Tipp.
          </p>
          <Button onClick={() => setNote(true)}>Per WhatsApp erinnern</Button>
          <label className="flex min-h-11 items-start gap-2 text-body-small">
            <input type="checkbox" className="mt-1 size-5" />
            Ich möchte auch saisonale Tipps und Angebote per WhatsApp (freiwillig).
          </label>
          <Button variant="link" onClick={() => setNote(true)}>
            Lieber per E-Mail erinnern
          </Button>
          {note && (
            <p role="status" className="text-body-small">
              Die WhatsApp- und E-Mail-Erinnerung wird in einem späteren Schritt verbunden.
            </p>
          )}
        </section>

        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link to="/sign-in">Jetzt anmelden</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/">Zu Home</Link>
          </Button>
        </div>
      </main>
    </>
  )
}
