-- NK Veli Vrh FC - Supabase Schema
-- Pokreni ovo u Supabase SQL Editoru (Dashboard → SQL Editor)

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  number INTEGER,
  position TEXT,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  appearances INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  image_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standings table
CREATE TABLE IF NOT EXISTS standings (
  id SERIAL PRIMARY KEY,
  position INTEGER NOT NULL,
  team TEXT NOT NULL,
  played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  date TEXT,
  opponent TEXT,
  home_team TEXT,
  away_team TEXT,
  home_score INTEGER,
  away_score INTEGER,
  competition TEXT,
  status TEXT CHECK (status IN ('played', 'upcoming', 'postponed')),
  venue TEXT CHECK (venue IN ('home', 'away')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync log table (prati kada je zadnji put scraped)
CREATE TABLE IF NOT EXISTS sync_log (
  id SERIAL PRIMARY KEY,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  players_count INTEGER DEFAULT 0,
  standings_count INTEGER DEFAULT 0,
  matches_count INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anon key)
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read standings" ON standings FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read sync_log" ON sync_log FOR SELECT USING (true);

-- Allow service role full access (for cron job)
CREATE POLICY "Service role full access players" ON players USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access standings" ON standings USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access matches" ON matches USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access sync_log" ON sync_log USING (auth.role() = 'service_role');
