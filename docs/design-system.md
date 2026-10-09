# Design system

Source of truth: the **"Sizeless App"** design system in Claude Design (type "Design System"): https://claude.ai/artifact/TYkE9eL7UZ8f8iZsvsQhVZ
It holds the tokens (`project/tokens.json`), the brand and copy rules (`project/README.md`), 23 component previews and the logos. This repo mirrors its tokens; if a value changes there, change `src/index.css` too.

Brand values came from the live Shopify theme ("New Sizeless 1.2"): Poppins, teal #087E8B, light teal #53B1B2, deep green #283E36, ink #0A0F0E, greys #F1F3F3 / #E6E6E6 / #D5DCDA.

Check everything on a phone: `/styleguide.html` on any Vercel preview (or `npm run dev`, then open `/styleguide.html`).

## Tokens (src/index.css)

- **Colours** use shadcn names, so `bg-primary`, `text-muted-foreground` etc. work everywhere. Extra: `primary-pressed`, `success` / `warning` / `info` / `destructive` with `-soft` backgrounds, `border-strong`, `scrim`, `chart-1..5`, `brand-*`.
- **Look (design system v2, 2026-10-08; 2.2 on 2026-10-09):** warm and playful, because the brand is for kids. White page and cards (2.2; was cream #FFF7EE), warm ink text (#2B2220), apricot/lilac/sage accents (strong + soft tint) for card tints and later illustrations. Teal is an accent only: the single primary button, links and the focus ring. Pill buttons, 24px card radius, sticker-style size badge.
- **Primary = dark teal #087E8B** with white text (4.8:1). Light teal is never behind white text (2.5:1, fails); use it for lines, progress, tints.
- **Setting colours** `setting-turquoise|yellow|red` (+ `-foreground`, `-soft`, `-text`): the shoe's adjustment setting (Klein = turquoise, smallest; Mittel = yellow; Groß = red, largest; the UI says Klein / Mittel / Groß since 2026-10-09), never the colourway, never a status. Shades follow the setting scale Linus supplied (pastel yellow #F4D963 and red #E57289 sampled from it; turquoise changed to the design system's grey-blue #9ECACD on 2026-10-08, chosen by Linus). Only `SettingChip` may use them; a unit test fails if any other file does.
- **Type:** Poppins 400/500/600, bundled with the app (`@fontsource/poppins`, latin subset), not loaded from Google (GDPR). Utilities: `text-display` 32/38, `text-h1` 28/34, `text-h2` 22/28, `text-h3` 18/24, `text-body` 16/24, `text-body-small` 14/20, `text-label` 14/20 medium, `text-button` 16/24 semibold, `text-caption` 12/16. Body never below 16px. Sentence case, never uppercase.
- **Spacing:** Tailwind's default 4px grid (`p-4` = 16px screen padding). Touch targets at least 44px (`min-h-11`); primary button 56px (`min-h-14`).
- **Radius:** `rounded-md` 10px (buttons, inputs, badges, alerts), `rounded-lg` / `rounded-xl` 16px (cards, sheets), `rounded-full` (chips, avatars, kid switcher).
- **Shadows:** `shadow-card`, `shadow-lift`, `shadow-sheet`, `shadow-button` (warm, offset). Focus: 2px teal ring with a 2px gap in the page colour.
- **Icons, stickers and motion (design system 2.2, 2026-10-09):** no hand-drawn drawings any more. Icons are lucide-react in `ink`; the real shoe is `ShoeSticker` (`src/components/illustration/shoe-sticker.tsx`, colours green/blue/purple; `shoeColourFor()` maps the shop colourways Galaxy = purple, Reef = blue, Sprout = green). `Headline` (squiggle) and `Confetti` stay. Logo: `public/sizeless-logo.png` (from the design system's Logos group) in the Home header and sidebar. Removed (version 2): `Illustration` in sticker style (white die-cut border, flat fills, ink line; shoe, footprints, measure, hand, sprout, ruler, stars, network, sock, tape, balloon), `Doodle`, `Headline` (squiggle), `Confetti`, `SvgDefs` (mounted once in `src/main.tsx`). Drawings also use the brand yellow #FFD23F (Linus asked for it, 2026-10-08), only inside drawings, never on UI or chips; it sits close to the Gelb setting yellow, so keep the words and shapes on SettingChip. Drawings are decoration only (`aria-hidden`), never in the setting colours; one boiling hero drawing per screen at most; draw-in plays once. Motion CSS (draw, pop, bounce-in, burst, shimmer) is at the end of `src/index.css`; under `prefers-reduced-motion` they become a short fade or stop. Examples on `/styleguide.html`.
- **Next:** step 3 applies the look to Home, sign-in and the other screens.

## Components

Built (backlog item 3):
- `Button` (`src/components/ui/button.tsx`): `default` = teal gel primary, `outline` = white gel secondary, `link`, `ghost`, `destructive`. Home's one dominant action: `size="lg" className="w-full"`. Disabled turns muted grey. Floating chrome (header bars, back button, kid switcher, sheet, sidebar) uses `.sz-glass-bar`, `.sz-glass` or `.sz-glass-strong` from src/index.css; content stays solid.
- `SettingChip` (`src/components/sizeless/setting-chip.tsx`): three joined steps like a podium, the active one tall and in full colour, then the word Klein / Mittel / Groß. `size="sm|md|lg"`, `prefix`, `animate` (the active step grows once).
- `BentoTile` (`src/components/sizeless/bento-tile.tsx`): one cell of the Home bento grid (`grid grid-cols-2 gap-3 grid-flow-dense`), `span="wide"`, `tone`, `icon`, `eyebrow`, `title`, `value`, `art`, `href`.
- `SizeBadge`: "EU 27".
- `NavCard`: tappable Home card with eyebrow, title, extra line and chevron; a link with `href`, otherwise a button.

Later, with the screens that need them: KidSwitcher, HomeHeader, ScreenHeader (back arrow), Sidebar, AccountButton, BottomSheet + KidList (backlog 5); TextField and CodeInput styling (after sign-in, backlog 4, is merged); Alert, Toast, EmptyState, Skeleton; GrowthChart and Sparkline (backlog 9). Their look is specified in the Claude Design file.
