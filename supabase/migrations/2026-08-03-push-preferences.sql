-- Push preferencije: kategorije + vrste obavijesti; marker za podsjetnike
-- Pokreni u Supabase SQL Editoru

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS categories TEXT[] NOT NULL DEFAULT ARRAY['seniori'],
  ADD COLUMN IF NOT EXISTS notify_results BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_reminders BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN NOT NULL DEFAULT FALSE;
