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

### Return link after payment (the way back from Shopify)
- The app puts a random token in the cart (line property `_return_token`; the underscore hides it from the customer in checkout). The order webhook stores only its SHA-256 hash in `orders.return_token_hash`. `GET /api/order-return?t=<token>` (`api/order-return.ts`) finds the order by that hash and returns only child first name, size, setting and product, for 30 days after payment. The app page is `/return?t=<token>` (public, no login; shows "Bestellung bestätigt").
- Shopify side, order confirmation email (Settings > Notifications > Customer notifications > Order confirmation > Edit code), add a button where it suits: `{% for line in line_items %}{% if line.properties._return_token %}<a href="https://pwa-amber-three.vercel.app/return?t={{ line.properties._return_token }}">Zu Sizeless</a>{% endif %}{% endfor %}` (replace the host with app.sizeless-shoe.com once it points at Vercel). The thank-you page button needs a checkout UI extension (next step; Basic plan allows it).

## WhatsApp

- WhatsApp Business API through a provider (Twilio or 360dialog).
- Start Meta business verification early (long lead time).
- Template approval needed. W2/W5 likely "utility", but Meta decides the category.
- Quick-reply buttons; template messages outside the 24-hour window; email fallback.
- Consent: one opt-in for fit checks + rescan reminders, a separate optional one for offers. The parent types their number (or email) on S10; we log a `requested` row and send one confirmation message; consent counts after the parent replies JA (or clicks the email link), logged as `confirmed`. Built so far: the S10 form, `POST /api/consent-request` (`api/consent-request.ts`, identified by the return-link token, validates Zod, writes `consent_log` rows). Not built: sending the confirmation (needs the WhatsApp provider and an email sender), the JA/link handling, STOP, Account > WhatsApp. Never import phone numbers from Shopify for WhatsApp.
- Opt-out: STOP reply and the stop button on marketing templates turn messages off at once; confirm once, then send nothing more.
- Message text: child's first name and a signed link only; no sizes or scan data (Meta processes the content).
- Meta and the provider are processors: data processing agreement with the provider, Meta's WhatsApp Business terms, both named in the privacy policy.
- Every link carries a signed one-time token and opens Home with the right child selected.
