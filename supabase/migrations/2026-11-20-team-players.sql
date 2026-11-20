-- Momčad koju uređuje admin (zamjenjuje igrače povučene s HNS Semafora).
-- HNS je zabranio automatsko preuzimanje podataka, pa se igrači sad unose ručno.
-- Pokreni u Supabase SQL Editoru. Treba is_admin() iz 2026-10-09-admin-whitelist.sql.

CREATE TABLE IF NOT EXISTS team_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  number INTEGER CHECK (number BETWEEN 1 AND 99),
  position TEXT CHECK (position IN ('Vratar', 'Obrana', 'Vezni red', 'Napad')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read team_players" ON team_players;
CREATE POLICY "Public read team_players" ON team_players FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write team_players" ON team_players;
CREATE POLICY "Admin write team_players" ON team_players
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Seed: seniori 2026./27. kako ih je zadnje objavio HNS Semafor (pozicije osim vratara HNS ne navodi)
INSERT INTO team_players (first_name, last_name, number, position)
SELECT * FROM (VALUES
  ('Filip', 'Vujica', 1, 'Vratar'),
  ('Lean', 'Smailbašić', 12, 'Vratar'),
  ('Samuel', 'Moscarda', 13, 'Vratar'),
  ('Matteo', 'Hrelja', 3, NULL),
  ('Emrah', 'Ćosić', 4, NULL),
  ('Ian', 'Halilović', 5, NULL),
  ('Đuro', 'Takač', NULL, NULL),
  ('Leonardo', 'Šuran', 6, NULL),
  ('Noa', 'Paris', 7, NULL),
  ('Karlo', 'Mardešić', 8, NULL),
  ('Andi', 'Sinčić', 9, NULL),
  ('Mihael', 'Maras', 10, NULL),
  ('Adrian', 'Žagrić', 11, NULL),
  ('Enver', 'Kunić', 14, NULL),
  ('Paolo', 'Belas', 17, NULL),
  ('Leonardo', 'Mario Kodnik', 18, NULL),
  ('Manuel', 'Brgić', NULL, NULL),
  ('Mauro', 'Grahovac', 19, NULL),
  ('Mateo', 'Lovrić', 20, NULL),
  ('Irian', 'Beviakva', 21, NULL),
  ('Dino', 'Kovač', 23, NULL),
  ('Martin', 'Vincent Marić', 27, NULL)
) AS seed(first_name, last_name, number, position)
WHERE NOT EXISTS (SELECT 1 FROM team_players);
