-- NK Veli Vrh FC - Gallery Schema
-- Pokreni ovo u Supabase SQL Editoru (Dashboard → SQL Editor)

-- Albums table
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery items table
CREATE TABLE IF NOT EXISTS gallery_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  album_id TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'image' CHECK (type IN ('image', 'video')),
  src TEXT NOT NULL,
  caption TEXT,
  date DATE,
  tags TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read albums" ON albums FOR SELECT USING (true);
CREATE POLICY "Public read gallery_items" ON gallery_items FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Service role full access albums" ON albums USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access gallery_items" ON gallery_items USING (auth.role() = 'service_role');

-- ============================================================
-- POCETNI PODACI — postojeci albumi
-- ============================================================

INSERT INTO albums (id, title, description, cover_image_url, sort_order) VALUES
  ('events',         'Događaji i slavlja',    'Posebni događaji, proslave i klupska druženja',       'https://lsvgqsikuvtcuntpxhco.supabase.co/storage/v1/object/public/gallery/events/team-celebration.jpg', 1),
  ('matches',        'Utakmice',              'Fotografije s utakmica i službenih susreta',           NULL, 2),
  ('training',       'Treninzi',              'Treninzi seniorske i omladinske momčadi',              NULL, 3),
  ('infrastructure', 'Infrastruktura',        'Igralište, svlačionice i klupski sadržaji',            NULL, 4),
  ('awards',         'Nagrade i priznanja',   'Dodjele nagrada i posebna priznanja',                  NULL, 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Storage bucket: kreirati rucno u Supabase
-- Storage → New bucket → Name: "gallery" → Public: true
-- ============================================================
