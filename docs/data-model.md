# Data model

> Status: skeleton. To be designed in backlog item 2 (Supabase schema v1). Nothing here is final.

Database: Supabase Postgres, EU region (Frankfurt). Row-level security on every table (see docs/security.md).

## Planned tables (v1)

| Table | Purpose | Notes |
|---|---|---|
| users | Parent account | Created from the first Shopify order (checkout email). |
| children | One row per child | Belongs to a user. Name, birth date/age. |
| measurements | Foot scan results | From Footprint: measurement_id, size, setting colour, date. |
| orders | Shopify orders | From the "order paid" webhook. Scan-based vs skip-scan. |
| shoes | Shoes bought per child | Model, size, setting colour, date. |
| notification_preferences | WhatsApp / email consent | Marketing consent recorded separately. |

## Open points

- Co-parent access (one child, two parents).
- Gift/referral recipients before they have an account.
