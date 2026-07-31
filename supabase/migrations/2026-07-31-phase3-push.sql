-- Faza 3: Web push pretplate
-- Pokreni u Supabase SQL Editoru

CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Nema javnog čitanja — endpointi su osobni podaci.
-- Upis/brisanje ide isključivo kroz service role (API funkcije).
CREATE POLICY "Service role full access push_subscriptions"
  ON push_subscriptions USING (auth.role() = 'service_role');
