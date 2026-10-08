// Original Sizeless drawings from the "Sizeless App" design system (illustration.md): clean paths on a
// 160x160 grid; the wobble filter in Illustration makes them look hand-drawn. Fill keys: a apricot,
// l lilac, s sage, n card cream, p soft apricot. Never the setting colours.
export type Fill = 'a' | 'l' | 's' | 'n' | 'p'
export type Group = {
  t?: string
  fills: Array<[Fill, string]>
  lines: string[]
  dashed?: string[]
  dots?: Array<[number, number, number]>
}

const circ = (x: number, y: number, r: number) =>
  `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`

const star = (x: number, y: number, r: number) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = (i % 2 ? r * 0.48 : r) * (1 + (((i * 37) % 7) - 3) * 0.012)
    return `${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`
  })
  return `M${pts.join(' L')} Z`
}

const UP = 'M22 109 C20 88 22 66 28 52 C31 44 40 42 46 47 C54 54 60 62 74 63 C92 64 108 69 122 80 C132 88 146 91 148 104 L149 109 Z'
const UPL = 'M22 108 C20 88 22 66 28 52 C31 44 40 42 46 47 C54 54 61 62 74 63 C92 64 108 69 123 80 C133 88 146 92 148 104 L149 109'
const SOLE = 'M16 111 C60 112 110 108 150 109 C153 121 146 128 136 128 L30 129 C20 129 14 122 16 111 Z'
const S1 = 'M58 61 C72 63 86 71 99 82 L93 92 C82 83 70 78 53 74 Z'
const S2 = 'M112 77 C120 79 128 85 133 93 L126 99 C122 93 116 89 108 86 Z'

const shoeG = (upper: Fill, strap: Fill, t?: string): Group => ({
  t,
  fills: [[upper, UP], ['n', SOLE], [strap, S1], [strap, S2]],
  lines: [UPL, SOLE, S1, S2, 'M137 97 C141 100 143 104 144 108', 'M27 120 C60 121 100 119 140 118'],
})

const SOLEF = 'M45 80 C37 82 34 94 36 108 C38 121 44 133 54 133 C63 133 67 122 66 110 C65 96 61 83 53 80 C50 79 47 79 45 80 Z'
const TOES = [circ(58, 65, 6.2), circ(47, 62, 4.8), circ(38, 67, 4.2), circ(31, 75, 3.6), circ(28, 85, 3.1)]

const footG = (color: Fill, t: string): Group => ({
  t,
  fills: [[color, SOLEF], ...TOES.map((d): [Fill, string] => [color, d])],
  lines: [SOLEF, ...TOES],
})

const HAND = 'M30 152 C26 134 30 120 40 112 C46 108 52 106 58 106 L116 106 C126 108 130 118 128 128 C127 138 126 146 126 152'
const F1 = 'M62 108 C58 98 60 90 66 89 C72 88 75 95 76 106'
const F2 = 'M78 106 C77 94 79 86 85 85 C91 85 93 93 93 106'
const F3 = 'M95 106 C95 95 98 88 104 88 C110 88 111 96 110 108'
const THUMB = 'M40 114 C30 112 24 104 28 96 C31 91 38 91 42 98 C44 102 46 106 50 108'

export const DRAWINGS = {
  shoe: [shoeG('a', 'l')],
  footprints: [footG('a', 'rotate(-8 50 100)'), footG('l', 'translate(160 -10) scale(-1 1) rotate(-6 50 100)')],
  measure: [
    {
      t: 'translate(-6 0)',
      fills: [['a', SOLEF], ...TOES.map((d): [Fill, string] => ['a', d]), ['l', star(132, 40, 10)]],
      lines: [SOLEF, ...TOES, 'M104 57 C105 82 103 110 104 133', 'M96 57 H112', 'M96 133 H112', 'M100 64 L104 56 L108 64', 'M100 126 L104 134 L108 126', star(132, 40, 10)],
      dashed: ['M44 56 H98', 'M60 134 H98'],
      dots: [[130, 96, 2.2], [140, 82, 1.8], [124, 112, 1.8]],
    },
  ],
  hand: [
    shoeG('s', 'l', 'translate(30 6) scale(.62)'),
    {
      fills: [['p', `${HAND} Z`], ['p', `${F1} Z`], ['p', `${F2} Z`], ['p', `${F3} Z`], ['p', `${THUMB} Z`]],
      lines: [HAND, F1, F2, F3, THUMB],
    },
  ],
  sprout: [
    {
      fills: [
        ['l', 'M18 141 L19 108 L65 109 L64 141 Z'],
        ['a', 'M64 141 L65 88 L108 89 L107 141 Z'],
        ['n', 'M107 141 L108 68 L149 69 L148 141 Z'],
        ['s', 'M127 50 C118 48 112 42 112 34 C120 33 127 38 127 50 Z'],
        ['s', 'M128 46 C134 40 142 38 148 40 C148 48 140 52 128 46 Z'],
      ],
      lines: [
        'M18 141 L19 108 L65 109 L64 141', 'M64 141 L65 88 L108 89 L107 141', 'M107 141 L108 68 L149 69 L148 141', 'M10 142 C50 143 110 141 154 142',
        'M128 68 C127 58 129 50 127 42', 'M127 50 C118 48 112 42 112 34 C120 33 127 38 127 50', 'M128 46 C134 40 142 38 148 40 C148 48 140 52 128 46',
      ],
      dots: [[40, 124, 2], [86, 114, 2], [128, 104, 2]],
    },
  ],
  ruler: [
    {
      fills: [['a', 'M56 16 C70 14 90 15 104 15 L105 145 C90 147 70 146 55 146 Z'], ['l', star(138, 52, 10)]],
      lines: [
        'M56 16 C70 14 90 15 104 15 L105 145 C90 147 70 146 55 146 Z',
        ...[30, 50, 70, 90, 110, 130].map((y) => `M56 ${y} C62 ${y - 1} 68 ${y} 76 ${y}`),
        ...[40, 60, 80, 100, 120].map((y) => `M56 ${y} C60 ${y} 64 ${y} 67 ${y}`),
        'M114 78 C119 78 124 78 130 78', 'M122 71 L131 78 L122 85', star(138, 52, 10),
      ],
      dots: [[120, 32, 1.8], [128, 112, 1.8], [24, 40, 2], [28, 110, 2]],
    },
  ],
  stars: [
    {
      fills: [['l', star(62, 66, 32)], ['a', star(118, 38, 15)], ['s', star(122, 108, 12)]],
      lines: [star(62, 66, 32), star(118, 38, 15), star(122, 108, 12), 'M22 134 C30 120 38 148 46 134 S62 120 70 134 S86 148 94 134', 'M18 70 V84 M11 77 H25'],
      dots: [[24, 36, 2.6], [96, 78, 2.2], [36, 100, 2], [140, 74, 2.2], [84, 22, 2]],
    },
  ],
  network: [
    {
      fills: [['a', circ(36, 118, 11)], ['l', circ(70, 66, 13)], ['s', circ(112, 98, 10)], ['n', circ(122, 40, 9)], ['n', circ(40, 40, 7)], ['a', circ(130, 130, 6)]],
      lines: [
        'M38 107 C48 92 58 80 64 76', 'M82 72 C94 78 103 86 106 92', 'M81 60 C94 54 108 48 115 43', 'M62 59 C54 52 48 46 45 44', 'M115 107 C120 114 126 120 129 124',
        circ(36, 118, 11), circ(70, 66, 13), circ(112, 98, 10), circ(122, 40, 9), circ(40, 40, 7), circ(130, 130, 6),
      ],
      dots: [[20, 80, 2], [92, 130, 2], [148, 70, 2.2], [100, 20, 2]],
    },
  ],
} satisfies Record<string, Group[]>

export type DrawingName = keyof typeof DRAWINGS
export { star }
