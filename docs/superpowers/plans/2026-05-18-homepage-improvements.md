# Homepage Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add transparent navbar, "Novosti" button + page, and next senior match banner to the NK Veli Vrh homepage.

**Architecture:** All data hooks already exist (`useNews`, `useMatches`). Changes are: layout adjustment to let the hero bleed under the transparent navbar, two new UI components, one new page, and minor routing/nav updates.

**Tech Stack:** React 18, React Router v7, Tailwind CSS, Framer Motion (`motion/react`), TypeScript

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/navbar/Navbar.tsx` | Modify | Transparent base state |
| `src/layouts/MainLayout.tsx` | Modify | Conditional top padding (home vs other pages) |
| `src/components/home/HeroSection.tsx` | Modify | Extra top padding + Novosti button |
| `src/components/home/NextMatchBanner.tsx` | Create | Next senior match card |
| `src/pages/HomePage.tsx` | Modify | Insert NextMatchBanner |
| `src/pages/NovostiPage.tsx` | Create | Full news page |
| `src/App.tsx` | Modify | Add /novosti route |
| `src/data/navigation.ts` | Modify | Add Novosti nav item |

---

### Task 1: Transparent Navbar + Layout Padding Fix

The navbar must be `bg-transparent` when not scrolled. Since `MainLayout` applies `pt-24 md:pt-28` to push content below the fixed navbar, the home page needs that padding removed so the hero can bleed to the top. The `HeroSection` compensates with its own top padding.

**Files:**
- Modify: `src/components/navbar/Navbar.tsx:18`
- Modify: `src/layouts/MainLayout.tsx:20`

- [ ] **Step 1: Make navbar transparent when not scrolled**

In `src/components/navbar/Navbar.tsx`, change line 18 from:
```tsx
      ? "py-3 bg-white/90 backdrop-blur-md shadow-md"
      : "py-5 bg-white"
```
to:
```tsx
      ? "py-3 bg-white/90 backdrop-blur-md shadow-md"
      : "py-5 bg-transparent"
```

- [ ] **Step 2: Remove top padding for home page in MainLayout**

In `src/layouts/MainLayout.tsx`, the `useLocation` hook is already imported. Change line 20:

```tsx
// Before
<main className="flex-1 pt-24 md:pt-28">

// After
<main className={`flex-1 ${location.pathname === '/' ? '' : 'pt-24 md:pt-28'}`}>
```

- [ ] **Step 3: Verify visually**

Run `npm run dev`, open `/`, confirm:
- Navbar is transparent on load
- Navbar becomes white/blurred on scroll
- Other pages (e.g. `/about`) still have content starting below the navbar

- [ ] **Step 4: Commit**

```bash
git add src/components/navbar/Navbar.tsx src/layouts/MainLayout.tsx
git commit -m "feat: transparent navbar with scroll-triggered background"
```

---

### Task 2: Hero Section — Top Padding + Novosti Button

With the home page no longer having `pt-24 md:pt-28`, the hero must provide its own top clearance so content doesn't hide behind the fixed navbar (≈96–112px tall). Also add the "Novosti" button.

**Files:**
- Modify: `src/components/home/HeroSection.tsx`

- [ ] **Step 1: Increase top padding and add Novosti button**

Replace the content div (line 41) and button section (lines 71-80) so the full updated section looks like this:

```tsx
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[600px] pt-32 pb-16 px-6">
        <motion.span
          className="block mb-5 text-orange-500 uppercase tracking-[5px] text-[10px] font-bold"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          — Pula · Istra —
        </motion.span>

        <motion.img
          src="/images/logo.png"
          alt="NK Veli Vrh"
          className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] object-contain mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />

        <motion.p
          className="text-[14px] text-gray-500 leading-relaxed max-w-[280px] mb-8"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Tradicija, zajednica i strast prema nogometu iz srca Istre.
        </motion.p>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button href="/about" variant="outline" size="md">
            O Klubu
          </Button>
          <Button href="/novosti" variant="primary" size="md">
            Novosti
          </Button>
        </motion.div>
      </div>
```

- [ ] **Step 2: Verify visually**

Open `/` — confirm both buttons appear side by side, hero content is not hidden behind the navbar.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HeroSection.tsx
git commit -m "feat: add Novosti button and increase hero top padding for transparent navbar"
```

---

### Task 3: NextMatchBanner Component

Shows the earliest upcoming senior match using the existing `useMatches()` hook. Renders `null` if no upcoming match exists or on error.

**Files:**
- Create: `src/components/home/NextMatchBanner.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/home/NextMatchBanner.tsx`:

```tsx
import { motion } from "motion/react";
import { useMatches } from "@/hooks/useHNSData";

function formatMatchDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("hr-HR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NextMatchBanner() {
  const { data: matches, loading } = useMatches();

  if (loading) {
    return (
      <div className="py-6 bg-white">
        <div className="mx-auto max-w-lg px-4">
          <div className="animate-pulse rounded-xl bg-gray-100 h-28" />
        </div>
      </div>
    );
  }

  const next = matches.find((m) => m.status === "upcoming");
  if (!next) return null;

  const isHome = next.venue === "home";

  return (
    <motion.section
      className="py-6 bg-white"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-lg px-4">
        <div className="rounded-xl border border-gray-100 shadow-sm bg-white px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[4px] text-orange-500 mb-3">
            Sljedeća utakmica seniora
          </p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-lg font-bold text-gray-900 leading-tight">
              {next.homeTeam}
            </span>
            <span className="text-sm font-semibold text-gray-400">vs</span>
            <span className="text-lg font-bold text-gray-900 leading-tight text-right">
              {next.awayTeam}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>{formatMatchDate(next.date)}</span>
            <span className="text-gray-300">·</span>
            <span>{next.competition}</span>
            <span className="text-gray-300">·</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isHome
                  ? "bg-orange-100 text-orange-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isHome ? "Domaćin" : "Gost"}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
```

- [ ] **Step 2: Insert into HomePage**

In `src/pages/HomePage.tsx`:

```tsx
import HeroSection from "@/components/home/HeroSection";
import NextMatchBanner from "@/components/home/NextMatchBanner";
import IntroSection from "@/components/home/IntroSection";
import LeagueTable from "@/components/home/LeagueTable";
import ClubValues from "@/components/home/ClubValues";
import NewsSection from "@/components/home/NewsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <NextMatchBanner />
      <IntroSection />
      <LeagueTable />
      <ClubValues />
      <NewsSection />
    </>
  );
}
```

- [ ] **Step 3: Verify visually**

Open `/` — if a match with `status: 'upcoming'` exists in Supabase, a card appears between the hero and the intro. If not, the section is invisible (no gap).

- [ ] **Step 4: Commit**

```bash
git add src/components/home/NextMatchBanner.tsx src/pages/HomePage.tsx
git commit -m "feat: add next senior match banner below hero"
```

---

### Task 4: Novosti Page + Route + Navigation

Full page showing last 10 Facebook posts. Uses the existing `useNews(10)` hook and `/api/news` endpoint.

**Files:**
- Create: `src/pages/NovostiPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/data/navigation.ts`

- [ ] **Step 1: Create NovostiPage**

Create `src/pages/NovostiPage.tsx`:

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

export default function NovostiPage() {
  const { data: posts, loading, error } = useNews(10);

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            Novosti iz kluba
          </h1>
          <p className="text-lg text-gray-500">
            Najnovije s naših Facebook stranica
          </p>
        </motion.div>

        {error && (
          <p className="text-center text-gray-500">
            Trenutno nema dostupnih novosti.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl overflow-hidden bg-white shadow-sm"
                >
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
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                >
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

- [ ] **Step 2: Add route in App.tsx**

In `src/App.tsx`, add the import and route:

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router'
import MainLayout from '@/layouts/MainLayout'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import TeamPage from '@/pages/TeamPage'
import KategorijaPage from '@/pages/KategorijaPage'
import ContactPage from '@/pages/ContactPage'
import NovostiPage from '@/pages/NovostiPage'
import NotFoundPage from '@/pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'team', element: <TeamPage /> },
      { path: 'kategorije', element: <KategorijaPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'novosti', element: <NovostiPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 3: Add Novosti to navigation**

In `src/data/navigation.ts`:

```ts
import type { NavItem } from '../types';

export const navigationItems: NavItem[] = [
  { label: 'Početna', path: '/' },
  { label: 'O klubu', path: '/about' },
  { label: 'Momčad', path: '/team' },
  { label: 'Kategorije', path: '/kategorije' },
  { label: 'Novosti', path: '/novosti' },
  { label: 'Kontakt', path: '/contact' },
];
```

- [ ] **Step 4: Verify visually**

- Open `/novosti` — confirm page title, skeleton cards or real posts render
- Click "Novosti" in the navbar — confirm it navigates correctly
- Confirm no top padding issue (the page has `pt-24 md:pt-28` from MainLayout since `pathname !== '/'`)

- [ ] **Step 5: Commit**

```bash
git add src/pages/NovostiPage.tsx src/App.tsx src/data/navigation.ts
git commit -m "feat: add Novosti page, route, and navigation item"
```
