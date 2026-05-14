# Homepage Redesign & Live Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the homepage hero section, fix live league table data, replace TopScorers with a ClubValues section, remove Gallery from nav, and add a Facebook-powered news section.

**Architecture:** All data follows the existing cron → Supabase → `/api/*` serverless endpoint → React hook → component pattern. The hero uses `useStandings` (already exists) to show live stats. News uses a new `useNews` hook backed by a new `news_posts` Supabase table populated daily by a new `/api/cron/sync-news` endpoint that calls the Facebook Graph API.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Motion, Vercel Serverless Functions, Supabase, Facebook Graph API v19, Barlow Condensed (Google Fonts), Lucide React.

**Spec:** `docs/superpowers/specs/2026-05-13-homepage-redesign-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/index.css` | Add Barlow Condensed font import + `@theme` vars |
| Modify | `src/components/home/HeroSection.tsx` | Full rewrite — white/orange, Barlow Condensed, live stats |
| Create | `src/components/home/ClubValues.tsx` | Club values section (replaces TopScorers) |
| Modify | `src/pages/HomePage.tsx` | Swap TopScorers→ClubValues, add NewsSection |
| Modify | `src/data/navigation.ts` | Remove Gallery nav item |
| Modify | `src/App.tsx` | Remove `/gallery` route |
| Modify | `src/hooks/useHNSData.ts` | Add `useNews` hook |
| Modify | `api/cron/sync.ts` | Improve error logging + add explicit auth guidance |
| Create | `api/news.ts` | `GET /api/news` — serve news_posts from Supabase |
| Create | `api/cron/sync-news.ts` | Daily cron — fetch Facebook posts, upsert to Supabase |
| Modify | `vercel.json` | Add `/api/cron/sync-news` to crons |
| Create | `src/components/home/NewsSection.tsx` | News photo cards grid |

---

## Task 1: Add Barlow Condensed font

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add Google Fonts import and theme vars**

Open `src/index.css`. The file currently starts with an `@import url(...)` for Inter + Space Grotesk. Add Barlow Condensed to that import and add the font vars to `@theme`.

Replace the first line:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
```
With:
```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
```

Then inside the `@theme { ... }` block, after the last `--font-display` line, add:
```css
  --font-barlow-condensed: 'Barlow Condensed', ui-sans-serif, sans-serif;
  --font-barlow: 'Barlow', ui-sans-serif, sans-serif;
```

- [ ] **Step 2: Verify font loads**

```bash
cd veli-vrh-fc && npm run dev
```

Open http://localhost:5173 in browser. Open DevTools → Network tab → filter by "barlow". Confirm the Google Fonts CSS is loaded. The font won't be visible anywhere yet — that's expected.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add Barlow Condensed font to theme"
```

---

## Task 2: Rewrite HeroSection

**Files:**
- Modify: `src/components/home/HeroSection.tsx`

The new hero is white with an orange accent bar (top + left edge), Barlow Condensed 900 for the club name, and four live stat rows on the right pulled from `useStandings`.

- [ ] **Step 1: Rewrite HeroSection.tsx**

Replace the entire file content:

```tsx
import { motion } from "motion/react";
import { useStandings } from "@/hooks/useHNSData";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  const { data: standings } = useStandings();
  const vv = standings.find((s) => s.team === "NK Veli Vrh");

  const stats = [
    {
      num: vv ? `${vv.position}.` : "–",
      label: "Trenutno",
      title: "Pozicija u ligi",
      accent: true,
    },
    {
      num: vv ? String(vv.points) : "–",
      label: "Ukupno",
      title: "Bodova ove sezone",
      accent: false,
    },
    {
      num: vv ? String(vv.wins) : "–",
      label: "Pobjede",
      title: `Od ${vv?.played ?? "–"} utakmica`,
      accent: false,
    },
    {
      num: vv ? String(vv.goalsFor) : "–",
      label: "Golovi",
      title: "Dano ove sezone",
      accent: false,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Top gradient bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[5px] z-10"
        style={{
          background: "linear-gradient(to right, #f97316, #fb923c, #f97316)",
        }}
      />
      {/* Left orange accent */}
      <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-orange-500 z-10" />
      {/* Radial glow top-right */}
      <div
        className="absolute top-0 right-0 w-[480px] h-[480px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
        }}
      />
      {/* Faded season number */}
      <div
        className="absolute right-6 bottom-[-30px] pointer-events-none select-none leading-none"
        style={{
          fontFamily: "var(--font-barlow-condensed)",
          fontWeight: 900,
          fontSize: "320px",
          color: "rgba(249,115,22,0.05)",
          letterSpacing: "-10px",
        }}
      >
        25
      </div>

      {/* Desktop layout */}
      <div className="relative z-10 mx-auto max-w-7xl pl-14 pr-8 hidden md:flex items-center min-h-[540px] py-16 gap-14">
        {/* Left column */}
        <div className="flex-none w-80">
          {/* Eyebrow */}
          <div
            className="flex items-center gap-2 mb-4 text-orange-500 uppercase tracking-[4px] text-[11px] font-bold"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            <span className="block w-6 h-[2px] bg-orange-500 flex-none" />
            Pula · Istra
          </div>

          {/* Club name */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5"
            style={{
              fontFamily: "var(--font-barlow-condensed)",
              fontWeight: 900,
              lineHeight: 0.85,
              letterSpacing: "-1px",
            }}
          >
            <span className="block text-[96px] text-gray-900">NK</span>
            <span className="block text-[88px] text-orange-500">Veli</span>
            <span className="block text-[96px] text-gray-900">Vrh</span>
          </motion.div>

          <motion.p
            className="text-[15px] text-gray-500 leading-relaxed max-w-[270px] mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Tradicija, zajednica i strast prema nogometu iz srca Istre.
          </motion.p>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button href="/about" variant="primary" size="lg">
              O Klubu
            </Button>
            <a
              href="/team"
              className="font-bold text-[13px] tracking-[2px] uppercase text-gray-400 hover:text-orange-500 transition-colors duration-200 flex items-center gap-1"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Momčad →
            </a>
          </motion.div>
        </div>

        {/* Right column — stat rows */}
        <div className="flex-1 flex flex-col gap-[2px]">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="flex items-stretch border border-gray-100 bg-white"
            >
              <div className="flex-none w-[90px] flex items-center justify-center border-r-[3px] border-orange-500 py-5 px-5">
                <span
                  className={`text-[44px] font-black leading-none ${
                    s.accent ? "text-orange-500" : "text-gray-900"
                  }`}
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {s.num}
                </span>
              </div>
              <div className="flex flex-col justify-center px-5 py-4">
                <span
                  className="text-[11px] font-bold tracking-[3px] uppercase text-gray-300 mb-[2px]"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {s.label}
                </span>
                <span
                  className="text-[16px] font-semibold text-gray-700"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {s.title}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="relative z-10 md:hidden px-6 pl-10 pt-14 pb-6">
        <div
          className="flex items-center gap-2 mb-3 text-orange-500 uppercase tracking-[4px] text-[11px] font-bold"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          <span className="block w-5 h-[2px] bg-orange-500 flex-none" />
          Pula · Istra
        </div>
        <div
          className="mb-4"
          style={{
            fontFamily: "var(--font-barlow-condensed)",
            fontWeight: 900,
            lineHeight: 0.85,
            letterSpacing: "-1px",
          }}
        >
          <span className="block text-[72px] text-gray-900">NK</span>
          <span className="block text-[66px] text-orange-500">Veli</span>
          <span className="block text-[72px] text-gray-900">Vrh</span>
        </div>
        <p className="text-[14px] text-gray-500 leading-relaxed mb-6">
          Tradicija, zajednica i strast prema nogometu iz srca Istre.
        </p>
        <div className="flex items-center gap-3 mb-8">
          <Button href="/about" variant="primary" size="lg">
            O Klubu
          </Button>
          <a
            href="/team"
            className="font-bold text-[13px] tracking-[2px] uppercase text-gray-400 hover:text-orange-500 transition-colors"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Momčad →
          </a>
        </div>
      </div>

      {/* Mobile stat strip */}
      <div className="md:hidden flex border-t border-gray-100">
        {stats.slice(0, 2).map((s) => (
          <div
            key={s.label}
            className="flex-1 text-center py-4 border-r last:border-r-0 border-gray-100"
          >
            <div
              className="text-[36px] font-black text-orange-500 leading-none"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              {s.num}
            </div>
            <div className="text-[11px] text-gray-400 tracking-widest uppercase mt-1">
              {s.title}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify in browser**

With `npm run dev` still running, open http://localhost:5173. You should see:
- White hero with a 5px orange gradient bar at the very top
- 6px orange bar on the left edge
- "NK / Veli (orange) / Vrh" in large Barlow Condensed 900
- Four stat rows on the right (position, points, wins, goals) — values from the API or "–" if loading
- On mobile (resize to < 768px): stacked layout with 2-stat strip at the bottom

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HeroSection.tsx
git commit -m "feat: redesign HeroSection — white/orange, Barlow Condensed, live stats"
```

---

## Task 3: Create ClubValues section

**Files:**
- Create: `src/components/home/ClubValues.tsx`
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Create ClubValues.tsx**

Create `src/components/home/ClubValues.tsx`:

```tsx
import { motion } from "motion/react";
import { Heart, Users, Star } from "lucide-react";

const values = [
  {
    Icon: Heart,
    title: "Tradicija",
    body: "Klub ukorijenjen u pulskoj četvrti Veli Vrh, čuvar lokalne nogometne kulture kroz desetljeća.",
  },
  {
    Icon: Users,
    title: "Zajednica",
    body: "Više od kluba — mjesto gdje se susreću generacije, obitelji i susjedi oko zajedničke strasti.",
  },
  {
    Icon: Star,
    title: "Mladi naraštaji",
    body: "Ulaganje u razvoj mladih igrača, jer budućnost kluba počinje na omladinskim treninzima.",
  },
];

export default function ClubValues() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Naše vrijednosti
          </h2>
          <p className="text-lg text-gray-500">Što NK Veli Vrh čini posebnim</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-8 border border-gray-100 hover:border-orange-200 rounded-xl transition-all duration-200 cursor-default"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mb-5 group-hover:bg-orange-100 transition-colors duration-200">
                <Icon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">
                {title}
              </h3>
              <p className="text-gray-500 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update HomePage.tsx**

Replace the entire content of `src/pages/HomePage.tsx`:

```tsx
import HeroSection from "@/components/home/HeroSection";
import IntroSection from "@/components/home/IntroSection";
import LeagueTable from "@/components/home/LeagueTable";
import ClubValues from "@/components/home/ClubValues";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IntroSection />
      <LeagueTable />
      <ClubValues />
    </>
  );
}
```

(NewsSection will be added in Task 8.)

- [ ] **Step 3: Verify in browser**

Scroll down on http://localhost:5173 past the league table. You should see three cards: Tradicija, Zajednica, Mladi naraštaji — each with a Lucide icon, orange on hover.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/ClubValues.tsx src/pages/HomePage.tsx
git commit -m "feat: add ClubValues section, replace TopScorers on homepage"
```

---

## Task 4: Remove Gallery from nav and routing

**Files:**
- Modify: `src/data/navigation.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Remove Gallery from navigation**

In `src/data/navigation.ts`, remove the Gallery entry. Final file:

```ts
import type { NavItem } from '../types';

export const navigationItems: NavItem[] = [
  { label: 'Početna', path: '/' },
  { label: 'O klubu', path: '/about' },
  { label: 'Momčad', path: '/team' },
  { label: 'Kontakt', path: '/contact' },
];
```

- [ ] **Step 2: Remove Gallery route from router**

In `src/App.tsx`, remove the GalleryPage import and route. Final file:

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router'
import MainLayout from '@/layouts/MainLayout'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import TeamPage from '@/pages/TeamPage'
import ContactPage from '@/pages/ContactPage'
import NotFoundPage from '@/pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'team', element: <TeamPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 3: Verify in browser**

Reload http://localhost:5173. Navbar should have 4 items: Početna, O klubu, Momčad, Kontakt. Visiting /gallery should now hit the NotFoundPage.

- [ ] **Step 4: Commit**

```bash
git add src/data/navigation.ts src/App.tsx
git commit -m "feat: remove Gallery from nav and routing until real photos available"
```

---

## Task 5: Fix league table cron (live data)

**Files:**
- Modify: `api/cron/sync.ts` (add logging)
- Action: Set `CRON_SECRET` in Vercel dashboard

The root cause: Vercel sends `Authorization: Bearer <CRON_SECRET>` when invoking cron endpoints — but only if `CRON_SECRET` is set as a Vercel environment variable. If the variable is missing, `process.env.CRON_SECRET` is `undefined`, the header never matches, and every cron invocation returns 401 without updating the database.

- [ ] **Step 1: Set CRON_SECRET in Vercel**

1. Go to your Vercel project dashboard → Settings → Environment Variables
2. Add a new variable: `CRON_SECRET` with any secure random value (e.g. run `openssl rand -hex 32` locally to generate one)
3. Make sure it applies to Production environment
4. Redeploy (Vercel will pick it up on next deploy)

- [ ] **Step 2: Add sync result logging to sync.ts**

In `api/cron/sync.ts`, find the success return and add a counts log line. Replace:

```ts
    const duration = Date.now() - startTime
    console.log(`[sync] Done in ${duration}ms`)

    return res.status(200).json({
```

With:

```ts
    const duration = Date.now() - startTime
    console.log(`[sync] Done in ${duration}ms — players: ${players.length}, standings: ${standings.length}, matches: ${matches.length}`)

    return res.status(200).json({
```

- [ ] **Step 3: Test the cron manually after deploying**

After deploying, trigger the cron manually from your terminal (replace `YOUR_CRON_SECRET` and `YOUR_VERCEL_URL`):

```bash
curl -X GET https://YOUR_VERCEL_URL/api/cron/sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -w "\nHTTP status: %{http_code}\n"
```

Expected output:
```
{"success":true,"duration_ms":...,"counts":{"players":...,"standings":...,"matches":...}}
HTTP status: 200
```

If you get 401: the `CRON_SECRET` env var in Vercel doesn't match what you used in the curl command.
If you get 500: check Vercel function logs for the scraper error.

- [ ] **Step 4: Verify table data in Supabase**

Open your Supabase project → Table Editor → `standings` table. Confirm rows exist and the `position`/`points` values match what you see on https://semafor.hns.family/klubovi/1546/nk-veli-vrh/

- [ ] **Step 5: Commit**

```bash
git add api/cron/sync.ts
git commit -m "fix: improve sync cron logging for easier debugging"
```

---

## Task 6: Add /api/news endpoint and useNews hook

**Files:**
- Create: `api/news.ts`
- Modify: `src/hooks/useHNSData.ts`

This task sets up the API layer for news. The `news_posts` Supabase table must exist before this works (see Step 1).

- [ ] **Step 1: Create news_posts table in Supabase**

In your Supabase project → SQL Editor, run:

```sql
create table if not exists news_posts (
  id text primary key,
  message text,
  full_picture text,
  created_time timestamptz not null,
  permalink_url text not null,
  synced_at timestamptz default now()
);

create index if not exists news_posts_created_time_idx on news_posts (created_time desc);
```

- [ ] **Step 2: Create api/news.ts**

Create `api/news.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const limit = Math.min(Number(req.query.limit) || 6, 20)

  const { data, error } = await supabase
    .from('news_posts')
    .select('id, message, full_picture, created_time, permalink_url')
    .order('created_time', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[/api/news] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch news' })
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')

  return res.status(200).json({
    data: data ?? [],
    fetchedAt: new Date().toISOString(),
  })
}
```

- [ ] **Step 3: Add useNews hook to src/hooks/useHNSData.ts**

At the end of `src/hooks/useHNSData.ts`, add:

```ts
interface NewsPost {
  id: string
  message: string | null
  full_picture: string | null
  created_time: string
  permalink_url: string
}

export function useNews(limit: number = 6) {
  const [data, setData] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_BASE_URL}/news?limit=${limit}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result: APIResponse<NewsPost[]> = await response.json()
        setData(result.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [limit])

  return { data, loading, error }
}
```

- [ ] **Step 4: Verify API endpoint locally**

Vercel serverless functions don't run in `vite dev`. Test by deploying a preview, or verify the TypeScript compiles without errors:

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add api/news.ts src/hooks/useHNSData.ts
git commit -m "feat: add /api/news endpoint and useNews hook"
```

---

## Task 7: Facebook news sync cron

**Files:**
- Create: `api/cron/sync-news.ts`
- Modify: `vercel.json`

**Prerequisite — Facebook setup (one-time, done by you before this task):**
1. Go to https://developers.facebook.com → Create App → select "Business" type
2. Add "Pages API" product
3. Go to Tools → Graph API Explorer
4. Select your NK Veli Vrh Facebook Page from the dropdown
5. Generate a Page Access Token with `pages_read_engagement` and `pages_show_list` permissions
6. Exchange for a long-lived token: `GET https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_TOKEN}`
7. Add to Vercel environment variables:
   - `FACEBOOK_PAGE_ID` — the numeric ID of the NK Veli Vrh page (visible in the page URL or About section)
   - `FACEBOOK_ACCESS_TOKEN` — the long-lived token from step 6

- [ ] **Step 1: Create api/cron/sync-news.ts**

Create `api/cron/sync-news.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../../lib/supabase'

const GRAPH_API_VERSION = 'v19.0'

interface FacebookPost {
  id: string
  message?: string
  full_picture?: string
  created_time: string
  permalink_url: string
}

interface FacebookResponse {
  data: FacebookPost[]
  paging?: {
    cursors: { before: string; after: string }
    next?: string
  }
}

async function fetchFacebookPosts(): Promise<FacebookPost[]> {
  const pageId = process.env.FACEBOOK_PAGE_ID
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN

  if (!pageId || !accessToken) {
    throw new Error('FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN not set')
  }

  const fields = 'id,message,full_picture,created_time,permalink_url'
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/posts?fields=${fields}&limit=20&access_token=${accessToken}`

  const response = await fetch(url)

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Facebook API error ${response.status}: ${body}`)
  }

  const result: FacebookResponse = await response.json()

  // Only keep posts that have a photo
  return result.data.filter((p) => Boolean(p.full_picture))
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const startTime = Date.now()
  console.log('[sync-news] Starting Facebook sync...')

  try {
    const posts = await fetchFacebookPosts()
    console.log(`[sync-news] Fetched ${posts.length} photo posts from Facebook`)

    if (posts.length === 0) {
      return res.status(200).json({ success: true, count: 0, duration_ms: Date.now() - startTime })
    }

    const rows = posts.map((p) => ({
      id: p.id,
      message: p.message ?? null,
      full_picture: p.full_picture!,
      created_time: p.created_time,
      permalink_url: p.permalink_url,
      synced_at: new Date().toISOString(),
    }))

    const { error } = await supabaseAdmin
      .from('news_posts')
      .upsert(rows, { onConflict: 'id' })

    if (error) throw new Error(`Supabase upsert error: ${error.message}`)

    const duration = Date.now() - startTime
    console.log(`[sync-news] Done in ${duration}ms — upserted ${rows.length} posts`)

    return res.status(200).json({
      success: true,
      count: rows.length,
      duration_ms: duration,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[sync-news] Error:', message)
    return res.status(500).json({ success: false, error: message })
  }
}
```

- [ ] **Step 2: Add sync-news to vercel.json crons**

In `vercel.json`, add the news sync cron. The `crons` array currently has one entry. Add a second:

```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 7 * * *"
    },
    {
      "path": "/api/cron/sync-news",
      "schedule": "0 8 * * *"
    }
  ],
  "rewrites": [
    { "source": "/((?!api).*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=300, stale-while-revalidate=3600"
        }
      ]
    }
  ]
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Deploy and manually trigger**

After deploying to Vercel, trigger manually:

```bash
curl -X GET https://YOUR_VERCEL_URL/api/cron/sync-news \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -w "\nHTTP status: %{http_code}\n"
```

Expected:
```json
{"success":true,"count":15,"duration_ms":1200}
HTTP status: 200
```

If you get `FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN not set`: the Vercel env vars are missing — add them and redeploy.
If you get a Facebook API 400 error: the access token is expired or missing permissions — regenerate it.

- [ ] **Step 5: Verify posts in Supabase**

Open Supabase → Table Editor → `news_posts`. Confirm rows exist with `full_picture` URLs.

- [ ] **Step 6: Commit**

```bash
git add api/cron/sync-news.ts vercel.json
git commit -m "feat: add Facebook news sync cron endpoint"
```

---

## Task 8: Build NewsSection component and wire to homepage

**Files:**
- Create: `src/components/home/NewsSection.tsx`
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Create NewsSection.tsx**

Create `src/components/home/NewsSection.tsx`:

```tsx
import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import { useNews } from "@/hooks/useHNSData";

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("hr-HR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsSection() {
  const { data: posts, loading, error } = useNews(6);

  // Don't render the section at all if there's an error or no data after load
  if (!loading && (error || posts.length === 0)) return null;

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Vijesti iz kluba
          </h2>
          <p className="text-lg text-gray-500">Najnovije s naših stranica</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))
            : posts.map((post, i) => (
                <motion.a
                  key={post.id}
                  href={post.permalink_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                >
                  {/* Photo */}
                  {post.full_picture && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.full_picture}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                      {formatDate(post.created_time)}
                    </p>
                    {post.message && (
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                        {post.message}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-1 text-orange-500 text-xs font-semibold group-hover:text-orange-600 transition-colors">
                      <span>Pogledaj na Facebooku</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </motion.a>
              ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add NewsSection to HomePage.tsx**

Replace `src/pages/HomePage.tsx`:

```tsx
import HeroSection from "@/components/home/HeroSection";
import IntroSection from "@/components/home/IntroSection";
import LeagueTable from "@/components/home/LeagueTable";
import ClubValues from "@/components/home/ClubValues";
import NewsSection from "@/components/home/NewsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IntroSection />
      <LeagueTable />
      <ClubValues />
      <NewsSection />
    </>
  );
}
```

- [ ] **Step 3: Verify in browser**

Open http://localhost:5173 and scroll to the bottom. You should see:
- **Before Facebook setup is done:** The section is invisible (`return null` when empty)
- **After Facebook setup + sync-news cron runs once:** 6 photo cards in a 3-column grid (2 on tablet, 1 on mobile), each with a date, truncated caption, and "Pogledaj na Facebooku" link

Test the loading state by temporarily throttling the network in DevTools → Network → Slow 3G. Skeleton cards should appear.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/NewsSection.tsx src/pages/HomePage.tsx
git commit -m "feat: add NewsSection with Facebook photo post cards"
```

---

## Task 9: Final verification and deploy

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: build succeeds with no errors. Check the output — the bundle should not be significantly larger (Barlow Condensed is loaded via Google Fonts CDN, not bundled).

- [ ] **Step 3: Visual smoke test — all viewport sizes**

With `npm run preview` (serves the production build):
- **Mobile 375px:** Hero → mobile layout visible, 2-stat strip, nav works, no Gallery link
- **Tablet 768px:** Hero → desktop layout kicks in, 3-col ClubValues grid
- **Desktop 1280px:** Full layout, stat rows visible in hero, news cards in 3-col grid

- [ ] **Step 4: Deploy to Vercel**

```bash
git push origin main
```

After deploy, check Vercel Functions logs for the next cron run (7am sync, 8am news sync) to confirm they execute successfully.

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -p
git commit -m "fix: post-deploy tweaks"
```
