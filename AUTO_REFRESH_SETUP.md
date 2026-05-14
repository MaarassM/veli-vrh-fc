# Automatski Refresh Podataka - Implementation Guide

## Pregled

Ova aplikacija prikazuje podatke iz HNS Semafor stranice za NK Veli Vrh. Za produkciju, potrebno je postaviti backend koji će automatski povlačiti najnovije podatke.

## Opcije za Implementaciju

### **Opcija 1: Backend API + Cron Job (Preporučeno)**

#### Backend Setup (Node.js/Express primer)

```bash
# U root direktoriju projekta
mkdir backend
cd backend
npm init -y
npm install express cors node-fetch node-cron
```

#### `backend/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const cron = require('node-cron');
const fs = require('fs').promises;

const app = express();
app.use(cors());
app.use(express.json());

// Cache podataka
let cachedData = {
  players: [],
  matches: [],
  standings: [],
  lastUpdated: null
};

// Funkcija za scraping podataka
async function fetchClubData() {
  try {
    // Ovdje implementirati logiku za povlačenje podataka sa HNS Semafor stranice
    // Može koristiti Puppeteer ili Cheerio za web scraping
    
    const response = await fetch('https://semafor.hns.family/klubovi/1546/nk-veli-vrh/');
    const html = await response.text();
    
    // Parsiranje HTML-a i ekstrakcija podataka
    // (Implementacija ovisi o strukturi stranice)
    
    cachedData = {
      players: extractedPlayers,
      matches: extractedMatches,
      standings: extractedStandings,
      lastUpdated: new Date().toISOString()
    };
    
    // Spremi u fajl za backup
    await fs.writeFile(
      './data-cache.json',
      JSON.stringify(cachedData, null, 2)
    );
    
    console.log('✅ Podaci ažurirani:', cachedData.lastUpdated);
  } catch (error) {
    console.error('❌ Greška pri fetch-anju podataka:', error);
  }
}

// Cron job - ažuriraj podatke svakih 6 sati
cron.schedule('0 */6 * * *', () => {
  console.log('🔄 Pokrećem automatsko ažuriranje...');
  fetchClubData();
});

// API endpoints
app.get('/api/players', (req, res) => {
  res.json(cachedData.players);
});

app.get('/api/matches', (req, res) => {
  res.json(cachedData.matches);
});

app.get('/api/standings', (req, res) => {
  res.json(cachedData.standings);
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    lastUpdated: cachedData.lastUpdated
  });
});

// Početno učitavanje podataka
fetchClubData();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server pokrenut na portu ${PORT}`);
});
```

#### Frontend Integration

Ažuriraj `src/data/players.ts`:

```typescript
// src/data/players.ts
import type { Player } from '../types';

let cachedPlayers: Player[] | null = null;

export async function fetchPlayers(): Promise<Player[]> {
  if (cachedPlayers) return cachedPlayers;
  
  try {
    const response = await fetch('http://localhost:3001/api/players');
    cachedPlayers = await response.json();
    return cachedPlayers;
  } catch (error) {
    console.error('Error fetching players:', error);
    // Fallback na statične podatke
    return staticPlayers;
  }
}

// Statični podaci kao fallback
const staticPlayers: Player[] = [/* ... trenutni podaci ... */];
```

---

### **Opcija 2: Serverless Functions (Vercel/Netlify)**

#### Vercel API Route

`api/players.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Fetch podataka sa HNS stranice
    const response = await fetch('https://semafor.hns.family/klubovi/1546/nk-veli-vrh/');
    const data = await scrapePlayerData(response);
    
    // Cache na 6 sati
    res.setHeader('Cache-Control', 's-maxage=21600');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
```

---

### **Opcija 3: GitHub Actions + Static Site**

`.github/workflows/update-data.yml`:

```yaml
name: Update Club Data

on:
  schedule:
    # Pokreni svakih 6 sati
    - cron: '0 */6 * * *'
  workflow_dispatch: # Omogući manualno pokretanje

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Fetch and Update Data
        run: |
          node scripts/fetch-club-data.js
      
      - name: Commit Changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add src/data/
          git commit -m "🔄 Auto-update: Club data $(date)" || echo "No changes"
          git push
```

`scripts/fetch-club-data.js`:

```javascript
const fs = require('fs');
const fetch = require('node-fetch');

async function updateClubData() {
  // Fetch podataka
  const data = await fetchFromHNS();
  
  // Generiraj TypeScript fajlove
  fs.writeFileSync(
    'src/data/players.ts',
    generatePlayersFile(data.players)
  );
  
  console.log('✅ Podaci ažurirani');
}

updateClubData();
```

---

## Implementacija Web Scrapinga

Za povlačenje podataka sa HNS Semafor stranice, koristi **Puppeteer** ili **Cheerio**:

```bash
npm install puppeteer cheerio
```

```javascript
const puppeteer = require('puppeteer');

async function scrapeHNSData() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://semafor.hns.family/klubovi/1546/nk-veli-vrh/');
  
  const players = await page.evaluate(() => {
    // Ekstrakcija podataka iz DOM-a
    const rows = document.querySelectorAll('table.players tbody tr');
    return Array.from(rows).map(row => ({
      number: row.querySelector('td:nth-child(1)').textContent,
      name: row.querySelector('td:nth-child(2)').textContent,
      goals: row.querySelector('td:nth-child(3)').textContent,
      // ...
    }));
  });
  
  await browser.close();
  return players;
}
```

---

## Deployment

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## Napomene

- **Rate Limiting**: HNS stranica može imati rate limits - nemoj fetch-ati prečesto
- **Caching**: Koristi cache za smanjenje load-a na HNS servere
- **Error Handling**: Implementiraj fallback na statične podatke
- **Monitoring**: Postavi alertove ako fetch ne uspije

---

## Trenutno Stanje

- ✅ Statični podaci postavljeni sa HNS Semafor stranice (Feb 2026)
- ⏳ Backend za auto-refresh nije implementiran
- 📋 Potrebna implementacija web scraping logike

Za pomoć u postavljanju backend-a ili automatizaciji, kontaktiraj developera.
