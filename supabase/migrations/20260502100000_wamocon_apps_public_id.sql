-- ============================================================================
-- Migration: opaque public_id for wamocon_apps
-- ----------------------------------------------------------------------------
-- Security goal: do NOT expose internal UUID primary keys in user-facing URLs.
-- A short, URL-safe, opaque token (~72 bits of entropy) is added as `public_id`
-- and used in the route `/wamocon-app/[publicId]`.
--
-- The internal UUID stays the primary key and the foreign-key target — it just
-- never appears in URLs anymore.
--
-- Properties of the generated token:
--   - 12 characters, base64-url alphabet ([A-Za-z0-9_-])
--   - ~72 bits of entropy (collision-resistant for our scale)
--   - cryptographically random (pgcrypto.gen_random_bytes)
--   - DB-side default so future inserts auto-generate one
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 12-char URL-safe random token. VOLATILE so the column DEFAULT re-evaluates
-- per row.
CREATE OR REPLACE FUNCTION generate_short_id() RETURNS TEXT
LANGUAGE plpgsql VOLATILE AS $$
DECLARE
  raw  TEXT;
BEGIN
  raw := translate(encode(gen_random_bytes(9), 'base64'), '+/=', '-_X');
  RETURN substring(raw FROM 1 FOR 12);
END;
$$;

ALTER TABLE wamocon_apps
  ADD COLUMN IF NOT EXISTS public_id TEXT;

-- Backfill existing rows.
UPDATE wamocon_apps
   SET public_id = generate_short_id()
 WHERE public_id IS NULL;

ALTER TABLE wamocon_apps
  ALTER COLUMN public_id SET NOT NULL,
  ALTER COLUMN public_id SET DEFAULT generate_short_id();

CREATE UNIQUE INDEX IF NOT EXISTS wamocon_apps_public_id_uidx
  ON wamocon_apps(public_id);
