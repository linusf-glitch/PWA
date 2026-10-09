-- Return link after payment: the app puts a random token in the cart, the order webhook stores
-- only its hash here, and "Bestellung bestätigt" looks the order up by that hash (no login).
-- The token itself is never stored.
alter table public.orders add column return_token_hash text unique;
