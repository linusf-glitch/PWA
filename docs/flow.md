# User flow (from the wireframes)

Source: the "Sizeless PWA Wireframes" canvas, https://claude.ai/artifact/XqDsU12bocGKENLXsYbsW8 (read-only, never edit without Linus's approval). The user-flow page is `#page-dcb81aee8d83`. Copied 2026-10-08 from canvas version 1791446580-53c7.

**How to use this file.** Before building a screen: find it here, then open its board on the canvas (board file names are given in brackets, e.g. `S08-Buy`). This file answers "which screen comes next, what is on it, where does each button go". Never ask Linus something this file or the boards answer.

**Where the canvas is out of date.** `docs/decisions.md` wins over the canvas. Known differences are listed at the end ("Canvas vs decisions"). The most visible one: the canvas says **Green** for the smallest setting; the app says **Türkis / Turquoise**. This file uses Turquoise.

**Copy.** The canvas is in English. The app is German, informal "du". Translate; don't copy the English.

**Example data on the boards.** Parent Anna; children Emil (born March 2022, EU 26, has shoes) and Lotta (born June 2024, no shoes yet); co-parent Jonas; Mia (invited friend's child). Dates and `[BRACKETS]` are placeholders.

## Global rules (from the canvas legend and flow notes)

- Mobile has **no bottom bar**. Home is the hub and shows **one primary action per state**.
- **Home header:** logo, global kid switcher (avatar + name + age), Share, Account (avatar + label "Account").
- **Every other screen:** back arrow + title. Growth, Shoes, Buy (S08), Scan intro and Rescan also carry the kid switcher. Many screens also have a Share button in the header.
- **Kid switcher:** opens a sheet "Choose a child" (one row per child with age, and on Shoes the shoe count; "+ Add a child" at the bottom; close X). Switching updates the current screen in place. The selected child is global and carries over to Home, Growth, Shoes and Rescan.
- Home cards are labelled and end in a chevron.
- Growth and Shoes keep a secondary "Rescan {Name}" button, so the scan is reachable from everywhere.
- **Every scan starts on our own Scan intro** (S02 first visit, S03 known child, S14 rescan). "Start scan" is the Footprint widget button. Footprint owns instructions, checklist, camera permission and its own error screens. One mode only: a parent holds the phone.
- **Sign-in:** email + 6-digit code. No sign-up (account comes from the first order's checkout email), no passwords, no Apple or Google.
- **Skip-scan:** "Buy next size without scanning" sits next to Rescan on Home, Shoes and the season nudge. Same weight when the last scan is recent; a small link when it is old (6 weeks / 8 weeks / 6 months: see "Canvas vs decisions", item 3).
- **Setting ≠ colourway.** Dot + label = adjustment setting (Turquoise / Yellow / Red). Colourway = the shoe's colour, chosen only on S08 / S18.
- **WhatsApp opt-in only after purchase (S10).** Exception on the canvas: S05 out of range (item 4 below).
- **Sharing** (gift link, referral): from the Home "Gift & invite" card and header Share, and on rescan results. Never between result and checkout, never on the first-order path, never after a skip-scan order. In Account it is locked until the first rescan ("Available after your first rescan").
- Errors are icon + text, never colour alone.
- No subscription.
- Dashed boxes on the canvas = outside the PWA (Footprint, Shopify, WhatsApp). Yellow boxes = rules.

## Journey 1: first scan to purchase (mobile)

Goal: ad click to paid order with the right size. Nothing between result and checkout leads away.

Entry points: Instagram/Meta ad, shop button, S19 referral link.

Order: **S01 → S02 → S04 (Footprint) → S05 → S08 → S09 hand-off → Shopify → S09 return → S10 → (S07) → S12 Home**
Side paths: S04 cancel/error → S03 or S05 error; S05 → S06 → back to S05.

### S01 Start (`S01-Start`, variant `S01-Start-Referral`)
- No back arrow (entry page). Header: logo, language toggle EN · DE (see item 5).
- Illustration (bare foot on paper, parent with phone), headline "Find your little one's perfect fit", sub "A 5-minute foot scan tells you the right Sizeless size and how to set the shoe. No account needed."
- Card "What you need": phone with camera, A4 or US Letter paper, bare feet, about 5 minutes.
- Buttons: **Start scan** → S02. Link "I already have a profile · Sign in" → S11.
- Rule: scan before account. The first result needs no login.
- **Referral variant:** dark banner on top "Anna invited you · 25 € off your first pair. Applied automatically at checkout." Arriving from S19 adds it; the code travels to checkout.

### S02 Scan intro, first visit (`S02-Kid-Empty`, `S02-Kid-Error`)
- Back → S01 (Home · empty for invited parents). Title "Scan intro".
- Eyebrow "Sizeless foot scan · Classic shoe", headline "Who are we measuring?"
- Fields: First name; Birth month + Birth year (two selects).
- Card "What you need": A4 paper, a flat floor.
- Privacy line with lock icon: scan photos only used to measure, never shared; "We keep a first name, birth month and measurements."
- Button **Start scan** (disabled/grey until filled) → S04 Footprint widget.
- **Error state:** "Please add a first name"; "Pick a birth year. Sizeless fits ages 2 to 6."
- Known children skip the fields (S03).

### S02 Add another kid (`S02-Kid-Another`)
- Back → Home. Title "Add a child". Saved child shown on top (Emil · EU 26 · setting · "saved").
- Headline "Who's next?" Fields: first name, birth month/year, "Which shoe?" radio: Classic shoe (Spring to fall) / Winter boot · coming soon (disabled).
- Button **Continue with {Name}** → S03 Scan intro (known child).
- Rule: one child, one profile; own scan, messages, history.

### S03 Scan intro, known child (`S03-Scan-Intro`)
- Back → Home. Title "Scan", kid switcher.
- Illustration, eyebrow "Sizeless foot scan · Classic shoe", headline "Let's measure {Name}'s feet", child row with age and "prefilled".
- "What you need" (A4 paper, flat floor), privacy line.
- Button **Start scan** → S04.

### S03 Scan not finished (`S03-Prep-Retry`)
- Back → S02. Title "Scan not finished".
- Pause icon, "Scan not finished", "No problem, that happens with little ones. {Name}'s details are saved…"
- Link "Change {Name}'s details" → S02. Button **Start the scan again** → S04.
- Shown after `fpt-cancel` (or an error before any result).

### S04 Footprint widget (`S04-Scan-Progress`, `S04-Scan-Cancelled`, `S04-Scan-Error`)
- Outside our UI (dashed). Top bar: close X, "Step 2 of 2 · Classic shoe".
- Five exits:
  - `success` / `fpt-back-to-shop` → S05 Result
  - `fpt-add-to-cart` → S08 Buy
  - `fpt-cancel` (close X) → S03 Scan not finished; child details kept
  - error code → S05 Result · scan error
- Footprint also shows its own permission-denied and unsupported-phone screens. Runs inside the installed PWA.

### S05 Result (`S05-Result`, `S05-Result-OutOfRange`, `S05-Result-Error`)
- Back → S02. Title "{Name}'s result".
- **Success:** eyebrow "Classic shoe", big size "EU 26", "Set the shoe to" + setting chip ("Turquoise setting · [position name]"), how-to-set picture, link "How the turquoise, yellow, red setting works" → S06, checkbox (ticked) "Save {Name}'s result to his profile. How we use this data".
  - Buttons: **Buy size EU 26** → S08. Secondary **Rescan** → S04.
  - Rule: one goal (buy). No WhatsApp opt-in and no sharing here. Consent checkbox stays (saving needs it).
- **Out of range:** "{Name}'s feet are still a little small for us", smallest size EU [SMALLEST SIZE]; checkbox "Save {Name}'s result so we can remind you later"; buttons **Remind me when {Name}'s feet grow** (WhatsApp) and **Measure again**. Too-large text: "…bigger than our largest classic shoe (EU [LARGEST SIZE])."
- **Scan error:** "The scan didn't work this time. Nothing is saved yet…" Button **Try again** → S04. No "measure yourself" option.

### S06 How the setting works (`S06-Growth-Preview`)
- Back → S05. Title "How the setting works".
- Intro text, card with the three positions (Turquoise / Yellow / Red, each "[position name]" + "[what it means]"), how-to-set picture, card "{Name} right now: EU 26 · Turquoise" with next fit check date.
- Button **Back to result** → S05.

### S08 Colourway and buy (`S08-Buy`, `S08-Buy-SoldOut`)
- Back → S05. Title "Choose colourway", kid switcher.
- Product image, "Sizeless Classic shoe [PRICE] €", colourway buttons A / B / C.
- Locked summary: "For {Name}, from the scan on {date}" · Size EU 26 · Setting Turquoise.
- Button **Go to checkout** → S09 hand-off.
- **Sold out:** that colourway greyed, "Colourway A is sold out in EU 26" + **Tell me when it's back**.
- Rule: colourway picked here; size and setting are locked from the result. From a rescan (outcome B) the colourway is preselected as last time.

### S09 Checkout hand-off (`S09-Handoff`)
- Back → S08. Title "Checkout". "Taking you to secure checkout. Payment runs on Shopify. {Name}'s size and setting come with you, nothing to re-enter."
- Summary: Classic shoe · Colourway A · EU 26 · Turquoise · for {Name} · [PRICE] €.
- Button **Continue to checkout** → Shopify.
- Cart permalink with line-item properties (kid name, size, setting, measurement ID, referral code). Same tab. From the iPhone home screen it may open in Safari; S09 return handles the way back.

### S09 Shopify checkout (`S09-Checkout`, placeholder)
- Outside the PWA. Primary action Pay. Travels with the order: kid, size, setting, colourway, Footprint measurement ID, referral code or gift token.
- Return URL → S09 return. The first order turns the lead into a customer and creates the profile/account.

### S09 Return (`S09-Return`)
- **No back arrow** (would reopen checkout). "Payment done. We're setting up {Name}'s profile." Continues to S10 automatically (button **Continue**).

### S10 Order confirmed (`S10-Confirmation`, variant `S10-Confirmation-SkipScan`)
- No back arrow. "Order confirmed. {Name}'s profile is saved. We'll email you a code whenever you need to sign in." Order number, "thanks, Anna".
- Card "Saved for {Name}": Classic shoe · EU 26 · setting.
- Card "Know when {Name}'s feet grow": about 6 weeks after delivery we ask on WhatsApp. Button **Remind me on WhatsApp** (opens WhatsApp with a prefilled message) → S07 connected. Unticked checkbox "Also send me seasonal tips…" (optional marketing). Small print: fit checks only, max one a day, never 20:00–08:00, STOP any time, privacy policy.
- Link "No WhatsApp? Remind me by email" → S07 not connected. Button **Go to Home** → S12.
- No share or gift link here.
- **Skip-scan variant:** "Rescan in a few weeks to check the setting." "Ordered for {Name}: Classic shoe · EU 27 · Size only. Bought without a scan. Start on the setting {Name} used last until the rescan confirms it." WhatsApp card: "About 3 weeks after delivery we ask you to rescan." (If WhatsApp isn't on yet, the normal opt-in card shows.) Button **Go to Home**.

### S07 WhatsApp reminders (`S07-WA-NotConnected`, `S07-WA-Connected`, `S07-WA-Declined`)
- Back → S10. Title "WhatsApp reminders".
- **Not connected:** "Remind me when {Name}'s feet grow", prefilled message preview "Hi Sizeless, please remind me when {Name}'s feet grow. [REF CODE]", **Open WhatsApp** → connected; email field + **Remind me by email**; link **No thanks** → declined. Sending the prefilled message is the opt-in; W1 confirms.
- **Connected:** "Reminders are on", date of first check, preview of W1. Button **Go to {Name}'s profile** → Home.
- **Declined:** "No reminders, no problem", size + setting. Fit checks still show on Home. Button **Go to {Name}'s profile** → Home.

## Journey 2: returning parent, Home hub and every path from Home

### S12 Home: states
One primary action per state. Priority on the canvas (lowest number that applies wins; see item 2 for the conflict with decisions.md):

| # | State | When | Primary action | Board |
|---|---|---|---|---|
| 1 | Link expired | Magic link invalid, or opened in WhatsApp's in-app browser | Open in Safari (+ Sign in with a code) | `S12-Home-AfterLink-Expired` |
| 2 | Empty | Gift or referral recipient, no child yet | Scan {child}'s foot | `S12-Home-Empty` |
| 3 | Fit check pending | W4 "feels tight" link, until the rescan | Rescan now | `S12-Home-FitCheck` |
| 4 | Rescan due | 2 weeks before the next fit check, or last scan older than 6 months | Rescan {Name}; over 6 months skip-scan is a small link | `S12-Home-RescanDue`, `S12-Home-ScanOld` |
| 5 | Season nudge | Season date, marketing consent, not bought this season | Scan for winter boots + Buy winter boots without scanning | `S12-Home-Nudge` |
| 6 | No shoes yet | Selected child has no Sizeless shoe | Scan {Name}'s feet | `S12-Home-NoShoes` |
| 7 | Normal | Otherwise | Rescan {Name}'s feet + "Need the next size?" Buy without scanning | `S12-Home-OneKid` |

**Layout (all states with a child):**
- Header: logo, kid switcher → sheet, **Share** → S17, **Account** → S20.
- Primary card (state-specific heading, line of text, primary button, optional secondary link).
- Cross-child lines (several kids, `S12-Home-SeveralKids`): one line per other child with their due action ("Lotta: first scan due"); tapping switches the child.
- Card "Gift & invite": **Gift {Name}'s size** → S17, **Invite · 25 € each** → S17. (Not on No shoes.)
- "{Name}'s overview" cards: Shoe (model · size · setting) "See shoe history" → S16; Growth ("n measurements") "See growth chart" → S15; Next fit check ("around {date}", "We'll ask on WhatsApp") → Account; **Add another child** → S13 add.

**State details:**
- **Normal:** "Next step for {Name}. A 2-minute rescan shows if {Name}'s setting needs to move." **Rescan {Name}'s feet** → S14. "Need the next size?" **Buy without scanning** → S08 Pick next size.
- **Fit check pending:** eyebrow "From your WhatsApp reply", "You told us the shoes feel tight. A rescan shows if a new setting is enough or {Name} needs the next size." **Rescan now** → S14. Back from S14 returns here.
- **Rescan due:** "Rescan due in about 2 weeks. {Name}'s next fit check is around {date}. If the shoes already feel snug, check now." **Rescan {Name}** → S14; Buy without scanning → S08 Pick.
- **Scan old (>6 months):** "Rescan recommended. {Name}'s last scan is 7 months old. Feet grow fast at this age." **Rescan {Name}** → S14; skip-scan demoted to a small link "Buy next size without scanning".
- **Season nudge:** "Winter is on its way. Check {Name}'s size for the winter boot in 2 minutes." **Scan for winter boots** → S14 (then winter-boot result); **Buy winter boots without scanning** → S08 Pick with the boot preselected.
- **No shoes:** "{Name} has no Sizeless shoes yet. Her last scan is from {date}, so let's measure again before buying." **Scan {Name}'s feet** → S03. Overview: Shoe "No shoes yet" → S16 empty; Growth → S15. No Gift & invite card.
- **Empty:** header has "+ Add child" → S13 and Account. Optional referral banner "Anna invited you · 25 € off…". "Welcome to Sizeless. Who are we measuring?" First name field; button reads "Scan your little one's feet", then "Scan {Name}'s foot" once a name is typed → S02. Link "How it works" → S01. Privacy line. Birth month is asked after the scan.
- **Link expired / in-app browser:** "Let's get you back to {Name}. This link has expired, or it opened inside WhatsApp." **Open in Safari** → Home in the target state; **Sign in with a code** → S11. Sign-in keeps the target (child + dominant action).

### S14 Rescan (`S14-Rescan`, `S14-Footprint`, `S14-Outcome-A/B/C`)
- **Scan intro (rescan):** back → Home (the state it came from). Title "Rescan", kid switcher, Share. "Let's measure {Name} again", child + age + "last scan {date}", current size + setting, What you need, privacy line. **Start scan** → Footprint widget.
- **Footprint widget (rescan):** close X → S14 intro. Exits:
  - success, same size → Outcome A
  - success from the season nudge → S05 winter boot
  - `fpt-back-to-shop`, new size → Outcome B
  - `fpt-add-to-cart` → S08 (size locked)
  - `fpt-cancel` → S14 intro
  - error code → Outcome C
  - Nothing is saved until the PWA has handled the event.
- **Outcome A, same size, new setting:** back → Home. "{Name}'s new setting", "Rescan · {date} · Classic shoe", "Size EU 26 · still fits", "Move the setting Turquoise → Yellow", how-to-set picture, card "Growth chart updated · see chart" → S15, Gift & invite card (first appearance of gift link and referral) → S17. **Back to Home**. Next fit check queued.
- **Outcome B, next size:** "{Name}'s next size", "EU 27 (was EU 26)" + setting, growth card → S15, Gift & invite → S17. **Buy size EU 27** → S08 (colourway preselected as last time). **Back to Home**.
- **Outcome C, scan error:** "The scan didn't work this time. {Name}'s saved size (EU 26, Turquoise) hasn't changed." **Try again** → S14 intro; **Later** → Home. Nothing is overwritten.

### S05 Result · winter boot (`S05-Seasonal-WinterBoot`)
- Back → Home · season nudge. Title "Winter boot", kid switcher, Share.
- "{Name}'s result · Winter boot EU 27", "Set the boot to Yellow setting", "Based on {Name}'s scan from {date}, so no new scan needed. The winter boot fits differently…", how-to-set picture.
- **Buy the winter boot** → S08. **Measure again anyway** → S14.
- From the season flow map: last scan under 6 weeks → this result reuses the scan; older → S14 rescan first.

### S08 Pick next size, buy without scanning (`S08-Pick-Next-Size`)
- Back → Home (the state it came from). Title "Next size", kid switcher.
- "Pick {Name}'s next size", "Last size EU 26 · scanned 8 weeks ago", size buttons EU 26 / **EU 27 · suggested** / EU 28, "Last setting: turquoise. We can't confirm a new setting without a scan." "Classic shoe · Colourway A (as last time)" + **Change** → S08 colourway.
- **Buy EU 27** → S09 hand-off. Link "Not sure? Rescan instead" → S14.
- Order tagged "size only" → S10 skip-scan variant. Winter boot / house shoe nudges use this screen with the model preselected.

### S15 Growth (`S15-Growth-One`, `S15-Growth-Several`, `S15-Growth-Kids`)
- From Home "See growth chart". Back → Home. Title "Growth", kid switcher (sheet opens in place), Share.
- Chart + table: Date · Length / width (mm) · Size · Shoe.
- **One point:** "One measurement so far. The next check around {date} adds a second point."
- **Several points:** switching child updates in place. Link **Compare all kids** → all kids.
- **All kids:** back → Growth. Kids differ by line style and marker shape, not colour.
- Secondary **Rescan {Name}** → S14.
- Open question on the canvas: growth band data source (doc Q4).

### S16 Shoes (`S16-History-Several`, `S16-History-Empty`, `S16-History-Switcher`, `S16-Shoe-Detail`, `S16-Shoe-Detail-Outgrown`)
- From Home "See shoe history". Back → Home. Title "Shoes", kid switcher (sheet shows shoe count per child), Share.
- Sections "In use" and "Outgrown". Each row: model, size, setting chip, date(s), and how it was bought ("from a scan" icon vs "EU size only, no scan"). Row → shoe detail.
- **Empty:** "No shoes yet for {Name}. When {Name} gets her first Sizeless pair, it shows up here with size, setting and dates."
- Buttons: **Rescan {Name}** → S14, **Buy next size without scanning** → S08 Pick.
- **Shoe detail, size still current:** back → Shoes. Product image, For {Name}, Size, Setting now, Colourway, In use since, Bought from a scan, "EU 27 is still {Name}'s size · Latest scan {date}, under 6 weeks old." **Buy again in this size** → S08; **Rescan {Name}** → S14; **Pick next size** → S08 Pick.
- **Shoe detail, outgrown:** Size, Settings used (Turquoise → Yellow), Worn {dates}. "{Name} has outgrown EU 26. Rescan first so a new pair fits today." No "Buy again". **Rescan first** (primary) → S14; **Pick next size** → S08 Pick (small link once the last scan is over 8 weeks old).

### S13 Kid profile (`S13-Kid-Add`, `S13-Kid-Edit`)
- **Add:** from Home "Add another child", the kid switcher sheet, or the desktop side nav. Back → Home. Fields first name, birth month/year. "We only keep a first name, birth month and foot measurements. No photos, no surnames." **Save and start the scan** → S03 with the new child; **Save, scan later** → Home (no shoes state).
- **Edit:** from Account. Back → Account. Title "{Name}'s details". Fields + **Save**. "Delete {Name}'s profile: removes measurements, size history and reminders. This can't be undone." **Delete {Name}** (asks for confirmation).

### S20 Account (`S20-Settings-In`, `S20-Settings-Out`, `S20-Account-CoParent`)
- From the Home avatar. Back → Home. Title "Account".
- Parent name, email, masked phone.
- **Children:** one row per child "Edit or remove" → S13 edit; "+ Add a child" → S13 add.
- **WhatsApp and notifications:** toggle Fit checks on WhatsApp (with number), toggle per child, toggle Seasonal tips (marketing), **Change number**, **Pause for 4 weeks** → paused state.
- **Share and gifts:** "Gift links and invites · Available after your first rescan" (locked until then).
- **Your data:** **Download my data**, **Delete all data**.
- **People:** **Invite a co-parent** → co-parent screen. **Log out**.
- No password section.
- **Paused / opted out:** banner "WhatsApp messages paused until {date}. No fit checks or tips until then. Fit checks still show on Home." **Resume now**. Opted-out (STOP) parents get nothing.
- **Invite a co-parent:** back → Account. Their first name, their email, checkboxes for which children to share. "Either of you can remove the other. Only you can delete the account." Pending invite row (valid 7 days) with **Resend** / **Cancel invite**. **Send invite** → Account. The co-parent signs in with their own email + code and has their own WhatsApp opt-in.

### S11 Sign in (`S11-Login`, `S11-Login-Error`, `S11-Code`, `S11-Code-Error`, `S11-Session-Expired`, `S11-NoNetwork`)
- **Email:** back → S01. "Sign in. No password. We'll email you a 6-digit code." Email field. **Send me a code** → code. Link "New here? Start a scan" → S01.
- **Unknown email / send failed:** see item 6 (decisions.md overrides the canvas text).
- **Code:** back → email. "Check your email. We sent a 6-digit code to {email}. It works for 10 minutes." Six digit boxes (paste and one-time-code autofill). **Sign in** → Home, last selected child, in the state that applies. **Resend code**, "Wrong email?" → email.
- **Code wrong or expired:** "This code is wrong or has expired." **Send a new code**, "Wrong email?". After 5 wrong tries the code is blocked.
- **Session expired:** no back arrow. "Please sign in again" with email prefilled. **Send me a code** → code; "Use a different email" → email. Then Home with the last selected child.
- **No network:** no back arrow. "You're offline." Cached size + setting for the selected child; all actions wait for the connection. **Try again** → Home (same child), or Sign in if the session ran out.

## Journey 3: fit check and rescan (core retention loop)

1. **W2** WhatsApp template, 6 weeks after delivery: "Hi Anna, does Emil's classic shoe still fit?" buttons **Still fits** / **Feels tight** (`WA-FitCheck`).
2. **Still fits** → **W3** free text "Great, we'll ask again in a few weeks." Nothing opens, no sign-in.
3. **Feels tight** → **W4** "Let's measure Emil again. It takes 2 minutes." + **Check Emil's size** → signed link (token, no sign-in) → S12 Home · fit check pending, child preselected.
4. Home → **Rescan now** → S14 intro → Footprint → Outcome A (same size, new setting, saved, S15 updates, next check queued), B (next size → S08 with colourway preselected → checkout) or C (error, try again).
5. Link expired → S11 sign-in, then back to S14 / Home in the same state.
6. Returning without a link: home-screen icon or sign-in → S12 Home.

Rules: no reply after 3 days → one reminder (W5), then silence. Several kids → one message per kid, on separate days. Max one message per parent per day. No messages 20:00–08:00. STOP ends all messages.

## Journey 4: seasonal nudge (winter boot; house shoe works the same)

1. **W6** marketing template: "Winter is on its way. Check Emil's size for the winter boot." + **Check size** → signed link → S12 Home · season nudge, child selected (`WA-Seasonal`). W7 = house shoe.
2. Home → **Scan for winter boots**: last scan under 6 weeks → S05 winter boot result (scan reused); otherwise S14 rescan first, then the winter boot result.
3. Or **Buy winter boots without scanning** → S08 Pick next size with the boot preselected.
4. S05 winter boot → **Buy the winter boot** → S08 → checkout, same as journey 1.

Rules: needs recorded marketing consent. Skipped if the winter boot was already bought for this child this season. Max one marketing message per 14 days, one message per day, none 20:00–08:00.

## Journey 5: share card, gift link, referral

Share entry points: Home "Gift & invite" card and header Share, the top bar Share on Growth/Shoes/Rescan, Account (after the first rescan), rescan results (outcomes A/B).

### S17 Share (`S17-Share-NameOn`, `S17-Share-NameOff`)
- Back → Home. Title "Gift & invite".
- Share card preview "{Name}'s perfect fit · EU 26 · setting · Classic shoe · sizeless-shoe.com". Toggle "Show {Name}'s name on the card" (off → "My little one's perfect fit"; the PWA itself still says the name). "Never on the card: photos, surname, birth date."
- **Gift link · for grandparents and friends** → share sheet → recipient opens S18.
- "Invite a friend · not tied to {Name}": **Invite a friend · you both get 25 €** → share sheet → recipient opens S19.
- Both buttons open the phone's share sheet; copy link is the fallback. Each link has a unique token.

### S18 Gift landing (`S18-Gift-Fresh`, `S18-Gift-Stale`)
- No login, no back arrow. Header logo + language toggle.
- "Anna shared Emil's size with you. A gift for Emil." Size + setting + "size taken on {date}", product image, colourway A/B/C, price.
- **Go to checkout** → Shopify checkout. The giver enters the shipping address; the order is tagged as a gift from Anna.
- **Stale (scan older than 8 weeks):** notice "Emil's feet may have grown… Ask Anna to check Emil's size again before you buy." + **Ask Anna to update the size**. Button becomes **Go to checkout anyway**.

### S19 Referral landing (`S19-Referral`)
- No login, no back arrow. "A tip from Anna. Anna invited you to Sizeless…" "25 € off your first pair · Applied automatically at checkout."
- **Start scan** → S12 Home · empty → S02 → scan → result → buy (journey 1). On desktop: S01 with referral banner → S02 → S21.
- Rules: both get 25 € (friend at checkout, Anna after the order ships). Self-referral blocked by matching email, phone and shipping address. Every link has a unique token so clicks, scans and orders trace back to the sharer.

## Desktop (1280 px)

Desktop is a comfortable second view; the scan always hands over to the phone.

- **Layout:** left sidebar Home, Growth, Shoes, Account (same routes as mobile), kid switcher on top, active item highlighted. Home, Growth, Shoes use two columns.
- **First visit:** D-S01 Start (Log in button top right; "What you need" says we hand over to the phone) → D-S02 Kid details ("Step 1 of 2"; name, birth month/year, "Which shoe?" Classic / Winter boot coming soon / House shoe coming soon; **Continue**) → **S21 Scan via our QR** (replaces S04).
- **S21 QR (`D-S21-QR`):** "Scan with your phone to measure {Name}'s feet". Our own QR code (not Footprint's) opens the PWA on the phone at the Scan intro (S03) with the child named and a session token. Steps: open camera, point at code, tap Start scan. "Or send the link to my phone": WhatsApp / Email + number field + **Send link** → Sent state.
- **S21 Link sent:** "Link sent to {masked number}", **Send again**, QR still valid. Switches to Waiting when the phone opens the link.
- **S21 Waiting:** "Waiting for {Name}'s scan… Phone connected." Link "Show the QR code again". Fallback after 10 min: "Finish on your phone".
- **S21 Finished:** result synced: size + setting + how-to-set picture, **Buy size EU 26**, **Rescan**. Same rules as S05. For a rescan, desktop shows outcome A, B or C here.
- **Any Rescan on desktop opens S21.**
- **D-S12 Home:** "Hi Anna", child card (shoe, colourway, delivered date, size + setting, next fit check), **Rescan {Name}'s feet** (opens S21), season card **Check size**, Gift & invite card, Growth card.
- **D-S15 Growth:** chart + table (Date, Age, Length / width, Size, Setting), toggle {Name} / Both kids, next fit check.
- **D-S16 Shoe history:** table with Shoe, Colourway, Size, Setting, Dates (setting and colourway are separate columns). Empty state "+ Buy {Name}'s first pair".
- **D-S11 Sign in, D-S13 Kid, D-S20 Account:** same content as mobile in the desktop frame.
- **D-S17 Share:** no native share sheet, so **Copy gift link** / **Copy invite link** are primary.
- **D-S18 Gift, D-S19 Referral:** as mobile.
- Out of the MVP (desktop flow map): returning to the desktop after the phone scan and a live waiting state. (This contradicts the S21 Waiting / Finished boards; see item 7.)

## Deep links and WhatsApp

| Link | Opens |
|---|---|
| W2 fit check → Still fits | W3 confirmation in WhatsApp, no login |
| W2 → Feels tight → W4 link | Home · fit check pending, child preselected |
| W6 / W7 season link | Home · season nudge, child preselected |
| Gift link | S18 gift landing, no login, then checkout |
| Invite link | S19, then Home · empty, scan, result, buy |
| Sign-in (email + code) | Home, last selected child |
| Expired link or WhatsApp in-app browser | Home · link expired, then sign-in |
| Session expired or offline too long | S11 sign in (email prefilled), code, then Home |

Every WhatsApp link carries a signed token and opens the PWA on Home with the right child selected and the dominant action shown. A deep link never lands on a deep screen without a back path to Home.

## Back targets (canvas, mobile)

See "Canvas vs decisions" item 1: inside a flow, back goes to the previous step.

| Screen | Back arrow goes to |
|---|---|
| Home (all states) | none (hub) |
| S01 Start, S18 Gift, S19 Referral | none (entry pages) |
| S02 Scan intro, first visit | S01 (Home · empty for invited parents) |
| S02 Add a child, S03 Scan intro known child | Home |
| S03 Scan not finished | S02 |
| S04 Footprint (close) | S03 via fpt-cancel |
| S05 Result (all states) | S02 |
| S06 How the setting works | S05 |
| S08 Choose colourway | S05 |
| S08 Pick next size | Home (the state it came from) |
| S09 Hand-off | S08 |
| S09 Shopify, S09 Return, S10 (both) | none (checkout must not reopen) |
| S07 WhatsApp reminders | S10 |
| S11 Sign in | S01 |
| S11 Code, code error | S11 Sign in |
| S11 No network, Session expired | none |
| S13 Add a child | Home |
| S13 Child details (edit) | Account |
| S14 Rescan intro, outcomes A/B/C | Home |
| S14 Footprint (close) | S14 Rescan intro |
| S05 Winter boot | Home · season nudge |
| S15 Growth | Home |
| S15 Growth · all kids | S15 Growth |
| S16 Shoes | Home |
| S16 Shoe detail | S16 Shoes |
| S17 Share, S20 Account | Home |
| S20 Invite a co-parent | Account |

Deep screens return to their parent; parents return to Home.

## WhatsApp messages

| ID | Type | Content | Opens |
|---|---|---|---|
| W1 | confirmation after opt-in | "Hi Anna, Emil's size is saved. We'll check in around {date}…" | nothing |
| W2 | template (likely utility), 6 weeks after delivery | "does Emil's classic shoe still fit?" Still fits / Feels tight | buttons |
| W3 | free text | "Great, we'll ask again in a few weeks." | nothing |
| W4 | free text | "Let's measure Emil again…" + Check Emil's size | Home · fit check pending |
| W5 | reminder | once, 3 days after no reply | |
| W6 / W7 | marketing template | winter boot / house shoe | Home · season nudge |

## Canvas vs decisions

Where they differ, decisions.md wins unless Linus decided otherwise. Linus answered the open items on 2026-10-08 (recorded in decisions.md).

1. **Back arrows (decided).** Inside a flow (scan, buy, checkout, sign-in, share, account), the back arrow goes to the previous step of that flow, as in the "Back targets" table; leaving the flow must never force a restart (for example a back arrow must not throw the parent from the result back to Home and make them rescan). Screens that are reached from Home (Growth, Shoes, Account, Share, Rescan intro, Pick next size) go back to Home. This replaces the "every back arrow goes to Home" line in decisions.md (app frame). Screens already built that go to Home too early (S06, S08, S09 hand-off) need a small follow-up.
2. **Home state order (decided: Claude's recommendation).** Use the canvas order: link expired > empty > fit check pending > rescan due (including last scan older than 6 months) > season nudge > no shoes yet > normal. Reason: it is the more complete list and the states rarely overlap. This replaces the order in decisions.md ("Home state order"), where "no shoes yet" came first.
3. **Scan age limits (decided).** All three limits from the canvas: under 6 weeks = a scan is reused (winter boot result, "Buy again in this size"; a child with no shoes whose scan is older must rescan before buying); about 8 weeks = skip-scan is demoted to a small link and the gift landing shows "may have grown"; over 6 months = Home shows "Rescan recommended". The 8-week number is still a placeholder to confirm.
4. **WhatsApp opt-in (decided).** Only after purchase (S10). The S05 "size too small" result must not offer WhatsApp; it offers "Measure again" and an email reminder instead (exact wording still to be drawn).
5. **Language toggle (decided: on hold).** The EN · DE toggle on the start screens (S01, S18, S19) is kept in the design but translation comes later. Build German only for now; no toggle yet.
6. **Unknown email on sign-in (decided).** Canvas shows "We couldn't find a profile for this email". decisions.md: unknown emails get the same answer as known ones. Follow decisions.md.
7. **Desktop waiting / finished (canvas contradicts itself).** The desktop flow map says the live waiting state is out of the MVP; the S21 Waiting and Finished boards show it. decisions.md says "result syncs back". Treat Waiting/Finished as in scope unless Linus says otherwise.
8. **Setting colour name (decided).** Canvas: Green. decisions.md: Turquoise (Türkis), #9ECACD. Follow decisions.md.
9. **S10 consent boxes (decided).** Canvas: a "Remind me on WhatsApp" button plus one optional marketing checkbox. decisions.md (WhatsApp consent): fit-check opt-in and marketing are two separate unticked choices, confirmed by sending the first WhatsApp message. Follow decisions.md.
