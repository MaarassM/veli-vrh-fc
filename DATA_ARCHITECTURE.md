# Arhitektura podataka - NK Veli Vrh

## Filozofija

**Baza podataka**: Samo osnovna lista igrača (ime, prezime, broj, pozicija)
**HNS Semafor**: Sve ostalo (statistike, ljestvica, utakmice) - dohvaća se uživo

## Zašto ovaj pristup?

1. **Lista igrača se rijetko mijenja** - idealna za bazu podataka
2. **Statistike se često mijenjaju** - bolje dohvaćati uživo s HNS-a
3. **Ljestvica se mijenja svaki tjedan** - mora biti uvijek ažurna
4. **Utakmice i rezultati** - realno-vremenske informacije

## Trenutna implementacija

### Baza podataka (SQLite + Prisma)

```typescript
model Player {
  id        String   @id @default(uuid())
  firstName String   // Ime
  lastName  String   // Prezime
  number    Int      // Broj dresa
  position  String   // Pozicija (Vratar/Igrač)
  isActive  Boolean  // Aktivni igrač
}
```

**Seed skripte:**
- `npm run db:seed-simple` - Jednostavni seed (samo osnovna lista iz players-simple.json)
- `npm run db:seed` - Puni seed sa statistikama (za development)

### Uživo podaci s HNS Semafora

**Što se dohvaća:**
- Statistike igrača (golovi, asistencije, nastupi, kartoni)
- Trenutna ljestvica lige
- Raspored i rezultati utakmica
- Fotografije igrača

**Service:** `src/services/hnsService.ts`

```typescript
// Dohvaćanje statistika
const stats = await fetchLivePlayerStats()

// Dohvaćanje ljestvice
const standings = await fetchLiveStandings()

// Dohvaćanje utakmica
const matches = await fetchLiveMatches()

// Kombiniranje baze sa živim podacima
const playersWithStats = await mergePlayersWithStats(playersFromDB)
```

## Za produkciju

### Opcija 1: Backend API (Preporučeno)

Napraviti jednostavan backend (Node.js/Express) koji:
1. Scrapa HNS Semafor periodično (svaki sat)
2. Cache-a podatke
3. Servira ih preko REST API-ja

```
GET /api/players      - Igrači sa statistikama
GET /api/standings    - Trenutna ljestvica
GET /api/matches      - Utakmice i rezultati
```

### Opcija 2: Serverless Functions

Koristiti Vercel/Netlify Functions:
```
/api/players.ts       - Scrapa i vraća podatke o igračima
/api/standings.ts     - Scrapa i vraća ljestvicu
/api/matches.ts       - Scrapa i vraća utakmice
```

### Opcija 3: GitHub Actions

Periodično (svakih sat vremena):
1. Scrapa HNS Semafor
2. Generira JSON datoteke
3. Commit i push na repo
4. Static site se automatski deploya

## Cache strategija

- **Ljestvica**: 1 sat
- **Statistike igrača**: 1 sat
- **Utakmice**: 30 minuta
- **Lista igrača iz baze**: Ne cache-ati (rijetko se mijenja)

## Scrapin HNS Semafora

```typescript
// Za production, implementirati pravi scraping:
import puppeteer from 'puppeteer'

async function scrapeHNS() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto('https://semafor.hns.family/klubovi/1546/nk-veli-vrh/')

  // Scrape ljestvicu, statistike, utakmice...
  // ...

  await browser.close()
}
```

## Migracija na novu arhitekturu

1. Backup postojeće baze
2. Kreiranje nove sheme: `prisma/schema-simple.prisma`
3. Migracija: `npx prisma migrate dev --name simplify-schema`
4. Seed: `npm run db:seed-simple`
5. Ažuriranje komponenti da koriste `hnsService.ts`

## Ažuriranje liste igrača

Kada se promijeni lista igrača:
1. Ažuriraj `scripts/players-simple.json`
2. Pokreni: `npm run db:seed-simple`
3. Gotovo! Sve ostalo se automatski dohvaća s HNS-a.

## Prednosti ovog pristupa

✅ Jednostavno ažuriranje liste igrača
✅ Uvijek ažurne statistike
✅ Uvijek ažurna ljestvica
✅ Automatsko ažuriranje rezultata
✅ Manja baza podataka
✅ Manje manualno ažuriranje

## Nedostaci

⚠️ Potreban backend ili serverless functions za production
⚠️ Ovisi o dostupnosti HNS Semafora
⚠️ Potreban scraping (može se promijeniti struktura HNS stranice)

## Preporuka

Za development: Koristi statične podatke (trenutna implementacija)
Za production: Implementiraj Opciju 1 (Backend API) ili Opciju 2 (Serverless Functions)
