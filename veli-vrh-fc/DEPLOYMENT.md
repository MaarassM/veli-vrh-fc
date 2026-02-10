# Deployment Guide - NK Veli Vrh

## 🚀 Vercel Deployment (Preporučeno)

### 1. Priprema projekta

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login
```

### 2. Deploy

```bash
# Production deploy
vercel --prod

# Preview deploy
vercel
```

### 3. Environment Variables

U Vercel dashboardu postavi:
```
VITE_USE_LIVE_DATA=true
VITE_API_BASE_URL=/api
```

### 4. Automatski deploy

Vercel automatski deploya na svaki push na:
- `main` branch → Production
- Ostali branchevi → Preview

## 📦 Netlify Deployment

### 1. netlify.toml

Datoteka već postoji u projektu.

### 2. Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### 3. Netlify Functions

API funkcije iz `/api` foldera automatski postaju Netlify Functions.

## 🔧 Manual Build & Deploy

### Build

```bash
npm run build
```

Outputa u `dist/` folder.

### Static Hosting (bez live data)

Upload `dist/` folder na bilo koji static host:
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront
- Firebase Hosting

**Napomena**: Bez serverless funkcija, live data neće raditi.

## 🛠️ Scraping Setup (Production)

### Opcija A: Puppeteer (Serverless Functions)

1. Install dependencies:
```bash
npm install puppeteer puppeteer-core chrome-aws-lambda
```

2. Update `api/players.ts`:
```typescript
import chromium from 'chrome-aws-lambda'
import puppeteer from 'puppeteer-core'

async function scrapePlayerStats() {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  })

  const page = await browser.newPage()
  await page.goto('https://semafor.hns.family/klubovi/1546/nk-veli-vrh/')

  // Scrape data...
  const players = await page.evaluate(() => {
    // ... extraction logic
  })

  await browser.close()
  return players
}
```

### Opcija B: Cheerio (Brže, bez headless browser-a)

1. Install:
```bash
npm install cheerio
```

2. Update API functions:
```typescript
import * as cheerio from 'cheerio'

async function scrapePlayerStats() {
  const response = await fetch('https://semafor.hns.family/klubovi/1546/nk-veli-vrh/')
  const html = await response.text()
  const $ = cheerio.load(html)

  const players = []
  $('.player-row').each((i, el) => {
    players.push({
      firstName: $(el).find('.first-name').text(),
      lastName: $(el).find('.last-name').text(),
      // ...
    })
  })

  return players
}
```

### Opcija C: GitHub Actions (Scheduled Static Updates)

Alternativa serverless funkcijama - periodično generira statične JSON datoteke:

```yaml
# .github/workflows/scrape-hns.yml
name: Scrape HNS Data

on:
  schedule:
    - cron: '0 */1 * * *'  # Svaki sat
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run scrape:hns
      - run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add public/data/*.json
          git commit -m "Update HNS data"
          git push
```

## 🔐 Environment Setup

### Development (.env.local)
```env
VITE_USE_LIVE_DATA=false
VITE_API_BASE_URL=/api
```

### Production (Vercel/Netlify)
```env
VITE_USE_LIVE_DATA=true
VITE_API_BASE_URL=/api
```

## 📊 Monitoring

### Vercel

Dashboard pokazuje:
- Function invocations
- Response times
- Error rates
- Cache hit rates

### Sentry Integration (Optional)

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: "your-dsn",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
})
```

## 🧪 Testing Live Data

### Local Testing

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Run dev server with serverless functions:
```bash
vercel dev
```

API će biti dostupan na `http://localhost:3000/api/*`

### Production Testing

```bash
# Deploy preview
vercel

# Test API endpoints
curl https://your-preview-url.vercel.app/api/players
curl https://your-preview-url.vercel.app/api/standings
curl https://your-preview-url.vercel.app/api/matches
```

## 🚨 Troubleshooting

### API 404 Errors

- Provjeri da postoji `vercel.json` ili `netlify.toml`
- Provjeri da su API funkcije u `/api` folderu
- Redeploy

### Scraping ne radi

- Provjeri CORS settings
- Provjeri da HNS Semafor nije promijenio HTML strukturu
- Povećaj timeout u Vercel/Netlify settings

### Spore response times

- Povećaj cache duration
- Koristi Cheerio umjesto Puppeteer-a
- Implementiraj incremental updates

## 📈 Performance Optimization

1. **CDN Caching**: Vercel/Netlify automatski
2. **API Caching**: 1 sat za standings/players, 30 min za matches
3. **Image Optimization**: Koristi Vercel Image Optimization
4. **Bundle Size**: Lazy load routes

## 🔄 Update Strategy

1. **Player Roster**: Ručno update u bazi (`npm run db:seed-simple`)
2. **Statistics**: Automatski svaki sat
3. **Standings**: Automatski svaki sat
4. **Matches**: Automatski svakih 30 minuta

## 🎯 Go Live Checklist

- [ ] Deploy na Vercel/Netlify
- [ ] Postavi environment variables
- [ ] Implementiraj scraping u API funkcijama
- [ ] Testiraj sve API endpoints
- [ ] Provjeri da live data radi
- [ ] Dodaj custom domain
- [ ] Setup monitoring (optional)
- [ ] Testiraj na mobilnom
- [ ] Check SEO meta tags
- [ ] Enable HTTPS
