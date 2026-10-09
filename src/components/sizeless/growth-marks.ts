// Each child in the comparison chart gets a marker shape and a line style, never a colour.
const MARKERS = ['circle', 'square', 'triangle', 'diamond', 'ring'] as const
const DASHES = [undefined, '7 5', '2 5', '10 4 2 4', '4 4'] as const
export type Marker = (typeof MARKERS)[number]

export function markerFor(i: number): Marker {
  return MARKERS[i % MARKERS.length]
}
export function dashFor(i: number) {
  return DASHES[i % DASHES.length]
}
