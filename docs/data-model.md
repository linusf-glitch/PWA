# Data model

> Status: schema v1 written as SQL in `supabase/migrations/` (backlog item 2). Not applied to any real Supabase project yet.

Database: Supabase Postgres, EU region (Frankfurt). Row-level security on every table (see docs/security.md).

## Tables (v1)

| Table | Purpose | Notes |
|---|---|---|
| profiles | Parent account (the "users" table) | 1:1 with Supabase `auth.users`; created automatically on sign-up. Holds email, display name, Shopify customer id. |
| children | One row per child | Name, birth date. Has no owner column: access goes through `child_guardians`. |
| child_guardians | Which parent may see which child | `owner` or `co_parent`. Makes co-parent access (one child, two parents) work without changes later. |
| measurements | Foot scan results from Footprint | Footprint measurement id (unique), left/right length, recommended EU size, setting colour (green/yellow/red), scan time. |
| orders | Shopify orders from the "order paid" webhook | Belongs to a parent. Scan-based or skip-scan. Shopify order id is unique, so a repeated webhook cannot create a duplicate. |
| shoes | Shoes bought per child | Model, size, setting colour, purchase time. Links to the order and the scan it came from. |
| notification_preferences | WhatsApp / email consent | One row per parent. Fit checks and marketing are separate switches. The database stamps the consent time, the app cannot set it. |

`setting_colour` is the shoe's adjustment setting, never the colourway.

## Who can do what

- **Parents (signed in)** can read their own profile, their own orders, their own preferences, and the children they are a guardian of with those children's measurements and shoes. They can edit their display name, their child's name and birth date, and their notification switches. Nothing else.
- **The server (service role)** writes everything else: new children and guardians, scan results, orders, shoes. These come from the Shopify webhook and the Footprint result handler, never from the browser.
- **Signed-out visitors** can read nothing.
- Parents cannot delete rows directly. Data export and deletion (backlog item 13) will be a server function.

## Tests

`npm run test:db` is not available yet on this branch; run `./scripts/test-db.sh`. It starts a throwaway local Postgres, applies the migrations and runs `supabase/tests/rls.test.sql`. It proves, among other things, that parent A cannot read or change parent B's children, scans, shoes, orders, profile or preferences. CI runs it on every change under `supabase/`. `supabase/tests/00_supabase_stub.sql` imitates the parts of Supabase the migration needs (roles, `auth.users`, `auth.uid()`) and is for local tests only.

## Open points

- Gift/referral recipients before they have an account (backlog item 12; not in v1).
- Data export and delete flow (backlog item 13).
- Exact Footprint result fields: confirm against their API when integrating (backlog item 6).
- Co-parent invite flow is not built; the table supports it.
