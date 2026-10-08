#!/usr/bin/env bash
# Runs the database migrations and RLS tests against a throwaway local
# Postgres. Never touches a real Supabase project.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="${PG_BIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
if [ ! -x "$BIN/initdb" ]; then
  echo "Postgres not found. Install PostgreSQL 15+ or set PG_BIN to its bin folder." >&2
  exit 1
fi

TMP="$(mktemp -d)"
chmod 755 "$TMP"
RUN=()
# initdb refuses to run as root; use the postgres system user in that case.
if [ "$(id -u)" = 0 ]; then
  chown postgres "$TMP"
  RUN=(runuser -u postgres --)
fi
cleanup() { "${RUN[@]}" "$BIN/pg_ctl" -D "$TMP/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$TMP"; }
trap cleanup EXIT

"${RUN[@]}" "$BIN/initdb" -D "$TMP/data" -U postgres -A trust >/dev/null
"${RUN[@]}" "$BIN/pg_ctl" -D "$TMP/data" -o "-k $TMP -c listen_addresses=''" -l "$TMP/log" -w start >/dev/null

PSQL=("${RUN[@]}" "$BIN/psql" -h "$TMP" -U postgres -d postgres -X -q -v ON_ERROR_STOP=1)
"${PSQL[@]}" -f "$ROOT/supabase/tests/00_supabase_stub.sql"
for f in "$ROOT"/supabase/migrations/*.sql; do
  "${PSQL[@]}" -f "$f"
done
for f in "$ROOT"/supabase/tests/*.test.sql; do
  echo "== $(basename "$f")"
  "${PSQL[@]}" -f "$f"
done
