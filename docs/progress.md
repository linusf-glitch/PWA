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
- 2026-10-08: WhatsApp GDPR check done (not legal advice). Consent rules recorded in decisions.md. A lawyer must confirm the S10 texts and privacy policy before launch.

## Next

1. Paste Step 1 into Claude Design, review the new Home, approve. Then Step 2.
2. Update the flow doc (see docs/product-spec.md, "Pending updates").
3. Design system in Claude Design, then high-fidelity versions of about 6 key screens.
4. Footprint questions (desktop QR, measurement ID reuse, extra lasts).
5. Meta business verification + WhatsApp number; Supabase (EU) and Vercel accounts.
6. Reply to the flow doc comment on fit-check timing (delivery vs order date).
7. Decide the skip-scan window (8 weeks is a placeholder).
8. Five-parent test.
9. Backlog item 3: design tokens + base components (docs/backlog.md). Needs the design system first.
