# Production Readiness Design — NK Veli Vrh

**Date:** 2026-05-19  
**Domain:** nkvelivrh.com (not yet purchased)  
**Goal:** Deploy-ready site that ranks for "veli vrh", "nk veli vrh", "pula nogomet", "istrasport"

---

## 1. Croatian URL Paths

All route paths must be in Croatian to match the Croatian-language site and improve local SEO.

### Route changes in `src/App.tsx`

| Old path | New path | Page |
|---|---|---|
| `/about` | `/o-klubu` | AboutPage |
| `/team` | `/strucni-stozer` | TeamPage |
| `/contact` | `/kontakt` | ContactPage |
| `/kategorije` | `/kategorije` | KategorijaPage (unchanged) |
| `/novosti` | `/novosti` | NovostiPage (unchanged) |

All internal `<Link>` or `href` references to old paths must be updated across:
- `src/components/navbar/Navbar.tsx`
- `src/data/navigation.ts`
- `src/components/navbar/NavLink.tsx`
- `src/pages/NotFoundPage.tsx`
- `src/components/footer/Footer.tsx`
- Any other component linking to these routes

---

## 2. SEO Meta Tags — `react-helmet-async`

### Package
Install `react-helmet-async`. Add `HelmetProvider` at the root in `src/main.tsx`.

### `src/components/seo/SEO.tsx` — reusable component
Props: `title`, `description`, `canonicalPath` (optional), `ogImage` (optional).

Renders:
- `<title>` — format: `${title} | NK Veli Vrh`
- `<meta name="description">`
- `<meta name="keywords">` — always includes: "NK Veli Vrh, veli vrh, pula nogomet, Istra, HNS, 5. liga Istra"
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:locale` (hr_HR), `og:site_name`
- Twitter: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `<link rel="canonical">` — points to `https://nkvelivrh.com${canonicalPath}`

### Per-page SEO configuration

| Page | Title | Description |
|---|---|---|
| HomePage | `NK Veli Vrh \| Nogometni klub iz Pule, Istra` | `NK Veli Vrh je hrvatska nogometna udruga iz Pule, Istra. Pratite rezultate, vijesti i raspored utakmica.` |
| AboutPage | `O klubu \| NK Veli Vrh — Povijest od 1975.` | `Saznajte više o NK Veli Vrh, nogometnom klubu osnovanom 1975. godine u Puli, Istra.` |
| TeamPage | `Stručni stožer \| NK Veli Vrh Pula` | `Upoznajte stručni stožer i igrače NK Veli Vrh iz Pule.` |
| KategorijaPage | `Kategorije \| NK Veli Vrh` | `Ljestvice, rezultati i statistike kategorija NK Veli Vrh.` |
| NovostiPage | `Novosti \| NK Veli Vrh` | `Najnovije vijesti, izvještaji s utakmica i obavijesti NK Veli Vrh Pula.` |
| ContactPage | `Kontakt \| NK Veli Vrh Pula` | `Kontaktirajte NK Veli Vrh. Adresa: Veli Vrh 1, 52100 Pula. Email: nkvelivrh@gmail.com` |
| NotFoundPage | `Stranica nije pronađena \| NK Veli Vrh` | (default) |

---

## 3. JSON-LD Structured Data

Added as a `<script type="application/ld+json">` in `index.html` (static, applies to all pages):

```json
{
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  "name": "NK Veli Vrh",
  "alternateName": ["Veli Vrh FC", "NK Veli Vrh Pula", "Veli Vrh"],
  "url": "https://nkvelivrh.com",
  "logo": "https://nkvelivrh.com/images/logo.png",
  "image": "https://nkvelivrh.com/images/team-celebration.jpg",
  "foundingDate": "1975",
  "sport": "Nogomet",
  "description": "NK Veli Vrh je hrvatska nogometna udruga iz Pule, Istra, osnovana 1975. godine.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Veli Vrh 1",
    "addressLocality": "Pula",
    "postalCode": "52100",
    "addressCountry": "HR"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "nkvelivrh@gmail.com",
    "contactType": "customer service"
  },
  "sameAs": [
    "https://www.facebook.com/velivrhpula",
    "https://www.instagram.com/nkvelivrh1975/"
  ]
}
```

---

## 4. `index.html` Improvements

- Replace the existing minimal `<meta name="description">` with full Open Graph/Twitter tags
- Add `<meta name="robots" content="index, follow">`
- Add `<link rel="preconnect">` for Supabase and Google Fonts domains (if used)
- Add `<meta property="og:image">` pointing to `/images/team-celebration.jpg`
- Add `<link rel="apple-touch-icon">` and `<link rel="manifest">` for PWA basics
- Add JSON-LD structured data script

---

## 5. `public/sitemap.xml`

Static sitemap listing all pages with `nkvelivrh.com` domain:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://nkvelivrh.com/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://nkvelivrh.com/o-klubu</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://nkvelivrh.com/strucni-stozer</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://nkvelivrh.com/kategorije</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://nkvelivrh.com/novosti</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://nkvelivrh.com/kontakt</loc><changefreq>yearly</changefreq><priority>0.5</priority></url>
</urlset>
```

---

## 6. `public/robots.txt`

```
User-agent: *
Allow: /
Sitemap: https://nkvelivrh.com/sitemap.xml
```

---

## 7. Security Headers — `vercel.json`

Add a global `headers` entry (separate from the existing `/api/(.*)` entry):

```json
{
  "source": "/(.*)",
  "headers": [
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
    { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;"
    }
  ]
}
```

---

## 8. Cookie Notice Component

**`src/components/ui/CookieNotice.tsx`**

- Renders a fixed bar at the bottom of the screen
- Text (Croatian): *"Ova stranica koristi neophodne tehničke kolačiće za ispravno funkcioniranje. Nastavkom korištenja stranice prihvaćate njihovu upotrebu."*
- Single "Razumijem" (I understand) button
- On click: saves `cookie-notice-dismissed = true` to `localStorage`, hides the banner
- On load: reads `localStorage`, skips rendering if already dismissed
- Added to `MainLayout.tsx`

---

## 9. `public/site.webmanifest`

Basic PWA manifest so the site can be added to phone home screens:

```json
{
  "name": "NK Veli Vrh",
  "short_name": "NK Veli Vrh",
  "icons": [{"src": "/images/logo.png", "sizes": "any", "type": "image/png"}],
  "start_url": "/",
  "display": "browser",
  "background_color": "#ffffff",
  "theme_color": "#f97316"
}
```

---

## Scope

- No analytics (no Google Analytics, no Plausible)
- No server-side rendering; site remains a Vite SPA deployed on Vercel
- No new pages
- No design changes
- No auth changes

## Files Changed / Created

| File | Action |
|---|---|
| `package.json` | Add `react-helmet-async` |
| `src/main.tsx` | Wrap app in `HelmetProvider` |
| `src/App.tsx` | Update route paths to Croatian |
| `src/data/navigation.ts` | Update nav link paths |
| `src/components/navbar/Navbar.tsx` | Update any hardcoded paths |
| `src/components/navbar/NavLink.tsx` | Verify path handling |
| `src/components/footer/Footer.tsx` | Update any footer links |
| `src/pages/NotFoundPage.tsx` | Update any links |
| `src/components/seo/SEO.tsx` | Create new |
| `src/pages/HomePage.tsx` | Add `<SEO>` |
| `src/pages/AboutPage.tsx` | Add `<SEO>` |
| `src/pages/TeamPage.tsx` | Add `<SEO>` |
| `src/pages/KategorijaPage.tsx` | Add `<SEO>` |
| `src/pages/NovostiPage.tsx` | Add `<SEO>` |
| `src/pages/ContactPage.tsx` | Add `<SEO>` |
| `src/pages/NotFoundPage.tsx` | Add `<SEO>` |
| `src/components/ui/CookieNotice.tsx` | Create new |
| `src/layouts/MainLayout.tsx` | Add `<CookieNotice>` |
| `index.html` | Add OG tags, JSON-LD, manifest link |
| `public/sitemap.xml` | Create new |
| `public/robots.txt` | Create new |
| `public/site.webmanifest` | Create new |
| `vercel.json` | Add security headers |
