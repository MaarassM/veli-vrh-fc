# NK Veli Vrh — službena web stranica

Web stranica nogometnog kluba Veli Vrh iz Pule (osnovan 1975., Stadion Tivoli).
Rezultati, ljestvice, statistike i sastavi povlače se automatski s
[HNS Semafora](https://semafor.hns.family/klubovi/1546/nk-veli-vrh/), a novosti s
klupske Facebook stranice.

## Stack

- **Frontend:** Vite + React 19 + TypeScript + Tailwind CSS 4 + Motion
- **Hosting:** Vercel (SPA + serverless funkcije u `api/`)
- **Baza:** Supabase (Postgres, besplatni plan)
- **Scraping:** Cheerio nad HNS Semaforom (server-rendered HTML)
- **Testovi:** Vitest (parseri se testiraju na stvarnim HTML fixture-ima)

## Pokretanje

```bash
npm install
cp .env.example .env   # upiši Supabase ključeve
npm run dev
```

Bez `.env`-a frontend radi sa statičkim fallback podacima.

## Arhitektura podataka

1. **Discovery** (`lib/hns/discovery.ts`): javni Semafor JSON handleri vraćaju
   kategorije kluba i ID-eve natjecanja za tekuću sezonu — nova sezona radi bez
   ručnog ažuriranja.
2. **Scrape** (`lib/hns/sync-core.ts` + `lib/hns/parsers.ts`): za svako natjecanje
   povlači se stranica natjecanja (ljestvica s formom, sva kola, top strijelci),
   klupska stranica (roster sa statistikama) i do 5 detalja odigranih utakmica
   po pokretanju (sastavi, golovi, kartoni, gledatelji).
3. **Spremanje:** Supabase tablice `competitions`, `standings`, `matches`,
   `players`, `scorers`, `match_details`, `match_lineups`, `match_events`.
   Pisanje je "guarded" — postojeći podaci se brišu tek kad novi postoje.
4. **Serviranje:** `api/standings`, `api/matches`, `api/players`, `api/scorers`,
   `api/match?id=`, `api/news` (CDN cache 5 min).

### Raspored synca

- Vercel cron: 1×/dan (`vercel.json`) — limit Hobby plana
- GitHub Actions (`.github/workflows/hns-sync.yml`): radnim danom 2×/dan,
  vikendom svaki sat poslijepodne. Traži `CRON_SECRET` repo secret
  (isti kao u Vercel env) i opcionalno `SYNC_URL` repo varijablu.

### Ručni sync

```bash
npm run sync:local
```

## Testovi

```bash
npm test
```

Fixture-i u `tests/fixtures/hns/` su stvarne Semafor stranice (srpanj 2026.).
Ako se struktura Semafora promijeni, skini nove fixture-e i prilagodi parsere.

## Deploy

Push na `main` → Vercel automatski deploya. Migracije baze se pokreću ručno
u Supabase SQL Editoru (`supabase/migrations/`).

## Dokumentacija

- Veliki plan unaprjeđenja: `docs/superpowers/specs/2026-07-30-website-max-upgrade-plan.md`
- Implementacijski planovi: `docs/superpowers/plans/`

<!-- deploy: pickup VAPID env vars -->
