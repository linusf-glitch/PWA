# Decisions log

Do not reopen a decision without a reason. Add new decisions at the top with the date.
Entries below were recorded from the handoff on 2026-10-08; most were made in earlier sessions.

## 2026-10-08

- **Repo starts with docs only.** No app code until the starter docs are reviewed.

## Recorded 2026-10-08 (from the handoff)

| Decision | Detail |
|---|---|
| PWA, not native Expo/React Native | Acquisition flow runs from links; Expo is native-first. Wrap with Capacitor/PWABuilder later only if needed. |
| Home structure = Option B | No bottom tab bar on mobile. Home is the hub. Labelled cards ("See shoe history", "See growth chart") and a labelled avatar ("Account"). Back arrow on every non-Home screen (iOS standalone has no browser back). Desktop keeps a left sidebar built from the same route list. Fallback: if 2+ of 5 test parents stall finding history or Account, switch to 3 items (Home, Records, Account). Decided by council. |
| Home = state machine | Exactly one dominant action per state: normal (Rescan), fit check pending, season nudge, rescan due, first-time/empty. Cross-child lines for several children. |
| One global kid switcher | In the Home header (sidebar top on desktop). Selected child carries across Growth, Shoes, Scan. Deep links set the selected child. |
| Deep links | Every WhatsApp/magic link opens Home with the right child selected, then the dominant action. Never a deep screen without a back path. |
| WhatsApp opt-in at S10 (after purchase) | Not on the Result screen. Click-to-WhatsApp opt-in, consent text for marketing messages, email fallback. |
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
