-- Admin panel: sponzori, RLS za pisanje (authenticated), storage bucket "media"
-- Pokreni u Supabase SQL Editoru

-- Sponzori
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read sponsors" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Authenticated insert sponsors" ON sponsors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update sponsors" ON sponsors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete sponsors" ON sponsors FOR DELETE TO authenticated USING (true);

-- Galerija: prijavljeni admin smije pisati (javno čitanje već postoji)
CREATE POLICY "Authenticated insert albums" ON albums FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update albums" ON albums FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete albums" ON albums FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated insert gallery_items" ON gallery_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update gallery_items" ON gallery_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete gallery_items" ON gallery_items FOR DELETE TO authenticated USING (true);

-- Storage bucket "media" (javno čitanje, authenticated pisanje)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated upload media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
CREATE POLICY "Authenticated update media" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media');
CREATE POLICY "Authenticated delete media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media');
