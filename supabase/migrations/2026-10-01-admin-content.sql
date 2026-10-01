-- Admin: stožer, povijest kluba i tekstovi stranica
-- Pokreni u Supabase SQL Editoru. Seed generiran sa: npx tsx scripts/gen-content-seed.ts

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  since TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('founding', 'achievement', 'milestone', 'infrastructure')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Authenticated insert staff" ON staff FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update staff" ON staff FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete staff" ON staff FOR DELETE TO authenticated USING (true);

CREATE POLICY "Public read timeline_events" ON timeline_events FOR SELECT USING (true);
CREATE POLICY "Authenticated insert timeline_events" ON timeline_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update timeline_events" ON timeline_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete timeline_events" ON timeline_events FOR DELETE TO authenticated USING (true);

CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Authenticated insert site_content" ON site_content FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update site_content" ON site_content FOR UPDATE TO authenticated USING (true);

-- Seed: trenutni sadržaj stranice
INSERT INTO staff (first_name, last_name, role, image_url, since, sort_order) VALUES
  ('Ilija', 'Lovrić', 'Predsjednik', '/images/ilija-lovric.png', '2021', 1),
  ('Dalibor', 'Božac', 'Glavni trener', '/images/dalibor-bozac.png', '2025', 2),
  ('Alen', 'Žagrić', 'Uprava kluba', '/images/alen-zagric.png', '2020', 3),
  ('Marino', 'Brgić', 'Uprava kluba', '/images/marino-brgic.png', '2023', 4),
  ('Bruno', 'Bucci', 'Uprava kluba', '/images/bruno-bucci.png', '2019', 5);

INSERT INTO timeline_events (year, title, description, category, sort_order) VALUES
  (1972, 'Inicijativa i zemljište', 'Na inicijativu mjesne zajednice, SUBNOR-a i omladinske organizacije kreću pripreme za osnivanje kluba. Rješenjem općine Pula od 3. srpnja 1972. za igralište je određeno područje bivšeg kamenoloma i odlagališta otpada u centru naselja — mjesto današnjeg Tivolija, koje se zatim dvije godine uređivalo.', 'founding', 1),
  (1975, 'Osnivanje kluba', 'Na osnivačkoj skupštini 21. ožujka 1975. osnovan je NK Veli Vrh. Prvi predsjednik bio je Anton Bjažić, a prvi trener Bruno Krstulović. U prvoj upravi bili su Elvino Šuran, Giorgo Bucci, Mario Žufić, Vladimir Šešelja, Veljko Zgrablić, Denis Runko, Bruno Bucci, Željko Benčić i Bruno Lali.', 'founding', 2),
  (1975, 'Prva utakmica: 1:0', 'Klub ulazi u Međuopćinsku ligu Pula–Rovinj, a 14. rujna 1975. igra prvu prvenstvenu utakmicu — protiv NK Šišan, na posuđenom igralištu Fortin u Štinjanu jer Tivoli još nije bio gotov. Pobjeda 1:0 golom Rade Mandića.', 'milestone', 3),
  (1978, 'Prvi mlađi uzrasti', 'Formirani su juniori i pioniri, iako u tom rangu nisu bili obavezni. Kako se još nisu mogli natjecati, mlade igrače klub je ustupao NK Štinjanu, a kasnije NK Valbandonu.', 'milestone', 4),
  (1991, 'Kroz Domovinski rat', 'Najteže razdoblje u povijesti kluba — kronična besparica i teškoće oko okupljanja dovoljnog broja igrača. Unatoč svemu, rad kluba nije prestao ni jedne sezone.', 'milestone', 5),
  (1996, 'Škola nogometa i turnir', 'Rad s najmlađima podignut je na zavidnu razinu i pokrenuta je škola nogometa. U isto vrijeme rađa se tradicionalni lipanjski turnir za U-9 i U-11, nasljednik nekadašnjeg seniorskog turnira za Dan borca. Do 2015. prerastao je u međunarodni turnir s tridesetak ekipa i preko 400 djece.', 'milestone', 6),
  (2004, 'Dva ranga u dvije sezone', 'Sezonama 2002./03. i 2003./04. klub iz najnižeg ranga prolazi do 1. županijske lige — cilj je bio ući u rang koji omogućuje natjecanje mlađih kategorija. U godinama koje slijede juniori su dvije sezone bili najbolji u Istri, a pioniri u samom vrhu.', 'achievement', 7),
  (2010, 'Bronca u 1. ŽNL', 'U sezoni 2009./10. seniori zauzimaju 3. mjesto u 1. Županijskoj nogometnoj ligi Istarskoj — 45 bodova iz 26 utakmica uz gol-razliku 50:38.', 'achievement', 8),
  (2022, 'Prvi put u saveznom rangu', 'Sezone 2021./22. Veli Vrh prvi put u povijesti igra 4. NL NS Rijeka i osvaja 5. mjesto — iskorak iz županijskog u savezni rang natjecanja.', 'achievement', 9),
  (2023, 'Najbolji plasman u povijesti', 'U sezoni 2022./23. klub završava na 3. mjestu 4. NL NS Rijeka s 55 bodova (17-4-5) i gol-razlikom 57:31 — najveći sportski uspjeh u povijesti kluba. Stefan Antanasković zabio je 17, a Ismar Hairlahović 10 golova. Zbog nedostatnog omladinskog pogona klub nije mogao iskoristiti pravo na viši rang te se vraća u županijsko natjecanje.', 'achievement', 10),
  (2025, 'Pola stoljeća kluba', 'Klub obilježava 50 godina postojanja. Vodstvo preuzima predsjednik Ilija Lovrić, a seniorsku momčad trener Dalibor Božac — nekadašnji igrač Istre, Hajduka, Pomorca i Slaven Belupa te hrvatski U-21 reprezentativac. Županijska liga mijenja ime u Elitnu ligu NSŽI.', 'milestone', 11),
  (2026, 'Obnova Tivolija', 'U lipnju 2026. kreće potpuna rekonstrukcija igrališta vrijedna 830.000 eura — nova umjetna trava, sustav navodnjavanja, nove tribine pristupačne osobama s invaliditetom, ograda i klupe. U rujnu iste godine naselje dobiva Ulicu Veljka Zgrablića, nazvanu po osnivaču kluba koji je Velom Vrhu bio igrač, trener, predsjednik i član uprave.', 'infrastructure', 12);

INSERT INTO site_content (key, value) VALUES
  ('home_intro', '{"text":"NK Veli Vrh je nogometni klub iz istoimenog pulskog naselja, osnovan s ciljem okupljanja lokalne zajednice kroz ljubav prema najljepšoj igri. Kroz desetljeća postojanja, klub je izrastao u simbol upornosti, zajedništva i istarske nogometne tradicije."}'::jsonb),
  ('club_values', '{"items":[{"title":"Tradicija","body":"Klub ukorijenjen u pulskoj četvrti Veli Vrh, čuvar lokalne nogometne kulture kroz desetljeća."},{"title":"Zajednica","body":"Više od kluba — mjesto gdje se susreću generacije, obitelji i susjedi oko zajedničke strasti."},{"title":"Mladi naraštaji","body":"Ulaganje u razvoj mladih igrača, jer budućnost kluba počinje na omladinskim treninzima."}]}'::jsonb),
  ('about_overview', '{"subtitle":"Nogometni klub s dugom tradicijom i velikom strašću","paragraphs":["**NK Veli Vrh** osnovan je 21. ožujka 1975. u istoimenom pulskom naselju. Do tada na Velom Vrhu nije bilo pravog sportskog terena — igralo se na improviziranom igralištu na Monte Lešu i betonskoj ploči u Valamarinu, a klub je svoje igralište podigao na mjestu bivšeg kamenoloma.","Prvu utakmicu odigrali smo 14. rujna 1975. i pobijedili NK Šišan 1:0. Kroz pola stoljeća prošli smo put od međuopćinske lige do saveznog ranga, a najveći uspjeh ostvarili smo sezone 2022./23. trećim mjestom u 4. NL NS Rijeka.","Danas se natječemo u **Elitnoj ligi NSŽI**, najvišem rangu županijskog nogometa, s momčadima u svim uzrastima — od škole nogometa do veterana. Igralište Tivoli u obnovi je vrijednoj 830.000 eura."],"stats":[{"value":"150+","label":"Članova","description":"Aktivnih članova kluba"},{"value":"50+","label":"Godina","description":"Od 1975. do danas"}]}'::jsonb),
  ('stadium', '{"features":[{"value":"Stadion Tivoli","label":"Lokacija","description":"Veli Vrh, Pula — na mjestu bivšeg kamenoloma"},{"value":"100m × 64m","label":"Dimenzije","description":"Glavni teren"},{"value":"200 gledatelja","label":"Kapacitet","description":"Sjedeća mjesta"}],"facilities":["Glavni teren — u obnovi, nova umjetna trava i navodnjavanje","Nove tribine pristupačne osobama s invaliditetom","Dva pomoćna terena 40×20 m s umjetnom travom","Svlačionice za domaće i gostujuće ekipe","Prostor za suce i delegata"]}'::jsonb)
ON CONFLICT (key) DO NOTHING;
