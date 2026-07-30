# NK Veli Vrh — Veliki plan unaprjeđenja web stranice

**Datum:** 2026-07-30
**Status:** Prijedlog — čeka odobrenje
**Kontekst:** Amaterski klub, bez webshopa. Podatke o klubu korisnik će ručno provjeriti/izmijeniti. Fokus na HNS Semafor podatke kao glavnu vrijednost.

---

## 1. Istraženi kontekst

### 1.1 Klub (izvori: Wikipedia, HNS Semafor, Transfermarkt, Sofascore, Istrasport, sudski registri)

- **Puni naziv:** Nogometni klub "Veli Vrh" Pula, osnovan **21. ožujka 1975.** (inicijativa od 1972.)
- **Prva utakmica:** 14. rujna 1975. protiv NK Šišan — pobjeda 1:0, strijelac Rade Mandić
- **Prvi predsjednik:** Anton Bjažić; **prvi trener:** Bruno Krstulović
- **Stadion Tivoli** — u naselju Veli Vrh, ~200 sjedećih mjesta + 2 pomoćna terena 40×20 m (umjetna trava)
- **Adresa:** Ulica Veli vrh – Via Monte Grande 1, 52100 Pula; OIB 93093916559
- **Boje:** narančasta
- **Liga:** ELITNA LIGA NSŽI (najviši županijski rang) + Kup NSŽI; sezona 25/26: 5. mjesto, 27 ut., 11-4-12, 40:62, 37 bodova
- **Trener (aktualno po Istrasportu):** Dalibor Božac; zastupnici udruge: Alen Žagrić, Ilija Lovrić, Ivan Mejak
- **Najbolji strijelci 25/26:** Irian Beviakva 12, Petar Grgić 7, M. V. Marić i Mateo Lovrić po 5
- **Društvene mreže:** facebook.com/velivrhpula, instagram.com/nkvelivrh1975
- **Stara domena nkvelivrh.hr je mrtva** (DNS ne razrješava) — prilika: preuzeti/obnoviti domenu ili barem ciljati te ključne riječi

> ⚠️ Sve podatke (imena, funkcije, povijest) korisnik ručno provjerava prije objave.

### 1.2 HNS Semafor — tehnički nalazi (ključno!)

- **Klub ID: 1546**, organizacija ŽNS Istarski **oid=52**
- Semafor je **server-rendered HTML** (ASP.NET) — sve je u početnom HTML-u, scraping bez headless browsera (Cheerio dovoljan). Iza Cloudflarea → razuman rate limit + cache.
- **Stranica natjecanja `/natjecanja/{cid}/x/`** (slug proizvoljan!) sadrži u JEDNOM zahtjevu:
  - kompletnu tablicu (s **formom** zadnjih utakmica i tabovima po dijelovima lige)
  - **sva kola s rezultatima i rasporedom** (`data-round`, `data-match` atributi)
  - popis klubova, **ligaške strijelce i kartone**
- **Stranica utakmice `/utakmice/{matchId}/`** sadrži: **sastave (lineups), događaje (golovi s minutama, kartoni), broj gledatelja**
- **Javni JSON handleri** (bez ključa): `getOrganizations`, `getAgeCategories?clubID=1546`, `getCompetitions` → automatsko otkrivanje ID-eva natjecanja za novu sezonu (nema više ručnog ažuriranja cid-ova!)
- **COMET LIVE REST API** (`api-hns.analyticom.de`, javni Swagger): pravi JSON API s tablicama, utakmicama, live događajima — traži API ključ koji **klub može zatražiti od HNS-a/Analyticoma**. Dugoročno najbolji put (live rezultati!).
- ID-evi natjecanja 25/26 (u kodu već postoje, osim Kupa):

| Kategorija | Natjecanje | cid |
|---|---|---|
| Seniori | ELITNA LIGA NSŽI 25/26 | 100703751 |
| Seniori | **KUP NSŽI 25/26 (ne scrapa se!)** | 100586758 |
| Juniori | ŽNLI JUNIORI A 25/26 | 100949387 |
| Pioniri | ŽNLI PIONIRI 2026 | 112161359 |
| Mlađi pioniri | ŽNLI MLAĐI PIONIRI 8+1 25/26 | 100968848 |
| U-11 | U-11 JUG 2 25/26 | 102600299 |
| U-9 | ŽNLI U-9 25/26 | 102049500 |
| Veterani | Veterani JUG 25/26 | 102383368 |

### 1.3 Trenutno stanje koda

**Dobro:** Vite+React 19+TS+Tailwind 4, Vercel cron scrape (7 kategorija) → Supabase, Facebook news sync, SEO/security headers/sitemap/cookie notice već napravljeni, dark mode hook, skeleton loaderi.

**Nedostaci / dugovi:**
- Sync samo **1× dnevno u 7:00** → vikendom rezultati kasne do sutradan
- Scrapa se samo klupska stranica → nema rasporeda cijele lige, forme, strijelaca lige, detalja utakmica
- Sync radi **delete + insert** → svaki fail = prazna stranica; nema povijesti sezona
- **Galerija postoji u kodu ali nije u ruti/navigaciji**
- Mrtav kod: Prisma/SQLite (dev.db, schema, seed skripte, better-sqlite3, @libsql), `hnsService.ts` (mock), `TopScorers`, `HighlightsGrid`, folderi `75463-*` i `.superpowers/brainstorm`
- README je default Vite template
- Kup NSŽI se ne prati; cid-ovi hardkodirani po sezoni
- SPA bez prerenderinga → dinamički sadržaj (rezultati) slabo indeksiran

---

## 2. Prijedlog nove strukture stranice

```
/                    Početna (hero, sljedeća/zadnja utakmica, tablica, strijelci, novosti, sponzori)
/utakmice            NOVO — raspored i rezultati po kolima (sve kategorije, liga + kup)
/utakmice/{id}       NOVO — izvještaj: događaji, strijelci, kartoni, sastavi, gledatelji
/momcad              NOVO — seniori: igrači s HNS statistikama i fotkama + stručni stožer
/kategorije          postojeće, prošireno (tablica + raspored + strijelci po kategoriji)
/kategorije/{kat}    NOVO — vlastita ruta po kategoriji (SEO) umjesto samo tabova
/statistika          NOVO — strijelci, kartoni, forma, dom/gosti, posjećenost
/novosti             postojeće (Facebook) + Instagram
/galerija            AKTIVIRATI postojeću stranicu
/o-klubu             prošireno — povijest 1975.–danas, stadion Tivoli, uprava
/postani-clan        NOVO — upisi u školu nogometa / poziv novim igračima
/kontakt             postojeće + karta (sada je placeholder)
```

Navigacija: Početna · Utakmice · Momčad · Kategorije · Novosti · Klub (dropdown: O klubu, Galerija, Postani član) · Kontakt

---

## 3. Plan po fazama

### FAZA 1 — Podatkovni temelj (HNS Semafor na maksimum) 🏆 najveća vrijednost

1. **Prebaciti scraping na stranice natjecanja** (`/natjecanja/{cid}/x/`): tablica s formom + SVA kola (raspored cijele sezone) + ligaški strijelci/kartoni — 1 GET po natjecanju.
2. **Dodati Kup NSŽI** (cid 100586758).
3. **Scraping detalja utakmica** (`/utakmice/{matchId}/`): golovi s minutama, kartoni, sastavi, gledatelji → nove tablice `match_events`, `match_lineups`.
4. **Automatsko otkrivanje sezone**: JSON handleri (`getAgeCategories`, `getCompetitions` s `clubID=1546`) → cid-ovi se više ne hardkodiraju; nova sezona radi sama.
5. **Sigurniji sync**: upsert umjesto delete+insert; kolona `season` → povijest sezona ostaje u bazi (arhiva).
6. **Pametniji raspored synca**: radnim danom 2×/dan, vikendom svakih 1–2 h (16–22 h) — Vercel cron podržava više zapisa.
7. **Nove Supabase tablice**: `competitions`, `match_events`, `match_lineups`, `scorers` (+ `season` svugdje).
8. **(Paralelno, dugoročno)** Klub službeno zatraži **COMET LIVE API ključ** → kasnije live rezultati bez scrapinga.

### FAZA 2 — Nove stranice i sadržaj

9. **/utakmice** — raspored i rezultati po kolima s filterom kategorije i natjecanja (liga/kup), forma, sljedeće kolo.
10. **/utakmice/{id}** — izvještaj s utakmice (događaji, sastavi, gledatelji) — automatski iz HNS podataka.
11. **/momcad** — kartice igrača (HNS fotografije, broj, pozicija, nastupi, golovi, kartoni) + top strijelci + stožer.
12. **/statistika** — top strijelci kluba i lige, kartoni, dom/gosti bilanca, prosjek gledatelja.
13. **/kategorije/{kategorija}** — vlastite rute (juniori, pioniri…) s tablicom + rasporedom + igračima; bolje za SEO i dijeljenje linkova.
14. **Galerija** — aktivirati rutu + navigaciju; slike iz Supabase Storagea (upload) i/ili automatski iz Facebook foto-albuma.
15. **O klubu** — obogatiti timeline istraženim činjenicama (1972. inicijativa, 21.3.1975. osnutak, prva utakmica 14.9.1975. vs Šišan 1:0…), sekcija o stadionu Tivoli, uprava. *(podatke korisnik provjerava)*
16. **/postani-clan** — poziv za upis djece u školu nogometa + kontakt forma; ključno za amaterski klub.
17. **Sponzori** — traka logotipa na početnoj + uređivanje kroz admin (amaterski klub živi od sponzora).

### FAZA 3 — Angažman i distribucija

18. **Kalendarska pretplata (.ics)** — `/api/calendar.ics` generiran iz baze; navijači dodaju raspored u Google/Apple kalendar jednim klikom.
19. **Web push notifikacije** (besplatno, PWA): "Kraj utakmice: Veli Vrh 2:0 Marčana" — opt-in zvonce na stranici.
20. **Auto-generirane grafike rezultata** (OG image / share card): nakon synca se generira slika rezultata (satori/@vercel/og) — za dijeljenje na društvenim mrežama i ljepše OG preview linkova.
21. **Instagram sync** uz Facebook (isti Graph API token ako je povezan Business account).
22. **PWA dorada**: `display: standalone`, prave ikone (192/512), offline shell → "instaliraj aplikaciju kluba" na mobitel.
23. **Countdown do sljedeće utakmice** na početnoj + gumb "Dodaj u kalendar".

### FAZA 4 — Tehnička izvrsnost i higijena

24. **Čišćenje**: izbaciti Prisma/SQLite/mock servis/neiskorištene komponente i foldere; smanjiti bundle (better-sqlite3 i sl. su i u dependencies!).
25. **Prerendering za SEO**: vite prerender (ili migracija na Astro/Next kasnije — NE sada); minimalno: dinamički OG tagovi po ruti kroz Vercel funkciju.
26. **Analitika (privacy-friendly)**: Vercel Analytics ili Plausible/Umami — bez kolačića, u skladu s postojećom cookie noticom.
27. **Performanse**: slike → WebP/AVIF + `srcset`, lazy loading, preload fontova, Lighthouse ≥ 95.
28. **Pristupačnost**: kontrast, focus stanja, alt tekstovi, aria za tabove.
29. **Domena**: kupiti nkvelivrh.com (plan već cilja tu domenu) i po mogućnosti obnoviti nkvelivrh.hr → 301 redirect.
30. **README + dokumentacija** za klub: kako ažurirati igrače, sponzore, galeriju.
31. **Monitoring synca**: ako sync padne 2× zaredom → e-mail/Discord webhook obavijest (sync_log već postoji).
32. **(Opcija) Mini admin panel** (Supabase Auth, jedna zaštićena ruta): upload galerije, uređivanje sponzora, ručne objave novosti — da klub ne ovisi o developeru.

---

## 4. Što svjesno NE radimo (YAGNI za amaterski klub)

- ❌ Webshop / merch / plaćanja
- ❌ Sustav članarina s naplatom
- ❌ Višejezičnost (samo hrvatski)
- ❌ Prava mobilna aplikacija (PWA je dovoljna)
- ❌ Forum / komentari / korisnički računi za posjetitelje
- ❌ Migracija frameworka "radi migracije"

---

## 5. Redoslijed i procjena opsega

| Faza | Opseg | Ovisnosti |
|---|---|---|
| 1 — Podaci | ~5–7 radnih sesija | ništa |
| 2 — Stranice | ~6–8 sesija | Faza 1 (podaci moraju postojati) |
| 3 — Angažman | ~4–5 sesija | Faza 1–2 |
| 4 — Higijena | ~3–4 sesije | neovisno, može paralelno |

Preporučeni start: **Faza 1 (točke 1–7) + čišćenje (točka 24)** — sve ostalo se gradi na tome.
