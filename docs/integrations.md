# Integrations

## Footprint Technologies (foot scan)

- Script + `<div data-widget="fpt-button">` with data attributes (article number, name, image, price, session ID).
- Window DOM events: `fpt-add-to-cart`, `fpt-back-to-shop`, `fpt-cancel`.
  Payload: `{matching_id?, measurement_id, session_id?, size, error_code?, article_number}`.
- Saving the profile and desktop return need custom integration.
- Footprint has a native QR handoff; we want our own QR instead (open question to Footprint: can theirs be disabled or replaced?).
- Confirmed: the widget runs inside the installed PWA, including iPhone standalone.
- One shoe last included; winter boot and house shoe need extra lasts.
- Contact: Dr. Matthias Brendel.

## Shopify

- Shopify stays the system for products, checkout, orders, customers.
- The PWA puts the size in a cart through the Storefront API and redirects to checkout.
- "Order paid" webhook (verify the HMAC signature) creates the account + child profile. Built in `api/shopify-order-paid.ts` (logic in `server/order-webhook.ts`): checks the signature, ignores orders without the app's cart attributes (size, setting, measurement_id, kid_name), creates the auth user from the order email (or finds it), then calls the database function `record_paid_order` (one transaction, idempotent on the Shopify order id). Server-only Vercel env variables: `SHOPIFY_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` (plus `SUPABASE_URL`, the Supabase project URL; `VITE_SUPABASE_URL` also works but is only needed when the browser app should use Supabase too, so prefer `SUPABASE_URL` while the app still runs in demo mode). Shopify side: Settings > Notifications > Webhooks > Create webhook, event "Order payment", format JSON, URL `https://<app domain>/api/shopify-order-paid`; the signing secret shown there is `SHOPIFY_WEBHOOK_SECRET`.
- Sign-in: check the Shopify Customer Account API first; fallback is Supabase Auth email OTP.

## WhatsApp

- WhatsApp Business API through a provider (Twilio or 360dialog).
- Start Meta business verification early (long lead time).
- Template approval needed. W2/W5 likely "utility", but Meta decides the category.
- Quick-reply buttons; template messages outside the 24-hour window; email fallback.
- Consent: one opt-in for fit checks + rescan reminders, a separate optional one for offers. The parent sends the first message (click-to-WhatsApp, pre-filled code links the number to the account). Never import phone numbers from Shopify for WhatsApp.
- Opt-out: STOP reply and the stop button on marketing templates turn messages off at once; confirm once, then send nothing more.
- Message text: child's first name and a signed link only; no sizes or scan data (Meta processes the content).
- Meta and the provider are processors: data processing agreement with the provider, Meta's WhatsApp Business terms, both named in the privacy policy.
- Every link carries a signed one-time token and opens Home with the right child selected.
