// Shop colourway to sticker colour. Separate from shoe-sticker.tsx so that file only exports components.
export type ShoeColour = 'green' | 'blue' | 'purple'

/** Shop colourway (or product title) to sticker colour: Galaxy = Lila, Reef = Blau, Sprout = Grün (Linus, 2026-10-09). Unknown: Grün. */
export function shoeColourFor(name?: string): ShoeColour {
  if (/galaxy/i.test(name ?? '')) return 'purple'
  if (/reef/i.test(name ?? '')) return 'blue'
  return 'green'
}
