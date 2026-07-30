-- Phase 1: HNS data foundation
-- Pokreni u Supabase SQL Editoru (Dashboard → SQL Editor)

CREATE TABLE IF NOT EXISTS competitions (
  id BIGINT PRIMARY KEY,               -- HNS competitionID (cid)
  name TEXT NOT NULL,
  season TEXT NOT NULL,
  acat TEXT NOT NULL,
  category TEXT NOT NULL,
  is_cup BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE standings ADD COLUMN IF NOT EXISTS season TEXT NOT NULL DEFAULT '2025/2026';
ALTER TABLE standings ADD COLUMN IF NOT EXISTS competition_id BIGINT;
ALTER TABLE standings ADD COLUMN IF NOT EXISTS part TEXT NOT NULL DEFAULT '';
ALTER TABLE standings ADD COLUMN IF NOT EXISTS form TEXT NOT NULL DEFAULT '';
ALTER TABLE standings ADD COLUMN IF NOT EXISTS club_id BIGINT;
ALTER TABLE standings ADD COLUMN IF NOT EXISTS logo_url TEXT NOT NULL DEFAULT '';

-- matches: sync sada puni cijelu ligu; postojeći redovi se brišu (sync ih obnavlja)
TRUNCATE matches;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS season TEXT NOT NULL DEFAULT '2025/2026';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS competition_id BIGINT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS round INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS part TEXT NOT NULL DEFAULT '';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_veli_vrh BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_club_id BIGINT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_club_id BIGINT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_logo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_logo_url TEXT NOT NULL DEFAULT '';

ALTER TABLE players ADD COLUMN IF NOT EXISTS season TEXT NOT NULL DEFAULT '2025/2026';

CREATE TABLE IF NOT EXISTS scorers (
  competition_id BIGINT NOT NULL,
  season TEXT NOT NULL,
  person_id BIGINT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  club TEXT NOT NULL DEFAULT '',
  goals INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT NOT NULL DEFAULT '',
  player_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (competition_id, season, person_id)
);

CREATE TABLE IF NOT EXISTS match_details (
  match_id BIGINT PRIMARY KEY,         -- HNS matchId
  home_team TEXT NOT NULL DEFAULT '',
  away_team TEXT NOT NULL DEFAULT '',
  home_score INTEGER,
  away_score INTEGER,
  status TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  kickoff_at TEXT,
  attendance INTEGER,
  referees TEXT NOT NULL DEFAULT '',
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_lineups (
  match_id BIGINT NOT NULL,
  person_id BIGINT NOT NULL,
  team TEXT NOT NULL CHECK (team IN ('home','away')),
  team_name TEXT NOT NULL DEFAULT '',
  number INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  is_captain BOOLEAN NOT NULL DEFAULT FALSE,
  position TEXT NOT NULL DEFAULT '',
  photo_url TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (match_id, person_id)
);

CREATE TABLE IF NOT EXISTS match_events (
  id SERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL,
  person_id BIGINT NOT NULL DEFAULT 0,
  player_name TEXT NOT NULL DEFAULT '',
  team TEXT NOT NULL CHECK (team IN ('home','away')),
  minute INTEGER,
  type TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events (match_id);
CREATE INDEX IF NOT EXISTS idx_matches_category_season ON matches (category, season);
CREATE INDEX IF NOT EXISTS idx_standings_category_season ON standings (category, season);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorers ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read competitions" ON competitions FOR SELECT USING (true);
CREATE POLICY "Public read scorers" ON scorers FOR SELECT USING (true);
CREATE POLICY "Public read match_details" ON match_details FOR SELECT USING (true);
CREATE POLICY "Public read match_lineups" ON match_lineups FOR SELECT USING (true);
CREATE POLICY "Public read match_events" ON match_events FOR SELECT USING (true);

CREATE POLICY "Service role full access competitions" ON competitions USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access scorers" ON scorers USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access match_details" ON match_details USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access match_lineups" ON match_lineups USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access match_events" ON match_events USING (auth.role() = 'service_role');
