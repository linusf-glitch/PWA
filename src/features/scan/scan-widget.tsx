import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { FPT_EVENTS } from './events'

// ponytail: stand-in for the Footprint widget until we get API/widget access. It fires the same
// window events the real widget documents, so the scan page does not change when the real one
// arrives. Replace this component, keep events.ts.
export function ScanWidget() {
  const [open, setOpen] = useState(false)

  function fire(name: string, detail?: unknown) {
    window.dispatchEvent(new CustomEvent(name, { detail }))
    setOpen(false)
  }

  if (!open) {
    return (
      <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
        Scan starten
      </Button>
    )
  }
  return (
    <div role="group" aria-label="Test-Scan" className="flex flex-col gap-3 rounded-lg border-[1.5px] border-dashed border-border-strong bg-card p-4">
      <p className="text-body-small text-muted-foreground">
        Platzhalter für den Footprint-Scan. Hier läuft später die Kamera.
      </p>
      <Button
        onClick={() =>
          fire(FPT_EVENTS.addToCart, { measurement_id: 'test-measurement', size: 27, article_number: 'SZ-CLASSIC' })
        }
      >
        Test-Scan abschließen (Größe 27)
      </Button>
      <Button variant="outline" onClick={() => fire(FPT_EVENTS.cancel)}>
        Abbrechen
      </Button>
    </div>
  )
}
