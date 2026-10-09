import { cn } from '@/lib/utils'

export type ShoeSetting = 'turquoise' | 'yellow' | 'red'

// The shoe's adjustment setting, NOT its colourway (design system 2.2, SettingChip). Three joined
// steps like a podium, smallest to largest: the active one tall and in full colour, the other two low
// and washed out, then its word. Colour is never alone: the word and the step height say which one.
// This is the only component allowed to use the setting-* colours (setting-colours.test.ts).
const SETTING_LABEL: Record<ShoeSetting, string> = { turquoise: 'Klein', yellow: 'Mittel', red: 'Groß' }
const ORDER: ShoeSetting[] = ['turquoise', 'yellow', 'red']
const FILL: Record<ShoeSetting, string> = {
  turquoise: 'bg-setting-turquoise',
  yellow: 'bg-setting-yellow',
  red: 'bg-setting-red',
}
const STEP = {
  sm: { step: 'w-[15px] h-2.5 rounded-t-[5px] rounded-b-[2px]', on: 'h-[18px]', gap: 'gap-2 text-caption' },
  md: { step: 'w-8 h-5 rounded-t-[9px] rounded-b-[3px]', on: 'h-9', gap: 'gap-3 text-body' },
  lg: { step: 'w-9 h-6 rounded-t-[11px] rounded-b-[3px]', on: 'h-11', gap: 'flex-col items-start gap-2.5 text-label' },
}

type SettingChipProps = {
  setting: ShoeSetting
  /** sm: lists. md: default. lg: scan result, word below the steps. */
  size?: 'sm' | 'md' | 'lg'
  /** e.g. "Einstellung" in front of the word. */
  prefix?: string
  /** The active step grows up once. */
  animate?: boolean
  className?: string
}

export function SettingChip({ setting, size = 'md', prefix, animate, className }: SettingChipProps) {
  const n = ORDER.indexOf(setting) + 1
  const s = STEP[size]
  return (
    <span
      data-slot="setting-chip"
      data-setting={setting}
      className={cn('inline-flex items-center font-semibold whitespace-nowrap text-ink', s.gap, className)}
    >
      <span aria-hidden="true" className={cn('inline-flex items-end', size === 'lg' ? 'gap-[3px]' : 'gap-0.5')}>
        {ORDER.map((k) => (
          <span
            key={k}
            data-step={k}
            data-on={k === setting || undefined}
            className={cn(
              'block origin-bottom',
              s.step,
              FILL[k],
              k === setting
                ? cn(s.on, 'bg-[linear-gradient(180deg,rgb(255_255_255/0.4),transparent_55%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.55),inset_0_-2px_3px_rgb(0_0_0/0.1),0_0_0_1px_rgb(43_34_32/0.12)]', animate && 'sz-rise')
                : 'opacity-40 saturate-[0.5]',
            )}
          />
        ))}
      </span>
      <span>
        <span className="sr-only">Einstellung </span>
        {prefix ? `${prefix} ${SETTING_LABEL[setting]}` : SETTING_LABEL[setting]}
        <span className="sr-only">, Stufe {n} von 3</span>
      </span>
    </span>
  )
}
