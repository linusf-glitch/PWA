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
- 2026-10-08: backlog item 5, part A (app frame, PR open): kid switcher (global, deep link `?kid=<id>`), Konto link, back arrow + title on every non-Home screen, desktop left sidebar from the same route list, placeholder pages for Wachstum, Schuhe, Scan, Konto (sign-out moved there). Sample children only. 
- 2026-10-08: backlog item 5, part B (Home states): one dominant action per child (no shoes, fit check "feels tight", rescan due, season nudge, normal), a line for each other child that needs something, child overview (shoe with size + setting, growth, next fit check), empty Home for parents with no child yet. Review on a preview link with `?demo=fitcheck|season|rescan|onekid|empty`. Not built yet: Gift & invite (item 12), Buy without scanning (item 11), Add another child (item 13), desktop two-column Home.
- 2026-10-08: PR #9 (app frame) and PR #10 (Home states) merged. Sign-in screens restyled with the design tokens and translated to German (Anmelden, Code eingeben); new FieldError for field errors (PR open).

## Next

1. Paste Step 1 into Claude Design, review the new Home, approve. Then Step 2.
2. Update the flow doc (see docs/product-spec.md, "Pending updates").
3. Design system done in Claude Design ("Sizeless App"). Next: high-fidelity versions of about 6 key screens.
4. Footprint questions (desktop QR, measurement ID reuse, extra lasts).
5. Meta business verification + WhatsApp number; Supabase (EU) and Vercel accounts.
6. Reply to the flow doc comment on fit-check timing (delivery vs order date).
7. Decide the skip-scan window (8 weeks is a placeholder).
8. Five-parent test.
9. Backlog item 5 done once the sign-in restyle PR is merged. Note: the Claude Design system is now "version 2" (cream background, pill buttons, apricot/lilac/sage tints); the app still uses the version 1 tokens. Updating them needs Linus's OK.
10. Supabase setup for sign-in (Linus): Authentication > Sessions (long session), email sender (custom SMTP), email template must show the 6-digit code ({{ .Token }}); create the first auth user from the Shopify order webhook (backlog item 7).
