import { cn } from '@/lib/utils'

export type ShoeSetting = 'turquoise' | 'yellow' | 'red'

// The shoe's adjustment setting, NOT its colourway. This is the only component allowed to use
// the setting-* colours (enforced by setting-colours.test.ts). Colour always comes with a word and
// a shape so colour-blind parents can read it: Türkis = circle, Gelb = triangle, Rot = square.
const SETTINGS: Record<ShoeSetting, { label: string; solid: string; soft: string }> = {
  turquoise: {
    label: 'Türkis',
    solid: 'bg-setting-turquoise text-setting-turquoise-foreground',
    soft: 'bg-setting-turquoise-soft text-setting-turquoise-text',
  },
  yellow: {
    label: 'Gelb',
    solid: 'bg-setting-yellow text-setting-yellow-foreground',
    soft: 'bg-setting-yellow-soft text-setting-yellow-text',
  },
  red: {
    label: 'Rot',
    solid: 'bg-setting-red text-setting-red-foreground',
    soft: 'bg-setting-red-soft text-setting-red-text',
  },
}

function SettingShape({ setting, className }: { setting: ShoeSetting; className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      data-shape={setting === 'turquoise' ? 'circle' : setting === 'yellow' ? 'triangle' : 'square'}
      className={cn('shrink-0 fill-current', className)}
    >
      {setting === 'turquoise' && <circle cx="6" cy="6" r="5" />}
      {setting === 'yellow' && <path d="M6 1 11.2 10.5H.8Z" />}
      {setting === 'red' && <rect x="1.5" y="1.5" width="9" height="9" rx="1" />}
    </svg>
  )
}

type SettingChipProps = {
  setting: ShoeSetting
  /** solid: on its own (Home, result). soft: in dense lists like shoe history. */
  tone?: 'solid' | 'soft'
  size?: 'md' | 'sm'
  className?: string
}

export function SettingChip({ setting, tone = 'solid', size = 'md', className }: SettingChipProps) {
  const { label, solid, soft } = SETTINGS[setting]
  return (
    <span
      data-slot="setting-chip"
      data-setting={setting}
      className={cn(
        'inline-flex items-center rounded-full text-label whitespace-nowrap',
        size === 'md' ? 'h-8 gap-1.5 pr-3 pl-2.5' : 'h-6 gap-1 pr-2 pl-1.5',
        tone === 'solid' ? solid : soft,
        className,
      )}
    >
      <SettingShape setting={setting} className={size === 'md' ? 'size-3' : 'size-2.5'} />
      <span className="sr-only">Einstellung </span>
      {label}
    </span>
  )
}
