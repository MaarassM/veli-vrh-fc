# Admin: uređivanje sadržaja (stožer, povijest, tekstovi)

Proširenje postojećeg `/admin` panela (Sponzori, Galerija) s tri nova taba, tako da se sadržaj mijenja bez diranja koda.

## Opseg

| Tab | Što se uređuje | Gdje se prikazuje |
|---|---|---|
| Stožer | osobe: ime, prezime, uloga (slobodan tekst), slika, "u klubu od", redoslijed | `StaffSection` (/team, /momcad) |
| Povijest | događaji: godina, naslov, opis, kategorija, redoslijed unutar godine | `HistoryTimeline` (/o-nama) |
| Tekstovi | 4 sekcije: `home_intro`, `club_values`, `about_overview`, `stadium` | `IntroSection`, `ClubValues`, `ClubOverview`, `StadiumInfo` |

Izvan opsega: kontakt, navigacija, igrači (dolaze s HNS-a), bogati tekst editor.

## Podaci (Supabase)

Migracija `supabase/migrations/2026-10-01-admin-content.sql`:

- `staff(id uuid, first_name, last_name, role text, image_url text null, since text null, sort_order int)`
- `timeline_events(id uuid, year int, title, description, category text check in (founding, achievement, milestone, infrastructure), sort_order int)` — sortira se `year, sort_order`
- `site_content(key text primary key, value jsonb, updated_at timestamptz)`
- RLS: javno čitanje, insert/update/delete samo `authenticated` (isti uzorak kao `sponsors`)
- Seed: trenutni sadržaj iz `src/data/staff.ts`, `src/data/timeline.ts` i komponenti. Generira ga `scripts/gen-content-seed.ts` da se ne prepisuje ručno.

Oblik `site_content.value`:

```ts
home_intro:     { text: string }
club_values:    { items: { title: string; body: string }[] }          // 3, ikone po indeksu
about_overview: { subtitle: string; paragraphs: string[]; stats: Stat[] }
stadium:        { features: Stat[]; facilities: string[] }             // ikone po indeksu
Stat = { value: string; label: string; description: string }
```

Tekst podržava `**podebljano**` (jedina oznaka), da se zadrže istaknuti dijelovi u "O nama".

## Frontend

- `src/lib/content.ts` — tipovi, zadane vrijednosti (današnji tekst), `resolveContent(fallback, remote)` i `renderBold`.
- `src/hooks/useSiteContent.ts` — vraća fallback odmah, pa vrijednost iz baze kad stigne.
- `src/hooks/useStaff.ts`, `src/hooks/useTimeline.ts` — čitaju tablicu; prazna tablica ili greška → statični podaci iz `src/data/*`.
- Stranica nikad nije prazna i nema treptanja skeletona — prikazuje se zadani tekst dok se čeka baza.

## Admin

- `AdminPage` tabovi: Sponzori, Galerija, Stožer, Povijest, Tekstovi.
- `StaffAdmin` — popis + gore/dolje + uredi + obriši; forma za dodaj/uredi s uploadom slike u bucket `media/staff/`.
- `TimelineAdmin` — popis po godinama + uredi + obriši; ista forma za dodaj/uredi.
- `ContentAdmin` — jedna forma po sekciji, gumb "Spremi" po sekciji (upsert u `site_content`).
- Greške se prikazuju u panelu (isti stil kao `SponsorsAdmin`).

## Testiranje

- Vitest za `resolveContent` i `renderBold` (čiste funkcije).
- Ručno u pregledniku: build prolazi, javne stranice prikazuju sadržaj i bez migracije (fallback).
