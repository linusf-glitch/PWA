import { SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router'

import { PageHeader } from '@/components/shell/page-header'
import { SettingChip, type ShoeSetting } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'

const ROWS: Array<[ShoeSetting, string]> = [
  ['turquoise', 'Die kleinste Einstellung.'],
  ['yellow', 'Die mittlere Einstellung.'],
  ['red', 'Die größte Einstellung.'],
]

// S06: what the setting colour means. It is the shoe's adjustment, not the shoe's colour.
export default function SettingExplainPage() {
  const navigate = useNavigate()
  return (
    <>
      <PageHeader title="Einstellung" back="step" />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        <div className="flex items-start justify-between gap-3">
          <p className="text-body">
            Ein Sizeless-Schuh wächst mit. Du stellst ihn auf eine von drei Einstellungen: Klein, Mittel oder Groß. Die Farbe
            der Stufe hilft dir beim Wiederfinden. Sie hat nichts mit der Farbe des Schuhs zu tun.
          </p>
          <span aria-hidden="true" className="flex size-15 shrink-0 items-center justify-center rounded-[20px] bg-muted">
            <SlidersHorizontal className="size-7" />
          </span>
        </div>
        <ul className="flex flex-col gap-3">
          {ROWS.map(([setting, text]) => (
            <li key={setting} className="flex items-center gap-3 rounded-lg border-[1.5px] border-border bg-card p-4">
              <SettingChip setting={setting} />
              <span className="text-body">{text}</span>
            </li>
          ))}
        </ul>
        <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
          Zurück zum Ergebnis
        </Button>
      </main>
    </>
  )
}
