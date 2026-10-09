-- record_paid_order now also takes the child's birth date (first of the birth month, from the
-- first-visit form). A new child gets it; a known child without one is filled in, never overwritten.

drop function public.record_paid_order(uuid, text, text, integer, char, timestamptz, text, text, numeric, public.setting_colour, text);

create function public.record_paid_order(
  p_user_id uuid,
  p_shopify_order_id text,
  p_order_number text,
  p_total_minor integer,
  p_currency char(3),
  p_paid_at timestamptz,
  p_kid_name text,
  p_footprint_measurement_id text,
  p_size_eu numeric,
  p_setting public.setting_colour,
  p_model text,
  p_birth_date date default null
) returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_order uuid;
  v_child uuid;
  v_measurement uuid;
begin
  insert into public.orders (user_id, shopify_order_id, shopify_order_number, purchase_type, total_minor_units, currency, paid_at)
  values (p_user_id, p_shopify_order_id, p_order_number,
          case when p_footprint_measurement_id is null then 'skip_scan' else 'scan' end::public.purchase_type,
          p_total_minor, p_currency, p_paid_at)
  on conflict (shopify_order_id) do nothing
  returning id into v_order;
  if v_order is null then
    return false;
  end if;

  select c.id into v_child
  from public.children c
  join public.child_guardians g on g.child_id = c.id
  where g.user_id = p_user_id and lower(c.name) = lower(p_kid_name)
  limit 1;
  if v_child is null then
    insert into public.children (name, birth_date) values (p_kid_name, p_birth_date) returning id into v_child;
    insert into public.child_guardians (child_id, user_id, role) values (v_child, p_user_id, 'owner');
  elsif p_birth_date is not null then
    update public.children set birth_date = p_birth_date where id = v_child and birth_date is null;
  end if;

  if p_footprint_measurement_id is not null then
    -- Buying a second pair from the same scan reuses the scan.
    insert into public.measurements (child_id, footprint_measurement_id, recommended_size_eu, setting_colour, scanned_at)
    values (v_child, p_footprint_measurement_id, p_size_eu, p_setting, p_paid_at)
    on conflict (footprint_measurement_id) do update set footprint_measurement_id = excluded.footprint_measurement_id
    returning id into v_measurement;
  end if;

  insert into public.shoes (child_id, order_id, measurement_id, model, size_eu, setting_colour, purchased_at)
  values (v_child, v_order, v_measurement, p_model, p_size_eu, p_setting, p_paid_at);
  return true;
end;
$$;

-- Parents (and anonymous visitors) must never call this: it writes for any user.
revoke all on function public.record_paid_order(uuid, text, text, integer, char, timestamptz, text, text, numeric, public.setting_colour, text, date) from public, anon, authenticated;
grant execute on function public.record_paid_order(uuid, text, text, integer, char, timestamptz, text, text, numeric, public.setting_colour, text, date) to service_role;
