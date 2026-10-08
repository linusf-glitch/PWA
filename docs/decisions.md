# Decisions log

Do not reopen a decision without a reason. Add new decisions at the top with the date.
Entries below were recorded from the handoff on 2026-10-08; most were made in earlier sessions.

## 2026-10-08

- **Sign-in is Supabase email codes (approved by Linus).** Shopify Customer Account API sign-in is not used: the database privacy rules are built on Supabase accounts, and two systems would need syncing. Shopify stays checkout and orders. Sign-in never creates accounts (`shouldCreateUser: false`); accounts come from the first order. Unknown emails get the same answer as known ones. Wrong and expired codes share one message because Supabase returns the same error for both. Long session = Supabase refresh token kept in the browser.
- **vercel.json pins the framework to Vite.** Adding react-router made Vercel auto-detect the React Router preset (output folder `build`) and the deploy failed. The file also rewrites every path to index.html so deep links such as /sign-in/code work on a hard reload.
- **Browser env vars are public only.** `VITE_SUPABASE_URL` and the anon key, validated with Zod. The service_role key never goes in a `VITE_` variable.
- **WhatsApp consent (GDPR / §7 UWG).** One opt-in on S10 covers fit checks and rescan reminders; it is required because German law treats them as advertising, not pure service. Seasonal tips and offers are a second, optional box. Both boxes are unticked by default. The parent confirms by sending the first WhatsApp message from their own phone (click-to-WhatsApp with a pre-filled code), which counts as double opt-in. Consent is given once and lasts until withdrawn; ask again before marketing if a parent has had no message for over a year. Every consent and withdrawal is logged (text version, time, source). STOP, the template stop button and Account > WhatsApp withdraw immediately. Messages carry the child's first name and a link only, no sizes or scan data. Lawyer to confirm the texts before launch. Background: /mnt/project-files/outputs/whatsapp-gdpr-check.md (project files).
- **Tooling for the skeleton.** npm (not pnpm/yarn), Node 22. Linting with oxlint, the current Vite template default, instead of ESLint. Unit tests with Vitest + Testing Library. Tailwind v4 via its Vite plugin (no tailwind.config file). shadcn/ui "new-york" style, neutral colours until the design tokens land (backlog item 3).
- **Service worker caches the app shell only.** Never API responses (Supabase, Shopify), so no child data sits in the browser cache.
- **Schema v1 shape.** `profiles` is the "users" table, linked to Supabase `auth.users`. Children belong to parents through `child_guardians` (many-to-many), so co-parent access needs no later migration. Parents get read access plus a few narrow updates; every other write is server-only (service role). Parents cannot delete rows directly; deletion will be a server function. Migrations are plain SQL files in `supabase/migrations/`, tested against a local Postgres in CI.
- **Repo starts with docs only.** No app code until the starter docs are reviewed.

## Recorded 2026-10-08 (from the handoff)

| Decision | Detail |
|---|---|
| PWA, not native Expo/React Native | Acquisition flow runs from links; Expo is native-first. Wrap with Capacitor/PWABuilder later only if needed. |
| Home structure = Option B | No bottom tab bar on mobile. Home is the hub. Labelled cards ("See shoe history", "See growth chart") and a labelled avatar ("Account"). Back arrow on every non-Home screen (iOS standalone has no browser back). Desktop keeps a left sidebar built from the same route list. Fallback: if 2+ of 5 test parents stall finding history or Account, switch to 3 items (Home, Records, Account). Decided by council. |
| Home = state machine | Exactly one dominant action per state: normal (Rescan), fit check pending, season nudge, rescan due, first-time/empty. Cross-child lines for several children. |
| One global kid switcher | In the Home header (sidebar top on desktop). Selected child carries across Growth, Shoes, Scan. Deep links set the selected child. |
| Deep links | Every WhatsApp/magic link opens Home with the right child selected, then the dominant action. Never a deep screen without a back path. |
| WhatsApp opt-in at S10 (after purchase) | Not on the Result screen. Click-to-WhatsApp opt-in, email fallback. Consent rules: see "WhatsApp consent" (2026-10-08) above. |
| Share / gift / referral only after a rescan | Disabled in Account before the first rescan ("Available after your first rescan"). |
| Auth: lean, passwordless | Account created automatically from the first Shopify order. New device = 6-digit email code. Long session on the same device. No passwords. No Apple/Google in the MVP. Check Shopify Customer Account API first; fallback Supabase Auth email OTP. |
| Own scan entry screen | "Scan intro" (child name + age, what you need, ONE "Start scan" button = the Footprint widget button). Footprint owns instructions, checklist, camera. One mode only (a parent holds the phone). |
| Desktop QR is ours | Desktop shows OUR QR to our PWA at Scan intro with the session ID; result syncs back. Footprint's QR is the fallback only if theirs can't be disabled. |
| Footprint runs inside the PWA | Confirmed, also on iPhone standalone. |
| Skip-scan for returning parents | "Buy next size without scanning": last size + 1, size picker, last setting as a hint, link "Not sure? Rescan". Last scan under ~8 weeks = equal weight with Rescan; older = "Rescan recommended". No share/gift after a skip-scan purchase. |
| Hosting/backend stack | Vite + React + TypeScript, Tailwind, shadcn/ui, vite-plugin-pwa. Vercel on `app.sizeless-shoe.com`. Supabase (EU, Frankfurt). Shopify Storefront API + webhooks. WhatsApp Business API via Twilio or 360dialog. |
| Not used | Cursor, Convex (Supabase preferred: standard Postgres, EU, built-in OTP). |
| Subscription out of MVP | Removed. Share card, gift link, referral stay in. |
| Setting colour != colourway | Green/yellow/red is the shoe's adjustment setting, never the shoe colour. |
