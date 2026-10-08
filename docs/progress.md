# Progress

Update at the end of every session.

## Done

- Flow doc written and checked (needs updates, see docs/product-spec.md).
- Wireframe canvas (about 70 boards), reviewed, not yet modified.
- Council decision on Home structure (option B).
- Claude Design prompts for Step 1 and Step 2 written (docs/handoff.md, Appendix A).
- Subdomain app.sizeless-shoe.com created (2026-10-08), not yet pointed at Vercel.
- 2026-10-08: repo starter docs added (PR #1).
- 2026-10-08: backlog item 1, app skeleton: Vite + React + TS strict, Tailwind v4, shadcn/ui setup with Button, PWA manifest + service worker, Vitest, oxlint, GitHub Actions CI. Placeholder Home and placeholder icons. Vercel preview deploys come from Linus connecting the repo in Vercel (no config in the repo).
- 2026-10-08: backlog item 2, schema v1 (SQL migration in supabase/migrations/), RLS on every table, 37 database checks incl. parent-isolation tests, CI job. Not applied to any real Supabase project: Linus creates the project (Frankfurt) and we apply it later.
- 2026-10-08: Linus confirmed the Supabase project is in Frankfurt and ran schema v1 in it (not verified by Claude).
- 2026-10-08: backlog item 4, email-code sign-in (PR open): Sign in, Code entry, wrong/expired code, resend with 60s wait, long session, route guard, Playwright e2e. Needs Linus to set the session length and an email sender in Supabase and add the public URL + anon key in Vercel before it works for real.
- 2026-10-08: WhatsApp GDPR check done (not legal advice). Consent rules recorded in decisions.md. A lawyer must confirm the S10 texts and privacy policy before launch.
- 2026-10-08: backlog item 3, design tokens + base components: Sizeless colours, Poppins (bundled), type scale, radius, shadows in src/index.css; Button restyled; SettingChip, SizeBadge, NavCard; /styleguide.html. Source: "Sizeless App" design system in Claude Design. Remaining components come with the screens that use them (see docs/design-system.md).
- 2026-10-08: backlog item 5, part A (app frame, PR open): kid switcher (global, deep link `?kid=<id>`), Konto link, back arrow + title on every non-Home screen, desktop left sidebar from the same route list, placeholder pages for Wachstum, Schuhe, Scan, Konto (sign-out moved there). Sample children only. Part B (Home states) next, then the sign-in restyle (Linus said yes to both).
- 2026-10-08: look and feel step 1 of 3 (draft PR): warm design system v2 tokens, pill Button, Input, tinted NavCard, sticker SizeBadge, styleguide. Step 2 (drawings, motion) and step 3 (apply to screens, after the Home states PR merges) follow.
- 2026-10-08: backlog item 5, part B (Home states): one dominant action per child (no shoes, fit check "feels tight", rescan due, season nudge, normal), a line for each other child that needs something, child overview (shoe with size + setting, growth, next fit check), empty Home for parents with no child yet. Review on a preview link with `?demo=fitcheck|season|rescan|onekid|empty`. Not built yet: Gift & invite (item 12), Buy without scanning (item 11), Add another child (item 13), desktop two-column Home.
- 2026-10-08: look and feel step 2 of 3 (PR open): hand-drawn illustration components (8 drawings, doodles, squiggle headline, confetti), motion keyframes with reduced-motion fallbacks, styleguide section. Not yet used on real screens (step 3).
- 2026-10-08: look and feel step 3 of 3 (PR open): drawings on Home (hero drawing per state, tinted overview cards with sticker tiles), sign-in and code screens, empty and placeholder pages; logo text no longer teal. Sign-in copy is still English (translation to German not yet decided).
- 2026-10-08: docs catch-up: decisions.md and CLAUDE.md now cover the playful look, sticker drawings, #9ECACD, Footprint placeholder, phases, private repo.
- 2026-10-08: sign-in and code screens translated to German (PR open); tests updated.
- 2026-10-08: phase 3 start, backlog item 6 part A (PR open): Scan intro screen (child name + age, what you need, one "Scan starten" button), Footprint stand-in widget that fires the documented fpt-* window events (validated with Zod), plain size result. Real widget and result screen S05/S06 follow.
- 2026-10-08: backlog item 6 part B (PR open): clickable scan path: Home > Scan intro > stand-in scan (2.5 s "Wir messen", Abbrechen) > Result S05 (size, setting chip + one-line explanation, "Größe n kaufen", "Noch einmal scannen", confetti) > Setting explanation S06 > Kasse placeholder. The stand-in sends size = current shoe + 1 and setting Gelb; the setting is NOT in Footprint's documented payload, so where it comes from is an open question for Footprint.
- 2026-10-08: backlog item 7 part A (PR open): Shopify cart and checkout. S08 "Farbe wählen" (Galaxy, Reef, Sprout, sold out ones greyed), S09 hand-off "Weiter zur sicheren Kasse" creates a Storefront API cart (size, setting, measurement id, child id as cart attributes) and redirects to Shopify's checkout. Demo mode (no keys) shows sample colourways and a "Kasse noch nicht verbunden" note. Needs VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN in Vercel. Not built yet: "Tell me when it's back" for sold out, return screen after payment, order webhook, S10.
- 2026-10-08: docs/flow.md added (PR open): the whole wireframe user flow in the repo, with Linus's answers on back arrows, Home order, scan age limits, WhatsApp timing and the language toggle. Screens already built that send back to Home too early (S06, S08, S09 hand-off) need a small follow-up. Cross-phase docs, not a phase of its own.

## Phases
1 Foundation: done. 2 Look and feel: done with this PR. 3 Scan and buy (backlog 6-8): in progress (Scan intro, result screen, colourway and checkout hand-off done; order webhook, return screen, S10, desktop QR next). 4 Growth and history (9). 5 WhatsApp and reorder (10-12). 6 Account and launch (13-14, real sign-in setup, domain app.sizeless-shoe.com, Vercel Pro, lawyer check, security review, beta).

## Next

1. Phase 3: Scan intro + Footprint placeholder (backlog 6).
2. Update the flow doc (see docs/product-spec.md, "Pending updates").
3. Design system done in Claude Design ("Sizeless App"). Next: high-fidelity versions of about 6 key screens.
4. Footprint questions (desktop QR, measurement ID reuse, extra lasts).
5. Meta business verification + WhatsApp number; Supabase (EU) and Vercel accounts.
6. Reply to the flow doc comment on fit-check timing (delivery vs order date).
7. Decide the skip-scan window (8 weeks is a placeholder).
8. Five-parent test.
9. Restyle the sign-in screens (and their text input) with the new design tokens. Then backlog item 5 (shell).
10. Supabase setup for sign-in (Linus): Authentication > Sessions (long session), email sender (custom SMTP), email template must show the 6-digit code ({{ .Token }}); create the first auth user from the Shopify order webhook (backlog item 7).
