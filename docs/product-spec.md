# Product spec

> Status: skeleton. The authoritative flow doc is in Claude Docs:
> https://claude.ai/code/artifact/ab6da151-2ac0-4749-9e37-3d590892eeb7
> It will be exported here once it is updated (see "Pending updates" below).

## Goal

Turn a one-time foot scan into a recurring cycle:
scan -> size + adjustment setting colour (green/yellow/red; the shoe's setting, NOT the colourway) -> buy via Shopify -> growth chart -> WhatsApp fit checks and seasonal nudges -> rescan -> share card / gift link / referral.

Out of MVP: subscription. In MVP: share card, gift link, referral.

## Pending updates to the flow doc

The flow doc is out of date on these points (decided since; see docs/decisions.md):

1. WhatsApp opt-in at S10 (after purchase), not on the Result screen.
2. Share / gift / referral only after a rescan.
3. Email-code sign-in (passwordless).
4. Own Scan intro screen + own desktop QR.
5. Skip-scan ("Buy next size without scanning") for returning parents.
6. Home structure option B (no bottom tab bar, Home as hub).
7. One scan mode only (a parent holds the phone).

## Journeys (summary)

1. **First scan and purchase:** Scan intro -> Footprint scan -> S05 Result -> Shopify checkout -> S10 order confirmed (profile saved, WhatsApp opt-in) -> Home.
2. **Fit check:** WhatsApp message after about 1.5 months (open: from delivery or order date). Thumbs up = confirmation, no login. Thumbs down = signed link -> Home in fit-check-pending state -> rescan.
3. **Rescan and growth:** new size + setting, growth chart, then share card / gift / referral prompt.
4. **Seasonal nudge:** winter boot, house shoe -> Home season state; Scan or "Buy next size".
5. **Share / gift / referral:** gift link with child's name and size. Recipients start anonymous; account created at purchase. Empty Home state for recipients without a child.

## Screens

| ID | Screen |
|---|---|
| — | Scan intro (new) |
| S05 | Result |
| S06 | Setting explanation |
| S10 | Order confirmed |
| S12 | Home (OneKid, SeveralKids, Nudge, Empty) |
| S13 | Add kid |
| S14 | Rescan |
| S15 | Growth (One, Several) |
| S16 | History (Several, Switcher) |
| S20 | Account (was Settings) |
| — | Sign-in, Code entry, Code expired/wrong (new) |
| — | Pick next size (skip-scan, new) |

## WhatsApp templates

W1 to W7, defined in the flow doc. To be copied here.

## Open questions

- Fit-check timing: from delivery or order date?
- Skip-scan window (8 weeks is a placeholder).
