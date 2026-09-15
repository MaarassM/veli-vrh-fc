-- Sudačka nadoknada: "90+1" se sprema kao minute=90, minute_extra=1
-- Pokreni u Supabase SQL Editoru
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS minute_extra INTEGER;
