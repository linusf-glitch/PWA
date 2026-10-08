# Design system

Source of truth: the **"Sizeless App"** design system in Claude Design (type "Design System"): https://claude.ai/artifact/TYkE9eL7UZ8f8iZsvsQhVZ
It holds the tokens (`project/tokens.json`), the brand and copy rules (`project/README.md`), 23 component previews and the logos. This repo mirrors its tokens; if a value changes there, change `src/index.css` too.

Brand values came from the live Shopify theme ("New Sizeless 1.2"): Poppins, teal #087E8B, light teal #53B1B2, deep green #283E36, ink #0A0F0E, greys #F1F3F3 / #E6E6E6 / #D5DCDA.

Check everything on a phone: `/styleguide.html` on any Vercel preview (or `npm run dev`, then open `/styleguide.html`).

## Tokens (src/index.css)

- **Colours** use shadcn names, so `bg-primary`, `text-muted-foreground` etc. work everywhere. Extra: `primary-pressed`, `success` / `warning` / `info` / `destructive` with `-soft` backgrounds, `border-strong`, `scrim`, `chart-1..5`, `brand-*`.
- **Primary = dark teal #087E8B** with white text (4.8:1). Light teal is never behind white text (2.5:1, fails); use it for lines, progress, tints.
- **Setting colours** `setting-turquoise|yellow|red` (+ `-foreground`, `-soft`, `-text`): the shoe's adjustment setting (Türkis = smallest, Gelb, Rot = largest), never the colourway, never a status. Shades follow the setting scale Linus supplied (pastel yellow #F4D963 and red #E57289 sampled from it; turquoise #62D2D0 chosen to replace its blue). Only `SettingChip` may use them; a unit test fails if any other file does.
- **Type:** Poppins 400/500/600, bundled with the app (`@fontsource/poppins`, latin subset), not loaded from Google (GDPR). Utilities: `text-display` 32/38, `text-h1` 28/34, `text-h2` 22/28, `text-h3` 18/24, `text-body` 16/24, `text-body-small` 14/20, `text-label` 14/20 medium, `text-button` 16/24 semibold, `text-caption` 12/16. Body never below 16px. Sentence case, never uppercase.
- **Spacing:** Tailwind's default 4px grid (`p-4` = 16px screen padding). Touch targets at least 44px (`min-h-11`); primary button 56px (`min-h-14`).
- **Radius:** `rounded-md` 10px (buttons, inputs, badges, alerts), `rounded-lg` / `rounded-xl` 16px (cards, sheets), `rounded-full` (chips, avatars, kid switcher).
- **Shadows:** `shadow-card`, `shadow-sheet`. Focus: 2px teal ring with a 2px white gap.

## Components

Built (backlog item 3):
- `Button` (`src/components/ui/button.tsx`): `default` = teal primary, `outline` = secondary, `link`, `ghost`, `destructive`. Home's one dominant action: `size="lg" className="w-full"`. Disabled turns muted grey.
- `SettingChip` (`src/components/sizeless/setting-chip.tsx`): Türkis ● / Gelb ▲ / Rot ■, `tone="solid|soft"`, `size="md|sm"`.
- `SizeBadge`: "EU 27".
- `NavCard`: tappable Home card with eyebrow, title, extra line and chevron; a link with `href`, otherwise a button.

Later, with the screens that need them: KidSwitcher, HomeHeader, ScreenHeader (back arrow), Sidebar, AccountButton, BottomSheet + KidList (backlog 5); TextField and CodeInput styling (after sign-in, backlog 4, is merged); Alert, Toast, EmptyState, Skeleton; GrowthChart and Sparkline (backlog 9). Their look is specified in the Claude Design file.
