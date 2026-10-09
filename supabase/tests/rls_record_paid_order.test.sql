-- record_paid_order: only the server may call it; it is atomic and idempotent.
\set ON_ERROR_STOP on

insert into auth.users (id, email) values ('eeeeeeee-0000-0000-0000-000000000000', 'e@example.com');

select tests.as_user('eeeeeeee-0000-0000-0000-000000000000');
select tests.refused($$select public.record_paid_order('eeeeeeee-0000-0000-0000-000000000000', 'x1', '#1', 1, 'EUR', now(), 'Kid', 'fp-x', 25, 'yellow', 'M')$$, 'a parent cannot call record_paid_order');
select tests.as_anon();
select tests.refused($$select public.record_paid_order('eeeeeeee-0000-0000-0000-000000000000', 'x1', '#1', 1, 'EUR', now(), 'Kid', 'fp-x', 25, 'yellow', 'M')$$, 'an anonymous visitor cannot call record_paid_order');

set role service_role;
select tests.check(
  public.record_paid_order('eeeeeeee-0000-0000-0000-000000000000', 'ord-1', '#1001', 9999, 'EUR', now(), 'Emil', 'fp-e-1', 27, 'yellow', 'Sizeless Reef'),
  'first webhook records the order');
select tests.check(
  not public.record_paid_order('eeeeeeee-0000-0000-0000-000000000000', 'ord-1', '#1001', 9999, 'EUR', now(), 'Emil', 'fp-e-1', 27, 'yellow', 'Sizeless Reef'),
  'a repeated webhook does nothing');
select tests.check((select count(*) from public.orders where shopify_order_id = 'ord-1') = 1, 'one order');
select tests.check((select count(*) from public.children c join public.child_guardians g on g.child_id = c.id where g.user_id = 'eeeeeeee-0000-0000-0000-000000000000') = 1, 'one child with the parent as owner');
select tests.check((select count(*) from public.shoes s join public.orders o on o.id = s.order_id where o.shopify_order_id = 'ord-1' and s.size_eu = 27 and s.setting_colour = 'yellow' and s.measurement_id is not null) = 1, 'shoe linked to order and scan');

-- A second pair for the same child from the same scan reuses child and scan.
select tests.check(
  public.record_paid_order('eeeeeeee-0000-0000-0000-000000000000', 'ord-2', '#1002', 9999, 'EUR', now(), 'EMIL', 'fp-e-1', 27, 'yellow', 'Sizeless Galaxy'),
  'second order recorded');
select tests.check((select count(*) from public.children c join public.child_guardians g on g.child_id = c.id where g.user_id = 'eeeeeeee-0000-0000-0000-000000000000') = 1, 'same child reused (name match ignores case)');
select tests.check((select count(*) from public.measurements where footprint_measurement_id = 'fp-e-1') = 1, 'scan reused');

-- A skip-scan order (no measurement) is allowed.
select tests.check(
  public.record_paid_order('eeeeeeee-0000-0000-0000-000000000000', 'ord-3', '#1003', 9999, 'EUR', now(), 'Emil', null, 28, null, 'Sizeless Sprout'),
  'order without a scan recorded');
select tests.check((select purchase_type from public.orders where shopify_order_id = 'ord-3') = 'skip_scan', 'purchase type is skip_scan');
reset role;
\echo 'record_paid_order tests passed.'
