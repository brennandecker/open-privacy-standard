BEGIN;
CREATE TABLE IF NOT EXISTS ops_purposes (
  tenant_id text NOT NULL,
  purpose_id text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  definition jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (tenant_id, purpose_id, version)
);
CREATE TABLE IF NOT EXISTS ops_choice_events (
  tenant_id text NOT NULL,
  id uuid NOT NULL,
  subject_id text NOT NULL,
  purpose_id text NOT NULL,
  purpose_version integer NOT NULL,
  revision integer NOT NULL CHECK (revision > 0),
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  receipt jsonb NOT NULL,
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, idempotency_key),
  UNIQUE (tenant_id, subject_id, purpose_id, revision),
  FOREIGN KEY (tenant_id, purpose_id, purpose_version)
    REFERENCES ops_purposes (tenant_id, purpose_id, version)
);
CREATE TABLE IF NOT EXISTS ops_preferences (
  tenant_id text NOT NULL,
  subject_id text NOT NULL,
  purpose_id text NOT NULL,
  event_id uuid NOT NULL,
  revision integer NOT NULL CHECK (revision > 0),
  PRIMARY KEY (tenant_id, subject_id, purpose_id),
  FOREIGN KEY (tenant_id, event_id) REFERENCES ops_choice_events (tenant_id, id)
);
-- The runtime never mutates history. Database administrators can still alter it.
CREATE OR REPLACE FUNCTION ops_reject_history_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'OPS history is append-only';
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS ops_events_append_only ON ops_choice_events;
CREATE TRIGGER ops_events_append_only BEFORE UPDATE OR DELETE ON ops_choice_events
  FOR EACH ROW EXECUTE FUNCTION ops_reject_history_mutation();
DROP TRIGGER IF EXISTS ops_purposes_append_only ON ops_purposes;
CREATE TRIGGER ops_purposes_append_only BEFORE UPDATE OR DELETE ON ops_purposes
  FOR EACH ROW EXECUTE FUNCTION ops_reject_history_mutation();
COMMIT;
