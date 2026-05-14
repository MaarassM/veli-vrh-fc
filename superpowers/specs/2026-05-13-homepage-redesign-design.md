# NK Veli Vrh — Homepage Redesign & Live Data

**Date:** 2026-05-13  
**Status:** Approved  

---

## Scope

Five focused changes to the homepage and data pipeline:

1. Redesign `HeroSection` — no real photo, white/orange, Barlow Condensed 900
2. Fix league table staleness — cron not updating Supabase
3. Replace `TopScorers` with `ClubValues` section
4. Remove `GalleryPage` from nav and routing
5. Add `NewsSection` — Facebook posts synced to Supabase, displayed as photo cards

---

## 1. Hero Section Redesign

### Visual design
- **Background:** White (`#ffffff`) with a warm off-white feel
- **Top bar:** 5px full-width orange gradient (`#f97316 → #fb923c → #f97316`)
- **Left accent:** 6px vertical orange bar pinned to left edge
- **Typography:** `Barlow Condensed 900` for all headings (replace `Bebas Neue` in this component only, body stays as-is)
- **Google Fonts import:** `Barlow Condensed:wght@400;600;700;800;900` + `Barlow:wght@300;400;500;600`
- **Background detail:** Faded large number (`25` for season 25/26) bottom-right at ~5% orange opacity; radial orange glow top-right at 8% opacity

### Layout (desktop)
- Left column (320px): eyebrow line with orange dash → club name 3 lines (NK / **Veli** in orange / Vrh) at 96px → tagline → two CTAs ("O Klubu" filled orange, "Momčad" text link with arrow)
- Right column (flex-1): four stat rows, each with an orange-bordered number column + label column

### Stat rows (live from `/api/standings`)
| Stat | Label |
|------|-------|
| League position | Pozicija u ligi |
| Points | Bodova ove sezone |
| Wins | Pobjeda od N utakmica |
| Goals scored | Golovi dano ove sezone |

### Logo placeholder
The "VV" square logo-mark (52×52px, orange bg) is a placeholder. When the real club logo (`/images/logo.png`) is available, it replaces the logo-mark above the eyebrow line. No code change needed — just swap the element.

### Mobile (< 768px)
- Right stat grid hidden; show 2 key stats (position + points) as a horizontal 2-col strip below the text
- Club name scales to 64px
- Top bar and left accent remain

### Component file
`src/components/home/HeroSection.tsx` — full rewrite

---

## 2. League Table — Fix Live Data

### Root cause
`/api/cron/sync` validates `Authorization: Bearer <CRON_SECRET>`. Vercel's built-in cron does **not** automatically send this header. If `CRON_SECRET` is not set as a Vercel environment variable, `process.env.CRON_SECRET` is `undefined`, making the check always fail with 401 — so the database is never updated after initial seed.

### Fix
1. In Vercel dashboard → Settings → Environment Variables: confirm `CRON_SECRET` is set to a non-empty value
2. In `api/cron/sync.ts`: update auth check to also accept Vercel's own cron invocation using the `x-vercel-cron-authorization` header pattern, or relax to only require the secret when it is defined (dev fallback)
3. Add a `last_synced_at` column to a `sync_log` table entry; expose it via `/api/standings` response so the frontend can show "Updated: X hours ago"
4. Keep the daily 7am schedule — sufficient for a football club

### No frontend changes needed
`LeagueTable.tsx` already handles loading/error states and reads from `/api/standings` correctly.

---

## 3. Replace TopScorers → ClubValues Section

### Remove
Delete `TopScorers` from `HomePage.tsx` imports and JSX. Keep `src/components/home/TopScorers.tsx` file (don't delete — may be useful on the Team page later).

### New component: `src/components/home/ClubValues.tsx`
Three value cards, white background section, same vertical rhythm as other sections.

**Cards:**
| Icon (Lucide) | Title | Body text |
|---|---|---|
| `Heart` | Tradicija | Klub ukorijenjen u pulskoj četvrti Veli Vrh, čuvar lokalne nogometne kulture kroz desetljeća. |
| `Users` | Zajednica | Više od kluba — mjesto gdje se susreću generacije, obitelji i susjedi oko zajedničke strasti. |
| `Star` | Mladi naraštaji | Ulaganje u razvoj mladih igrača, jer budućnost kluba počinje na omladinskim treninzima. |

**Layout:** 3-column grid on desktop, stacked on mobile. Each card: orange icon top, bold title (Barlow Condensed), body text (Barlow). Subtle orange bottom-border on hover (200ms transition).

---

## 4. Remove Gallery Section

### Changes
- `src/pages/GalleryPage.tsx` — keep file, no changes
- `src/data/navigation.ts` — remove the Gallery nav entry
- `src/App.tsx` (or router file) — remove the `/gallery` route

**Rationale:** No real photos available yet. Page stays in codebase for future use.

---

## 5. News Section — Facebook Posts

### Architecture
Follows the same pattern as standings: **cron → Supabase → API → frontend**.

```
Facebook Graph API
       ↓  (daily cron)
api/cron/sync-news.ts
       ↓
Supabase: news_posts table
       ↓
api/news.ts  (GET /api/news)
       ↓
src/components/home/NewsSection.tsx
```

### Supabase table: `news_posts`
```sql
id            text primary key  -- Facebook post ID
message       text              -- post text (may be empty)
full_picture  text              -- photo URL from Facebook CDN
created_time  timestamptz
permalink_url text
synced_at     timestamptz default now()
```

### Facebook setup (one-time, done by user)
1. Create a Facebook App at developers.facebook.com
2. Add "Pages" product, generate a Page Access Token for the NK Veli Vrh page
3. Convert to long-lived token (60-day, or use never-expiring System User token)
4. Add to Vercel env vars: `FACEBOOK_PAGE_ID`, `FACEBOOK_ACCESS_TOKEN`

### Cron endpoint: `api/cron/sync-news.ts`
- Auth: same `CRON_SECRET` pattern as `sync.ts`
- Calls: `GET https://graph.facebook.com/v19.0/{PAGE_ID}/posts?fields=id,message,full_picture,created_time,permalink_url&limit=20&access_token={TOKEN}`
- Upserts results into `news_posts` (on conflict update message + full_picture)
- Only stores posts that have `full_picture` (photo posts only, since those are the club's primary format)
- Adds to `vercel.json` crons: `"0 8 * * *"` (8am daily)

### API endpoint: `api/news.ts`
- `GET /api/news?limit=6` — returns latest N posts ordered by `created_time DESC`
- Same response envelope as `/api/standings`: `{ data, fetchedAt }`
- Cache-Control: `s-maxage=3600, stale-while-revalidate=86400`

### Frontend: `src/components/home/NewsSection.tsx`
- Section heading: "Vijesti iz kluba"
- Responsive grid: 3 columns desktop, 2 tablet, 1 mobile
- Each card: photo (aspect-ratio 16/9, object-cover) → date (small, gray) → message text (2-line clamp) → "Pogledaj na Facebooku" link to permalink
- Loading: skeleton cards (3)
- Error / no data: graceful hide (section not shown)
- Added to `HomePage.tsx` after `LeagueTable`, before footer

### Hook: `src/hooks/useHNSData.ts`
Add `useNews(limit = 6)` hook following the same pattern as `useStandings`.

---

## HomePage section order (final)

```
HeroSection        ← redesigned
IntroSection       ← unchanged
LeagueTable        ← unchanged (data fixed by cron fix)
ClubValues         ← new (replaces TopScorers)
NewsSection        ← new
```

---

## Font changes

Add to `index.html` or CSS:
```
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
```

Tailwind config addition:
```js
fontFamily: {
  'barlow': ['Barlow', 'sans-serif'],
  'barlow-condensed': ['Barlow Condensed', 'sans-serif'],
}
```

Existing `font-display` (Bebas Neue) remains for other pages — only `HeroSection` switches to Barlow Condensed.

---

## Out of scope

- Admin UI for news — Supabase dashboard is sufficient
- Multiple age group tables — HNS Semafor has them but keeping one (seniors) for now
- Real club photos — handled separately when available
