-- =====================================================================
-- Nuae backend — initial schema
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── External reservations ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS external_reservations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source              TEXT NOT NULL CHECK (source IN ('minimo','hpb','line','direct')),
  external_id         TEXT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('new','modified','cancelled')),
  customer_name       TEXT,
  customer_kana       TEXT,
  customer_phone      TEXT,
  customer_email      TEXT,
  start_at            TIMESTAMPTZ,
  end_at              TIMESTAMPTZ,
  menu_text           TEXT,
  staff_text          TEXT,
  amount              INTEGER,
  matched_customer_id UUID,
  raw_text            TEXT,
  warnings            JSONB NOT NULL DEFAULT '[]'::jsonb,
  ingested_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT external_reservations_source_extid UNIQUE (source, external_id)
);

CREATE INDEX IF NOT EXISTS ix_extres_start_at ON external_reservations(start_at);
CREATE INDEX IF NOT EXISTS ix_extres_source   ON external_reservations(source);
CREATE INDEX IF NOT EXISTS ix_extres_status   ON external_reservations(status);

-- ─── Failed messages (parser couldn't extract) ──────────────────────
CREATE TABLE IF NOT EXISTS failed_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source       TEXT,
  reason       TEXT NOT NULL,
  raw_subject  TEXT,
  raw_from     TEXT,
  raw_text     TEXT,
  failed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_failed_failed_at ON failed_messages(failed_at);

-- ─── Integration status (per platform) ──────────────────────────────
CREATE TABLE IF NOT EXISTS integration_status (
  id              TEXT PRIMARY KEY,
  display_name    TEXT NOT NULL,
  connected       BOOLEAN NOT NULL DEFAULT false,
  account_id      TEXT,
  last_sync_at    TIMESTAMPTZ,
  last_error      TEXT,
  config          JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO integration_status (id, display_name) VALUES
  ('minimo',     'minimo'),
  ('hpb',        'ホットペッパー'),
  ('nailie',     'ネイリー'),
  ('line',       'LINE公式'),
  ('google',     'Googleビジネス'),
  ('instagram',  'Instagram')
ON CONFLICT (id) DO NOTHING;

-- ─── Migration log ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schema_migrations (
  version    TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
