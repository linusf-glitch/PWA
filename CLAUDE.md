# Sizeless PWA

Mobile-first PWA for Sizeless (adjustable kids' shoes). Foot scan by Footprint Technologies -> size + setting colour -> buy via Shopify -> growth chart -> WhatsApp fit checks -> rescan -> share/gift/referral.

## Read first, every session
1. docs/progress.md (what's done and next)
2. docs/decisions.md (do not contradict)
3. The doc for the task at hand (product-spec, data-model, integrations, security)

## Stack
Vite + React + TypeScript (strict), Tailwind, shadcn/ui, vite-plugin-pwa. Supabase (EU region): Postgres, Auth (email OTP), RLS. Vercel hosting. Shopify Storefront API + webhooks. WhatsApp Business API via provider.

## Commands
(fill in once scaffolded: dev, build, lint, typecheck, test, e2e)

## Rules
- If the spec is unclear or two docs conflict, ASK. Do not guess.
- One task per session. Plan first, wait for approval, then code.
- Row-level security on every table. No secrets in client code. Verify webhook signatures. Validate all external input with Zod. No PII in logs.
- Never commit to main. Work on a branch, open a PR, keep PRs small.
- Add or update tests for every behaviour change. Core e2e path must stay green: sign-in, scan, checkout, order webhook, account created.
- No bottom tab bar on mobile. Home is a state machine with one dominant action. Global kid switcher. Back arrow on every non-Home screen.
- Setting colour (green/yellow/red) is the shoe's adjustment setting, never the colourway.
- At the end of each session: update docs/progress.md and docs/decisions.md.
- Never make changes outside the task without explicit approval.
