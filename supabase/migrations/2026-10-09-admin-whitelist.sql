-- Pisanje po sadržaju smije samo korisnik s popisa admina.
-- Dosad je smio svaki prijavljeni korisnik, a registracija je otvorena — znači
-- bilo tko je mogao otvoriti račun i mijenjati galeriju, sponzore i tekstove.
-- Pokreni u Supabase SQL Editoru.

CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin reads own row" ON admins;
CREATE POLICY "Admin reads own row" ON admins
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Postojeći računi ostaju admini; nove se dodaje ručno INSERT-om u ovu tablicu.
INSERT INTO admins (user_id, email)
SELECT id, email FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- SECURITY DEFINER jer obični korisnik ne smije čitati cijelu tablicu admins.
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN
  LANGUAGE sql SECURITY DEFINER STABLE
  SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
$$;

-- Javno čitanje ostaje netaknuto (politike "Public read ..." i dalje vrijede).
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['sponsors', 'albums', 'gallery_items', 'staff', 'timeline_events', 'site_content']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated insert %1$s" ON %1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated update %1$s" ON %1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated delete %1$s" ON %1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin write %1$s" ON %1$I', t);
    EXECUTE format(
      'CREATE POLICY "Admin write %1$s" ON %1$I FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin())',
      t
    );
  END LOOP;
END $$;

-- Storage bucket "media"
DROP POLICY IF EXISTS "Authenticated upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete media" ON storage.objects;

DROP POLICY IF EXISTS "Admin upload media" ON storage.objects;
CREATE POLICY "Admin upload media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND is_admin());
DROP POLICY IF EXISTS "Admin update media" ON storage.objects;
CREATE POLICY "Admin update media" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media' AND is_admin());
DROP POLICY IF EXISTS "Admin delete media" ON storage.objects;
CREATE POLICY "Admin delete media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media' AND is_admin());
