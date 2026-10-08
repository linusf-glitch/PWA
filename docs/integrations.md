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
- "Order paid" webhook (verify the HMAC signature) creates the account + child profile.
- Sign-in: check the Shopify Customer Account API first; fallback is Supabase Auth email OTP.

## WhatsApp

- WhatsApp Business API through a provider (Twilio or 360dialog).
- Start Meta business verification early (long lead time).
- Template approval needed. W2/W5 likely "utility", but Meta decides the category.
- Quick-reply buttons; template messages outside the 24-hour window; consent for marketing messages; email fallback.
- Every link carries a signed one-time token and opens Home with the right child selected.
