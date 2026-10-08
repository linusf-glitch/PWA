# Sizeless PWA: Project Handoff (as of 2026-10-08)

Paste this whole file into a new session as the first message, or commit it to the repo as `docs/handoff.md`. Section 7 contains the starter files for the repo (CLAUDE.md, docs skeleton, backlog). Section 6 lists open items.

---

## 1. Project brief

- **Company:** Sizeless (sizeless-shoe.com, Shopify). Adjustable, growing kids' shoes for ages 2 to 6. Based in Düsseldorf, Europe/Berlin timezone.
- **Owner:** Linus, co-founder (marketing/growth, fundraising, organisation). Not an engineer; builds with Claude Code.
- **Goal:** a mobile-first, desktop-compatible PWA that turns a one-time foot scan into a recurring cycle:
  scan -> size + adjustment setting colour (green/yellow/red; this is the setting of the shoe, NOT the shoe colourway) -> buy via Shopify -> growth chart -> WhatsApp fit checks and seasonal nudges -> rescan -> share card / gift link / referral.
- **Scan provider:** Footprint Technologies (Berlin) provides the foot scan (paper-based, via phone camera). Contact: Dr. Matthias Brendel. Offer: EUR 3,500 onboarding, first 6 months unlimited recommendations, one shoe last included (winter boot and house shoe need extra lasts).
- **Out of MVP:** subscription (removed). Included: share card, gift link, referral.
- **Why WhatsApp:** lower friction than a native app plus push permissions. Parents already use it. Message copy is personalised with the child's name.

## 2. Decisions made (do not reopen without a reason)

| Decision | Detail |
|---|---|
| PWA, not native Expo/React Native | Acquisition flow runs from links; Expo is native-first. Wrap with Capacitor/PWABuilder later only if needed. |
| Home structure = Option B | No bottom tab bar on mobile. Home is the hub. Labelled cards ("See shoe history", "See growth chart") and a labelled avatar ("Account"). Back arrow on every non-Home screen (iOS standalone has no browser back). Desktop keeps a left sidebar built from the same route list. Fallback: if 2+ of 5 test parents stall finding history or Account, switch to 3 items (Home, Records, Account). Decided by council. |
| Home = state machine | Exactly one dominant action per state: normal (Rescan), fit check pending, season nudge, rescan due, first-time/empty. Cross-child lines for several children. |
| One global kid switcher | In the Home header (sidebar top on desktop). Selected child carries across Growth, Shoes, Scan. Deep links set the selected child. |
| Deep links | Every WhatsApp/magic link opens Home with the right child selected, then the dominant action. Never a deep screen without a back path. |
| WhatsApp opt-in at S10 (after purchase) | Deliberate change, not on the Result screen. Click-to-WhatsApp opt-in, consent text for marketing messages, email fallback. |
| Share / gift / referral only after a rescan | Disabled in Account before the first rescan ("Available after your first rescan"). |
| Auth: lean, passwordless | Account is created automatically from the first Shopify order (checkout email). Sign-in on a new device = email one-time code (6 digits). Long session on the same device. No passwords. No Apple/Google in the MVP (email mismatch with the Shopify order email, Apple "Hide My Email"). Check Shopify Customer Account API first; fallback Supabase Auth email OTP. |
| Own scan entry screen | Our "Scan intro" (child name + age, what you need, ONE button "Start scan" = the Footprint widget button). Footprint then owns instructions, checklist, camera. One mode only (a parent holds the phone). |
| Desktop QR is ours | Desktop shows OUR QR to our PWA at Scan intro with the session ID; result syncs back. Footprint's own QR is the fallback only if theirs can't be disabled. |
| Footprint runs inside the PWA | Confirmed by the user (also on iPhone standalone). |
| Skip-scan for returning parents | "Buy next size without scanning": suggests last size + 1, size picker, shows last setting as a hint (a new setting colour needs a scan), link "Not sure? Rescan". Rule of thumb: last scan under ~8 weeks old = equal weight with Rescan; older = "Rescan recommended". No share/gift after a skip-scan purchase. |
| Hosting/backend stack | Vite + React + TypeScript, Tailwind, shadcn/ui, vite-plugin-pwa. Vercel (or Cloudflare Pages) on `app.sizeless-shoe.com`. Supabase (EU region, Frankfurt): Postgres, Auth, row-level security, scheduled jobs. Shopify stays the shop/checkout (Storefront API for cart, webhooks for orders). WhatsApp Business API via a provider (Twilio or 360dialog). |
| Not used | Cursor (just an editor), Convex (Supabase preferred: standard Postgres, EU, built-in OTP). |

## 3. Product flow (summary; the flow doc is authoritative)

**Flow doc (Claude Docs):** https://claude.ai/code/artifact/ab6da151-2ac0-4749-9e37-3d590892eeb7 (scope, principles, data model, Journeys 1 to 5, screens S01 to S21, WhatsApp templates W1 to W7, Footprint constraints, open questions). It is OUT OF DATE on: WhatsApp opt-in at S10, share/gift after a rescan only, email-code sign-in, own Scan intro + QR, skip-scan, Home option B.

**Journeys (names approximate):**
1. First scan and purchase: Scan intro -> Footprint scan -> S05 Result (size + setting chip, primary "Buy size EU n", link to S06 setting explanation) -> Shopify checkout -> S10 order confirmed (profile saved, WhatsApp opt-in) -> Home.
2. Fit check: WhatsApp message after about 1.5 months (open point: from delivery or order date) with thumbs up/down. Up = confirmation, no login. Down = signed link -> Home in fit-check-pending state with the right child -> rescan.
3. Rescan and growth: new size + setting, growth chart (size/age on a statistical curve), then share card / gift / referral prompt.
4. Seasonal nudge: winter boot, house shoe -> Home season state; Scan or "Buy next size" (needs extra lasts at Footprint).
5. Share / gift / referral: gift link with child's name, size, CTA to order. Recipients run anonymously, account created at purchase. Empty Home state for recipients without a child.

**Known screen IDs:** S05 Result, S06 setting explanation, S10 order confirmed, S12 Home (OneKid, SeveralKids, Nudge, Empty), S13 Add kid, S14 Rescan, S15 Growth (One, Several), S16 History (Several, Switcher), S20 Account (was Settings).

**WhatsApp templates:** W1 to W7 in the flow doc. W2/W5 are likely "utility" but Meta decides category. Use quick-reply buttons; template messages outside the 24-hour window; consent for marketing messages; email fallback.

## 4. Integration constraints

**Footprint**
- Script + `<div data-widget="fpt-button">` with data attributes (article number, name, image, price, session ID).
- Window DOM events: `fpt-add-to-cart`, `fpt-back-to-shop`, `fpt-cancel`. Payload: `{matching_id?, measurement_id, session_id?, size, error_code?, article_number}`.
- Saving the profile and desktop return need custom integration. Native QR handoff exists (we want ours).
- One shoe last included; winter boot and house shoe need extra lasts.

**Shopify**
- Stay on Shopify for products, checkout, orders, customers.
- PWA puts the size in a cart through the Storefront API and redirects to checkout. "Order paid" webhook (verify HMAC signature) creates the account + child profile.

**WhatsApp**
- Business API through a provider. Start Meta business verification now (long lead time). Template approval needed.

## 5. Security and data rules (non-negotiable)

- Child data under GDPR: Supabase EU region, privacy policy, consent for WhatsApp marketing, data export and deletion (Account > Your data), no PII in logs.
- Row-level security on EVERY table; a parent can only read their own children.
- Shopify admin token and WhatsApp token server-side only. No secrets in client code.
- Verify webhook signatures; rate-limit the email-code endpoint; signed one-time tokens in WhatsApp links.
- Separate staging and production; pull requests only; CI runs lint, types, tests; Playwright e2e on the core path.
- Run Claude's security review per release; pay a human reviewer for a few hours before launch.

## 6. Status and open items

**Done**
- Flow doc written and checked (needs the updates listed in section 3).
- Claude Design canvas "Sizeless PWA Wireframes": https://claude.ai/artifact/XqDsU12bocGKENLXsYbsW8 (about 70 boards). Reviewed; NOT yet modified.
- Council decision on the Home structure (B).
- Claude Design prompts written (Appendix A): Step 1 (Home only) and the consolidated Step 2 (everything else). Pasting status: check with Linus.

**Pending**
1. Paste Step 1 into Claude Design, review the new Home, approve. Then paste Step 2.
2. Update the flow doc: WhatsApp opt-in at S10; share/gift only after rescan; email-code sign-in; Scan intro + own QR; skip-scan; Home option B; one scan mode.
3. Design system (Claude Design "Design System" type from the Sizeless brand; tokens matched to Tailwind/shadcn). Then high-fidelity versions of about 6 key screens.
4. Footprint questions: can the desktop QR be disabled or replaced? Measurement ID reuse for another shoe/last? Extra lasts for winter boot + house shoe? (Widget in standalone PWA on iPhone is confirmed.)
5. Start Meta business verification + WhatsApp number; create GitHub private repo, Supabase (EU), Vercel; choose a subdomain.
6. Reply to the open comment in the flow doc: fit-check timing from delivery vs order date.
7. Decide the skip-scan window (8 weeks is a placeholder).
8. Five-parent test (tasks: find last shoe size, change WhatsApp preferences, add a second child, reorder next size without scanning). Metrics: % of Home sessions taking the dominant action, time-to-find history, WhatsApp opt-in rate at S10, rescan completion rate, share of reorders that skip the scan.
9. Preference: never make changes (ad accounts, canvas, etc.) without showing what changes and getting explicit approval.

## 7. Workspace setup (starter files for the repo)

### 7.1 Repo layout

```
sizeless-app/
  CLAUDE.md
  docs/
    handoff.md            (this file)
    product-spec.md       (flow doc exported to markdown, updated per section 6)
    data-model.md
    integrations.md       (section 4)
    security.md           (section 5)
    decisions.md          (section 2 as a dated log)
    design-system.md
    progress.md
  wireframes/             (canvas export, reference only)
  src/  supabase/  e2e/
```

### 7.2 CLAUDE.md (paste as-is)

```markdown
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
```

### 7.3 First backlog (one GitHub issue each, in this order)

1. Scaffold: Vite + React + TS strict, Tailwind, shadcn/ui, PWA manifest + service worker, CI (lint, types, tests), Vercel preview deploys.
2. Supabase project (EU), schema v1 (users, children, measurements, orders, shoes, notification preferences) + RLS policies + tests that prove isolation between parents.
3. Design tokens + base components from the design system.
4. Email-code sign-in (Sign-in, Code entry, expired/wrong code) + long session.
5. Shell: header with kid switcher, avatar -> Account, back arrows, desktop sidebar; Home state machine with mock data.
6. Scan intro + Footprint widget integration + result screen (S05, S06).
7. Shopify cart + checkout hand-off; order-paid webhook (HMAC verified) creates account + child; S10.
8. Own desktop QR handoff with session sync.
9. Growth chart + Shoe history; rescan flow.
10. WhatsApp opt-in at S10; fit-check template + signed links -> Home; scheduled job.
11. Skip-scan "Pick next size" flow.
12. Season nudge; share card, gift link, referral (after a rescan).
13. Account: children, notifications, data export/delete, co-parent invite.
14. Hardening: security review, human review, private beta with about 20 existing customers.

---

## Appendix A: Claude Design prompts

### Step 1 (Home only; then STOP for approval)

```
Update the existing "Sizeless PWA Wireframes" canvas. Do not rebuild it. Edit the existing boards and add only the new ones listed below. Keep wf.css, the grey wireframe style and the file naming.

STEP 1 (do this first, then STOP and wait for my approval)
Redesign the Home screens only: S12-Home-OneKid, S12-Home-SeveralKids, S12-Home-Nudge. Add the new Home states in section 3. Do not touch other screens until I approve.

1. NAVIGATION DECISION (mobile)
- Remove the bottom tab bar (Home / Growth / Shoes / Settings) from ALL mobile screens.
- Home is the hub. There is no persistent bottom nav.
- Header on Home: Sizeless logo on the left, a global kid switcher in the centre (selected child's name and age, chevron opens a sheet listing the children plus "Add child"), labelled avatar button on the right (initial plus the word "Account").
- The selected child is global. It carries over to Growth, Shoe history and Rescan.
- Every non-Home screen has a visible back arrow and a title. Assume iOS standalone, where there is no browser back button.
- Desktop: keep a left sidebar (Home, Growth, Shoes, Account) built from the same routes. The kid switcher sits at the top of the sidebar.

2. HOME = ONE DOMINANT ACTION PER STATE
Each Home state has exactly one large primary button, with everything else secondary and below it.
- Normal: primary "Rescan {Name}'s feet"; secondary cards below.
- Fit check pending (after a thumbs-down link): primary "Rescan now", with a short line "You told us the shoes feel tight".
- Season nudge (winter boot / house shoe): primary "Scan for winter boots".
- Rescan due soon: primary "Rescan {Name}" with "due in about 2 weeks".
- First-time or empty: see section 3.
Secondary cards, all with a chevron and a clear label:
- Current shoe (model, size, green/yellow/red setting chip) with link "See shoe history" -> History.
- Growth sparkline with link "See growth chart" -> Growth.
- Next fit check (date).
- Text link "Add another child".
Several children: below the primary action, a compact line per other child showing their own due action (for example "Mia: rescan due"); tapping it sets the switcher to that child.

3. NEW HOME / ENTRY STATES (add as new boards)
- S12-Home-Empty: gift or referral recipient with no child yet. Primary "Scan {child}'s foot", secondary "How it works".
- Expired link / WhatsApp in-app browser state: show "Open in the Sizeless app" plus "Send me a code" (links to Sign-in).
- Account entry (avatar): one screen listing Children, WhatsApp and notifications, Share and gifts, Your data (download / delete), Log out. Mark the old S20-Settings-In as reachable only from here.

4. BUY PATH (missing so far)
On S05 Result add a primary "Buy size EU {n}" and a secondary "Rescan". Add the screen(s) from Result to Shopify checkout and the return to the app. The order confirmation page, S10, offers the WhatsApp opt-in.

5. WHATSAPP / SHARING CHANGES (already in the canvas, keep them)
- The WhatsApp opt-in lives on S10 after purchase, not on the Result screen.
- Share card, gift link and referral appear only after a rescan.
- Footprint owns scan instructions and camera; one mode only (a parent holds the phone).

6. FIX PROTOTYPE LINKS
- Home tab/links must go to the Home state matching the selected child count.
- S12-Home-SeveralKids: growth card -> S15-Growth-Several; kid switcher -> the switcher sheet.
- All "Growth" and "Shoes" links must go to the One / Several variant that matches the state.

7. DEEP LINKS
Add a note board: every WhatsApp or magic link opens the app on Home with the right child selected, and the dominant action is shown from there. A deep link never lands on a deep screen without a back path to Home.

8. NOTES
Update the canvas legend and notes to describe: no bottom nav on mobile, Home as state machine, global kid switcher, and the five-parent test tasks (find the last shoe size, change WhatsApp preferences, add a second child).

OUTPUT
When Step 1 is done, give me a short list of the boards you changed or added, then stop and wait.
```

### Step 2 (after Step 1 is approved)

```
STEP 2: Apply the approved Home structure to the rest of the canvas.
Edit existing boards. Do not rebuild. Keep wf.css, the grey style and the file naming. Add only the new boards listed. Home boards are approved, so only fix their links.

1. REMOVE THE TAB BAR EVERYWHERE (mobile)
- Delete the bottom tab bar from every remaining mobile board.
- Every non-Home screen has a header with a back arrow, a title, and the global kid switcher where content is per child (Growth, Shoe history, Buy, Scan).
- Every back arrow has a defined target and links to it. Deep screens return to their parent, and the parent returns to Home. iOS standalone has no browser back button.
- Desktop boards: left sidebar (Home, Growth, Shoes, Account) from the same route list. Kid switcher at the top of the sidebar.

2. SIGN-IN AND ACCOUNT (lean, no passwords, no Apple or Google in the MVP)
- No sign-up screen. The account is created automatically from the first Shopify order (checkout email).
- S10 "Order confirmed": text "{Name}'s profile is saved. We'll email you a code whenever you need to sign in." Then the WhatsApp opt-in, then a button to Home.
- New boards: Sign-in (email field + "Send me a code"), Code entry (6 digits, resend, "wrong email?"), Code expired / wrong. These replace any "Send me a new link" board from Step 1, and the expired-link state links to Sign-in.
- Same-device sessions are long, so returning users rarely see sign-in. Fit-check and season links from WhatsApp carry a signed token and open Home directly.
- Account screen (avatar only): Children (edit, add, remove), WhatsApp and notifications, Share and gifts (disabled before the first rescan: "Available after your first rescan"), Your data (download, delete), Invite a co-parent, Log out. No password section.

3. SCAN ENTRY (our own screen, then the Footprint widget)
- New board "Scan intro" (mobile): our branding, child name and age (prefilled for known children), a short "What you need: A4 paper, a flat floor", and ONE primary button "Start scan". That button is the Footprint widget button.
- Footprint then owns instructions, checklist and camera (placeholder board "Footprint widget") with the exits: add-to-cart, back-to-shop, cancel, error, success. The widget runs inside the installed PWA.
- Desktop: the scan step shows OUR QR code (not the Footprint QR) that opens our app on the phone at the same Scan intro, with the child already named. Desktop states: "Waiting for phone", "Scan finished, continue here". The result syncs back to the desktop.
- First-time visitors with no child: Scan intro asks for child name and age first, one screen only.

4. RETURNING PARENT: BUY WITHOUT SCANNING
- On Home (card "Need the next size?"), on Shoe history rows and on the season nudge: a secondary action "Buy next size without scanning" next to the primary "Rescan {Name}".
- New board "Pick next size": shows the last size and date (EU 26, scanned 8 weeks ago), the suggested next size (EU 27) preselected, a size picker, the last setting shown as a hint ("Last setting: green. We can't confirm a new setting without a scan"), a primary "Buy EU 27", and a link "Not sure? Rescan instead".
- After a skip-scan purchase, S10 variant: "Order confirmed. Rescan in a few weeks to check the setting." Do not offer share or gift (those come only after a rescan).
- Rule note on the board: when the last scan is under about 8 weeks old, the skip-scan action is shown at the same weight as Rescan; when older, show "Rescan recommended" and keep the skip-scan link smaller.
- Winter boot and house shoe nudges use the same "Pick next size" path when a recent scan exists.

5. GROWTH AND SHOE HISTORY
- S15-Growth-One and S15-Growth-Several: reached from "See growth chart" on Home. Header "Growth", kid switcher, chart, measurement list. Switching child updates in place.
- S16-History-Several and S16-History-Switcher: header "Shoes", kid switcher, list of past shoes (model, size, setting chip, date). The switcher board becomes the open-sheet state.
- Each row opens shoe detail with "Buy again in this size" (current size) or "Pick next size". Show scan-based and skip-scan purchases differently (scan icon vs size-only).
- A persistent secondary "Rescan {Name}" on both.

6. FIRST-PURCHASE FLOW
- S05 Result: primary "Buy size EU {n}", secondary "Rescan", link to S06 (setting explanation). No WhatsApp opt-in and no share here.
- New boards: Result -> Shopify checkout hand-off -> return to app -> S10.

7. RESCAN FLOW
- S14-Rescan starts at Scan intro (section 3). After the rescan: result with the new size and setting chip, growth chart updated, then the share card, gift link and referral prompt (first appearance), then "Back to Home".

8. WHATSAPP TEMPLATE SCREENS
- Fit check thumbs up -> confirmation, no login.
- Thumbs down -> signed link -> Home, fit-check-pending state, correct child selected.
- Season nudge -> Home, season state, with "Scan" and "Buy next size" both available.
- Mark each board's note with where its link opens.

9. STATES TO ADD
- Gift or referral recipient: link -> S12-Home-Empty -> Scan intro -> result -> buy.
- Offline / session expired -> Sign-in.
- Child with last scan over 6 months: Home shows rescan-due, skip-scan demoted.
- Several children with different due actions (check the cross-child lines link correctly).

10. PROTOTYPE LINKS
Every link on every board resolves. Home links to the One/Several variant that matches the state. Nothing links to the deleted tab bar. List the broken links you found and fixed.

11. NOTES AND LEGEND
- Update the legend: no bottom bar on mobile, Home hub, global kid switcher, labelled cards, back arrows, desktop sidebar, email-code sign-in, own Scan intro and QR, skip-scan purchase.
- "Test with 5 parents" board, tasks: find the last shoe size, change WhatsApp preferences, add a second child, reorder the next size without scanning. Fallback rule: if 2+ of 5 stall finding history or Account, switch to a 3-item bar (Home, Records, Account).
- Metrics board: % of Home sessions that take the dominant action, time-to-find history, WhatsApp opt-in rate at S10, rescan completion rate, share of reorders that skip the scan.

OUTPUT
List the boards changed, added and removed, plus the broken links fixed. Do not change anything not listed.
```

---

## Appendix B: Instructions for the new session

When this file is pasted, the assistant should:
1. Read it fully, then reply with a 5-line summary of where the project stands and the next step.
2. Not change the canvas, the flow doc, or any account without showing what changes and getting approval.
3. Start with: (a) update the flow doc per section 6 item 2, (b) design system prompt for Claude Design, (c) create the repo starter files from section 7.
