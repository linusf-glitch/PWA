# Backlog

One GitHub issue each, worked in this order. Issues not created yet.

1. **Scaffold:** Vite + React + TS strict, Tailwind, shadcn/ui, PWA manifest + service worker, CI (lint, types, tests), Vercel preview deploys.
2. **Supabase:** project (EU), schema v1 (users, children, measurements, orders, shoes, notification preferences) + RLS policies + tests that prove isolation between parents.
3. **Design tokens** + base components from the design system.
4. **Email-code sign-in** (Sign-in, Code entry, expired/wrong code) + long session.
5. **Shell:** header with kid switcher, avatar -> Account, back arrows, desktop sidebar; Home state machine with mock data.
6. **Scan intro** + Footprint widget integration + result screen (S05, S06).
7. **Shopify** cart + checkout hand-off; order-paid webhook (HMAC verified) creates account + child; S10.
8. **Own desktop QR handoff** with session sync.
9. **Growth chart + Shoe history**; rescan flow.
10. **WhatsApp** opt-in at S10 (fit checks + separate offers box, consent log table: append-only record of every consent and withdrawal); fit-check template + signed links -> Home; scheduled job.
11. **Skip-scan** "Pick next size" flow.
12. **Season nudge**; share card, gift link, referral (after a rescan).
13. **Account:** children, notifications, data export/delete, co-parent invite.
14. **Hardening:** security review, human review, private beta with about 20 existing customers.
