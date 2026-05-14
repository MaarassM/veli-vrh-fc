# Sve Kategorije — Design Spec

**Date:** 2026-05-14
**Status:** Approved

## Goal

Extend the daily HNS sync to cover all 8 uzrast categories and add a "Sve kategorije" page where users can browse standings and players per category via a pill tab picker.

## Sub-projects (build in order)

1. **Data sync** — schema migration + extended cron scraper
2. **Kategorije page** — new page + navigation

---

## Sub-project 1: Data Sync

### Schema changes

Add `category TEXT NOT NULL DEFAULT 'seniori'` to three existing tables:

```sql
ALTER TABLE standings ADD COLUMN category TEXT NOT NULL DEFAULT 'seniori';
ALTER TABLE matches   ADD COLUMN category TEXT NOT NULL DEFAULT 'seniori';
ALTER TABLE players   ADD COLUMN category TEXT NOT NULL DEFAULT 'seniori';
```

### Category map (hardcoded, never changes mid-season)

| key | CID |
|-----|-----|
| seniori | 100703751 |
| juniori | 100949387 |
| pioniri | 112161359 |
| mladi-pioniri | 100968848 |
| u-11 | 102600299 |
| u-9 | 102049500 |
| veterani | 102383368 |

### Sync logic (`api/cron/sync.ts`)

- Replace single `HNS_URL` constant with the category map above
- Loop through each category, scraping the URL `https://semafor.hns.family/klubovi/1546/nk-veli-vrh/?cid={cid}`
- Per category: delete all existing rows where `category = key`, then insert fresh rows tagged with `category = key`
- If one category fails, continue with the rest — log each failure independently in `sync_log`
- Existing cheerio selectors are unchanged; they work for all 8 URLs

### API endpoints

Update these three endpoints to accept `?category=` query param (default `'seniori'`):

- `api/standings.ts` → `SELECT * FROM standings WHERE category = $category`
- `api/players.ts` → `SELECT * FROM players WHERE category = $category`
- `api/matches.ts` → `SELECT * FROM matches WHERE category = $category`

Existing hooks (`useStandings`, `useMatches`, `usePlayerStats`) default to `seniori` — no breaking changes.

---

## Sub-project 2: Kategorije Page

### Route

`/kategorije` — added to React Router in `src/App.tsx`

### Navigation

Add to `src/data/navigation.ts`:
```ts
{ label: 'Kategorije', href: '/kategorije' }
```

### New files

| File | Responsibility |
|------|---------------|
| `src/pages/KategorijaPage.tsx` | Page with tab state, composes StandingsTable + PlayersList |
| `src/components/kategorija/StandingsTable.tsx` | Standings table (Poz, Klub, Uk, Pob, Ner, Por, G+, G-, GR, Bod) |
| `src/components/kategorija/PlayersList.tsx` | Player list (broj, ime i prezime, pozicija, nastupi, golovi) |
| `src/hooks/useKategorija.ts` | Fetches standings + players for a given category key |

### Page layout

```
[ Seniori ] [ Juniori ] [ Pioniri ] [ Mlađi pioniri ] [ U-11 ] [ U-9 ] [ Veterani ]
                            (pill tab strip)

─────────────────────────────
Ljestvica
─────────────────────────────
Poz  Klub          Uk  Pob  Ner  Por  G+  G-  GR  Bod
 1   NK Veli Vrh   14   13    1    0  80  17  +63   40
 ...

─────────────────────────────
Igrači
─────────────────────────────
#   Ime i prezime        Pozicija   Nastupi   Golovi
10  Irian Beviakva       Napadač      21        12
 ...
```

### `useKategorija` hook

```ts
function useKategorija(category: string): {
  standings: Standing[]
  players: PlayerStats[]
  loading: boolean
  error: string | null
}
```

Fetches `/api/standings?category={category}` and `/api/players?category={category}` in parallel.

### Default tab

`seniori` — first tab selected on page load.

### Loading / empty states

- Show skeleton rows while loading
- If a category returns no data yet (sync hasn't run), show "Podaci još nisu dostupni."

## Files affected

**Modified:**
- `api/cron/sync.ts` — extended scraper
- `api/standings.ts` — add category filter
- `api/players.ts` — add category filter
- `api/matches.ts` — add category filter
- `src/App.tsx` — new route
- `src/data/navigation.ts` — new nav link
- `supabase/schema.sql` — document schema changes

**Created:**
- `src/pages/KategorijaPage.tsx`
- `src/components/kategorija/StandingsTable.tsx`
- `src/components/kategorija/PlayersList.tsx`
- `src/hooks/useKategorija.ts`
- `supabase/migrations/add-category-column.sql`
