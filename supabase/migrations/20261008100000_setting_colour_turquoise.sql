-- The shoe's first adjustment setting is turquoise, not green (Linus, 2026-10-08).
-- Scale: turquoise (smallest), yellow, red (largest). Renaming the enum value keeps
-- every existing row and the order of the values; no data change is needed.
alter type public.setting_colour rename value 'green' to 'turquoise';
