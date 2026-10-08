# Security and data rules (non-negotiable)

- Child data under GDPR: Supabase EU region, privacy policy, consent for WhatsApp fit checks and (separately) marketing, logged with text version and time (see decisions.md, "WhatsApp consent"), data export and deletion (Account > Your data), no PII in logs.
- Row-level security on EVERY table; a parent can only read their own children.
- Shopify admin token and WhatsApp token server-side only. No secrets in client code.
- Verify webhook signatures; rate-limit the email-code endpoint; signed one-time tokens in WhatsApp links.
- Validate all external input with Zod.
- Separate staging and production; pull requests only; CI runs lint, types, tests; Playwright e2e on the core path.
- Run Claude's security review per release; pay a human reviewer for a few hours before launch.
