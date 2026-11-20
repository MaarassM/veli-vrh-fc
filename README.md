# NK Veli Vrh — službena web stranica

Web stranica nogometnog kluba Veli Vrh iz Pule (osnovan 1975., Stadion Tivoli):
o klubu, momčad, galerija i kontakt. Sav sadržaj uređuje se kroz `/admin`.

Do studenog 2026. rezultati i ljestvice povlačili su se s HNS Semafora. HNS je
zabranio automatsko preuzimanje podataka, pa je taj dio uklonjen; stare HNS
tablice ostaju u bazi, ali ih ništa više ne čita ni ne puni.

## Stack

- **Frontend:** Vite + React 19 + TypeScript + Tailwind CSS 4 + Motion
- **Hosting:** Vercel (statična SPA, bez serverless funkcija)
- **Baza:** Supabase (Postgres + Storage, besplatni plan)
- **Testovi:** Vitest

## Pokretanje

```bash
npm install
cp .env.example .env   # upiši Supabase ključeve
npm run dev
```

## Sadržaj i admin

Prijava na `/admin` (samo korisnici iz tablice `admins`). Kartice:

- **Momčad** — igrači seniora (tablica `team_players`)
- **Galerija** — albumi i fotografije (`albums`, `gallery_items`, bucket `media`)
- **Stožer** — stručni stožer i uprava (`staff`)
- **Povijest** — vremenska crta na stranici O klubu (`timeline_events`)
- **Tekstovi** — uvod, vrijednosti, opis kluba i stadiona (`site_content`)

## Testovi

```bash
npm test
```

## Deploy

Push na `main` → Vercel automatski deploya. Migracije baze se pokreću ručno
u Supabase SQL Editoru (`supabase/migrations/`).

## Sigurnost podataka

Supabase na besplatnom planu **nema automatske kopije**, pa ih radimo sami.

**Dnevna kopija.** GitHub Action `backup.yml` svaki dan u 02:00 UTC izvozi sve
tablice u JSON i sprema ih u granu `backups`. Git povijest te grane je vremenska
mašina — svaki dan je jedan commit, pa se može vidjeti što se i kad promijenilo.
Ručno pokretanje: `gh workflow run backup.yml`.

Slike u Supabase Storageu (galerija) **nisu** u kopiji — one postoje samo na Supabaseu.

**Vraćanje podataka.** Dohvati kopiju i pokreni restore:

```bash
git fetch origin backups
git checkout origin/backups -- backups/data
npx tsx scripts/restore.ts sve            # ili npx tsx scripts/restore.ts gallery_items
```

Skripta traži potvrdu i prepisuje postojeće redove istog ključa.
Za kopiju od određenog datuma: `git log origin/backups` pa
`git checkout <commit> -- backups/data`.
