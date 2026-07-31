# Faza 2 — Nove stranice (utakmice, momčad, statistika, kategorije, galerija, klub) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Izgraditi stranice koje prikazuju podatke Faze 1 (raspored, izvještaji utakmica, momčad, statistika) te aktivirati galeriju, obogatiti O klubu, dodati /postani-clan i sponzore.

**Architecture:** Vite SPA (React 19 + react-router 7). Svaka stranica = ruta u `src/App.tsx` + stranica u `src/pages/` + hookovi u `src/hooks/` koji zovu postojeće Vercel API-je (`/api/matches`, `/api/match?id=`, `/api/scorers`, `/api/players`, `/api/standings`). Stil prati postojeći dizajn (Tailwind 4, narančasta `orange-500`, `var(--font-display)`, motion animacije, skeleton loaderi).

**Tech Stack:** React 19, react-router 7, Tailwind 4, motion/react, lucide-react, vitest (za čiste helpere).

## Global Constraints

- Sav tekst na hrvatskom; rute na hrvatskom (`/utakmice`, `/momcad`, `/statistika`, `/postani-clan`, `/galerija`)
- Svaka stranica ima `<SEO title description canonicalPath>` (postojeća komponenta `src/components/seo/SEO.tsx`)
- API response oblik: `{ data: T, fetchedAt: string }` — hookovi čitaju `result.data`
- Kategorije ključevi: `seniori | juniori | pioniri | mladi-pioniri | u-11 | u-9 | veterani`
- Prije svakog commita: `npm test && npm run build` moraju proći
- Ne dirati Fazu 1 (lib/hns, api/cron) osim ako task izričito kaže
- YAGNI: bez novih npm paketa

---

### Task 1: Rute i navigacija

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/data/navigation.ts`
- Modify: `src/components/navbar/Navbar.tsx` (samo ako treba za dropdown)
- Modify: `public/sitemap.xml`

**Interfaces:**
- Produces: rute `/utakmice`, `/utakmice/:id`, `/momcad`, `/statistika`, `/kategorije/:kat?`, `/galerija`, `/postani-clan` — sve kasnije taskove
- Placeholder stranice: svaki page file iz kasnijih taskova ovdje se kreira kao minimalni stub (`<div>...</div>`) da build prolazi

- [ ] **Step 1:** U `src/App.tsx` dodaj rute (stubovi za nove stranice u `src/pages/`: `UtakmicePage.tsx`, `UtakmicaDetaljPage.tsx`, `MomcadPage.tsx`, `StatistikaPage.tsx`, `PostaniClanPage.tsx`; `GalleryPage.tsx` postoji):

```tsx
{ path: 'utakmice', element: <UtakmicePage /> },
{ path: 'utakmice/:id', element: <UtakmicaDetaljPage /> },
{ path: 'momcad', element: <MomcadPage /> },
{ path: 'statistika', element: <StatistikaPage /> },
{ path: 'kategorije/:kat?', element: <KategorijaPage /> },
{ path: 'galerija', element: <GalleryPage /> },
{ path: 'postani-clan', element: <PostaniClanPage /> },
```

- [ ] **Step 2:** `src/data/navigation.ts` — novi redoslijed: Početna, Utakmice (`/utakmice`), Momčad (`/momcad`), Kategorije, Statistika (`/statistika`), Novosti, Galerija (`/galerija`), Kontakt. (`O klubu`, `Stručni stožer`, `Postani član` idu u footer + O klubu ostaje u navigaciji ako stane — provjeri kako Navbar lomi na mobitelu; ako je pretrpano, izbaci Statistiku iz glavne navigacije, ona je linkana s Utakmica.)
- [ ] **Step 3:** `public/sitemap.xml` — dodaj nove URL-ove (utakmice, momcad, statistika, galerija, postani-clan, kategorije/juniori itd.)
- [ ] **Step 4:** `npm run build` prolazi; dev preview: sve rute otvaraju stub bez crasha
- [ ] **Step 5:** Commit `feat: routes and navigation for phase 2 pages`

### Task 2: Hook useMatchList + helper groupByRound (TDD)

**Files:**
- Create: `src/hooks/useMatchList.ts`
- Create: `src/lib/matches.ts` (čisti helperi)
- Test: `tests/web/matches-helpers.test.ts`

**Interfaces:**
- Produces: `useMatchList(category: string, competition: 'liga'|'kup'|'sve', all: boolean)` → `{ matches: MatchItem[], loading, error }`
- `MatchItem`: `{ id: string, matchId: number|null, date: string, time: string|null, round: number|null, homeTeam, awayTeam, homeScore, awayScore, competition, status, venue, isVeliVrh: boolean }` (mapira `/api/matches` polja: `home_team`→`homeTeam` već radi API)
- `groupByRound(matches: MatchItem[]): Array<{ round: number|null, matches: MatchItem[] }>` — sortirano uzlazno, null runde na kraj
- `nextMatch(matches: MatchItem[]): MatchItem|null` — prva `upcoming` po datumu; `lastPlayed(matches)` — zadnja `played`

- [ ] **Step 1:** Napiši failing test `tests/web/matches-helpers.test.ts` za `groupByRound`, `nextMatch`, `lastPlayed` (fixture: 4 utakmice, 2 runde, jedna bez runde, jedna upcoming)
- [ ] **Step 2:** `npx vitest run tests/web` → FAIL (modul ne postoji)
- [ ] **Step 3:** Implementiraj `src/lib/matches.ts`; `useMatchList` po uzoru na `useKategorija` (fetch `/api/matches?category=X&all=0|1&competition=liga|kup`, bez parametra kad je 'sve')
- [ ] **Step 4:** Testovi prolaze; build prolazi
- [ ] **Step 5:** Commit `feat: match list hook and round-grouping helpers`

### Task 3: Stranica /utakmice

**Files:**
- Create: `src/pages/UtakmicePage.tsx` (zamijeni stub)
- Create: `src/components/utakmice/MatchCard.tsx`
- Create: `src/components/utakmice/RoundSection.tsx`

**Interfaces:**
- Consumes: `useMatchList`, `groupByRound`, `nextMatch` iz Taska 2
- MatchCard: prikazuje datum+vrijeme, imena klubova (Veli Vrh **bold**), rezultat ili "-:-", badge lige/kupa; ako `matchId` nije null i status `played` → `<Link to={'/utakmice/'+matchId}>`

**Dizajn:** header kao KategorijaPage (naslov + tab strip kategorija), ispod toga segmented control Liga/Kup/Sve + toggle "Samo Veli Vrh / Cijela liga". Runde kao sekcije `X. kolo`. Auto-scroll na aktualno kolo (`ref` + `scrollIntoView` na prvoj rundi s upcoming utakmicom).

- [ ] **Step 1:** Implementiraj komponente (skeleton loading kao u KategorijaPage; prazno stanje "Nema utakmica")
- [ ] **Step 2:** Build + preview: provjeri seniori/liga prikaz, prebaci na Kup, na drugu kategoriju, klik na odigranu utakmicu vodi na `/utakmice/{id}` (stub)
- [ ] **Step 3:** Commit `feat: utakmice page with rounds, competition filter and category tabs`

### Task 4: Stranica /utakmice/:id (izvještaj)

**Files:**
- Create: `src/hooks/useMatch.ts`
- Create: `src/pages/UtakmicaDetaljPage.tsx` (zamijeni stub)
- Create: `src/components/utakmice/MatchEvents.tsx`
- Create: `src/components/utakmice/MatchLineups.tsx`

**Interfaces:**
- Consumes: `/api/match?id={matchId}` → `{ data: { info, lineups, events } }` (oblik vidi u `api/match.ts`: info ima homeTeam/awayTeam/homeScore/awayScore/kickoffAt/attendance/referees/venue; events imaju personId/playerName/team('home'|'away')/minute/type('goal'|'yellow'|'red'|'sub_in'|'sub_out'|...)/label; lineups imaju team/teamName/number/name/isCaptain/position/photoUrl)
- `useMatch(id: string)` → `{ match, loading, error }`

**Dizajn:** hero traka s klubovima i rezultatom (kao NextMatchBanner stil), ispod: mjesto/vrijeme/gledatelji/suci; events kao vertikalna vremenska crta (minuta + ikona ⚽/🟨/🟥 lucide ikone Goal→`CircleDot`, kartoni obojeni `Square`); lineups dvije kolone (home/away), kapetan označen (C). 404 → poruka + link natrag.

- [ ] **Step 1:** Implementiraj hook i komponente
- [ ] **Step 2:** Build + preview: otvori utakmicu koja ima detalje u bazi (provjeri `match_details` tablicu — sync ih puni 5 po runu), fallback poruka za utakmicu bez detalja
- [ ] **Step 3:** Commit `feat: match detail page with events timeline and lineups`

### Task 5: Stranica /momcad

**Files:**
- Create: `src/pages/MomcadPage.tsx` (zamijeni stub)
- Create: `src/components/momcad/PlayerStatCard.tsx`
- Modify: `src/pages/TeamPage.tsx` — ostaje samo stožer; ruta `/strucni-stozer` postoji i dalje

**Interfaces:**
- Consumes: `/api/players?category=seniori` (polja: firstName, lastName, number, position, goals, appearances, yellowCards, redCards, imageUrl), `src/data/staff.ts` (postojeći podaci stožera)

**Dizajn:** grid kartica igrača — HNS fotografija (fallback silueta), broj, ime, pozicija, mini statistika (nastupi/golovi/kartoni). Sekcije po poziciji: Vratari, Igrači (HNS ne daje finije pozicije). Iznad grida: 3 istaknuta "top strijelca" kluba (sort po goals). Ispod: stožer (postojeća StaffSection komponenta).

- [ ] **Step 1:** Implementiraj stranicu i karticu
- [ ] **Step 2:** Build + preview (fotke s HNS-a se učitavaju, fallback radi)
- [ ] **Step 3:** Commit `feat: momcad page with player stat cards and staff`

### Task 6: Stranica /statistika

**Files:**
- Create: `src/pages/StatistikaPage.tsx` (zamijeni stub)
- Create: `src/hooks/useScorers.ts`
- Create: `src/lib/stats.ts` + Test: `tests/web/stats-helpers.test.ts`

**Interfaces:**
- Consumes: `/api/scorers?limit=20`, `/api/matches?category=seniori&all=0`, `/api/standings?category=seniori`
- `src/lib/stats.ts` čisti helperi (TDD): `homeAwayRecord(matches)` → `{ home: {w,d,l,gf,ga}, away: {...} }` (samo played + isVeliVrh); `biggestWin(matches)` → MatchItem|null; `formString(matches, n=5)` → 'WDLWW'

**Dizajn:** sekcije — (1) Ligaški strijelci (tablica s fotkama, Veli Vrh igrači highlightani narančasto), (2) Veli Vrh dom/gosti bilanca (dvije kartice), (3) Najveća pobjeda + forma. Napomena "Podaci: HNS Semafor" u footeru sekcije.

- [ ] **Step 1:** Failing testovi za `homeAwayRecord`, `biggestWin`, `formString` → FAIL → implementacija → PASS
- [ ] **Step 2:** Implementiraj stranicu
- [ ] **Step 3:** Build + preview
- [ ] **Step 4:** Commit `feat: statistika page with league scorers and club splits`

### Task 7: /kategorije/:kat rute + utakmice po kategoriji

**Files:**
- Modify: `src/pages/KategorijaPage.tsx`

**Interfaces:**
- Consumes: `useParams` (react-router), postojeći `useKategorija`, `useMatchList` iz Taska 2

- [ ] **Step 1:** `const { kat } = useParams()`; validan `kat` (iz TABS ključeva) → aktivni tab, nevaljan → redirect `/kategorije`; klik na tab → `navigate('/kategorije/'+key)` umjesto setState. SEO title po kategoriji ("Juniori | NK Veli Vrh")
- [ ] **Step 2:** Dodaj sekciju "Utakmice" ispod ljestvice: `useMatchList(kat,'sve',false)` — zadnje 3 odigrane + sljedeće 3 (helperi iz Taska 2), link "Sve utakmice" → `/utakmice`
- [ ] **Step 3:** Build + preview (`/kategorije/juniori` direktno u URL, refresh radi)
- [ ] **Step 4:** Commit `feat: category routes with per-category matches`

### Task 8: Galerija aktivacija

**Files:**
- Modify: `src/pages/GalleryPage.tsx`, `src/components/gallery/GalleryGrid.tsx` (po potrebi)
- Check: Supabase tablice `albums`/`gallery_items` (schema u `supabase/gallery-schema.sql`)

**Interfaces:**
- Consumes: postojeći `useAlbums`/`useGalleryItems` (čitaju Supabase direktno preko anon klijenta)

- [ ] **Step 1:** Provjeri REST-om postoje li `albums`/`gallery_items` tablice; ako ne → reci korisniku da pokrene `supabase/gallery-schema.sql` (ne mijenjaj schemu sam)
- [ ] **Step 2:** GalleryPage: dodaj SEO + naslov/header konzistentan s ostalim stranicama; prazno stanje "Galerija se puni" ako nema albuma
- [ ] **Step 3:** Build + preview
- [ ] **Step 4:** Commit `feat: activate gallery page`

### Task 9: O klubu obogaćen + /postani-clan + sponzori

**Files:**
- Modify: `src/data/timeline.ts` (istraženi podaci — **označi TODO-korisnik za ručnu provjeru u komentaru na vrhu datoteke**)
- Modify: `src/pages/AboutPage.tsx` / `src/components/about/*` (stadion sekcija)
- Create: `src/pages/PostaniClanPage.tsx` (zamijeni stub)
- Create: `src/data/sponsors.ts` + `src/components/home/SponsorsStrip.tsx`; Modify: `src/pages/HomePage.tsx`

**Sadržaj timeline (iz istraživanja, korisnik provjerava):** 1972. inicijativa i dodjela lokacije bivšeg kamenoloma; 21.3.1975. osnivačka skupština (prvi predsjednik Anton Bjažić, trener Bruno Krstulović); 14.9.1975. prva utakmica vs NK Šišan 1:0 (strijelac Rade Mandić); danas: Elitna liga NSŽI + 7 uzrasnih kategorija.
**Stadion sekcija:** Stadion Tivoli, ~200 sjedećih, 2 pomoćna terena 40×20 umjetna trava.
**PostaniClan:** hero poziv, 3 kartice (Škola nogometa U-9–U-11 / Mlađi uzrasti / Seniori+Veterani), kontakt blok (email `nkvelivrh@gmail.com`, tel 052/215-471 — korisnik potvrđuje), bez forme (mailto link) — YAGNI.
**Sponzori:** `sponsors.ts` = `Array<{ name: string, logoUrl: string|null, url: string|null }>` s 2-3 placeholder zapisa; SponsorsStrip = siva traka logotipa iznad footera na Početnoj; ako je lista prazna, ne renderira se.

- [ ] **Step 1:** Implementiraj sve četiri stavke
- [ ] **Step 2:** Build + preview (O klubu, /postani-clan, sponzorska traka)
- [ ] **Step 3:** Commit `feat: enriched club history, postani-clan page, sponsors strip`

### Task 10: Završna verifikacija + deploy

- [ ] **Step 1:** `npm test && npm run build` — sve zeleno
- [ ] **Step 2:** Preview: prođi SVE rute (/, /utakmice, /utakmice/:id, /momcad, /statistika, /kategorije/juniori, /galerija, /o-klubu, /postani-clan, /novosti, /kontakt, nepostojeća → 404); mobilni viewport (375px) za nav i /utakmice
- [ ] **Step 3:** Merge/push na main → pričekaj deploy → provjeri produkcijske rute (SPA rewrite u vercel.json pokriva nove rute)
- [ ] **Step 4:** Screenshot ključnih stranica korisniku

## Self-Review

- Spec točke 9–17 pokrivene: 9→T3, 10→T4, 11→T5, 12→T6, 13→T7, 14→T8, 15→T9, 16→T9, 17→T9. ✓
- Bez placeholdera; oblici podataka referenciraju stvarne API datoteke. ✓
- Tipovi konzistentni (MatchItem u T2 koriste T3/T6/T7). ✓
