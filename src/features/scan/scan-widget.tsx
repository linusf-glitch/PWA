import { useEffect, useState } from 'react'

import { ScanLine } from 'lucide-react'
import type { ShoeSetting } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'

import { FPT_EVENTS } from './events'

const SCAN_MS = 2500

// ponytail: stand-in for the Footprint widget until we get API/widget access. It "measures" for a
// moment, then fires the same window event the real widget documents, so the pages around it do
// not change when the real one arrives. Replace this component, keep events.ts.
export function ScanWidget({ sample }: { sample: { size: number; setting: ShoeSetting } }) {
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    if (!scanning) return
    const timer = setTimeout(() => {
      setScanning(false)
      window.dispatchEvent(
        new CustomEvent(FPT_EVENTS.addToCart, {
          detail: { measurement_id: 'test-measurement', article_number: 'SZ-CLASSIC', ...sample },
        }),
      )
    }, SCAN_MS)
    return () => clearTimeout(timer)
  }, [scanning, sample])

  if (!scanning) {
    return (
      <Button size="lg" className="w-full" onClick={() => setScanning(true)}>
        Scan starten
      </Button>
    )
  }
  return (
    <div role="group" aria-label="Test-Scan" className="flex flex-col items-center gap-3 rounded-lg border-[1.5px] border-dashed border-border-strong bg-card p-4 text-center">
      <span aria-hidden="true" className="flex size-15 items-center justify-center rounded-[20px] bg-muted">
        <ScanLine className="size-7" />
      </span>
      <p role="status" className="text-body">
        Wir messen die Füße …
      </p>
      <p className="text-caption text-muted-foreground">
        Platzhalter für den Footprint-Scan. Hier läuft später die Kamera.
      </p>
      <Button variant="outline" onClick={() => { setScanning(false); window.dispatchEvent(new CustomEvent(FPT_EVENTS.cancel)) }}>
        Abbrechen
      </Button>
    </div>
  )
}
