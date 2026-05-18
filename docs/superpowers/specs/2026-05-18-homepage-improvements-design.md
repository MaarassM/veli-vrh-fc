# Design: Homepage Improvements

**Date:** 2026-05-18  
**Status:** Approved

## Overview

Three UI improvements to the NK Veli Vrh website:
1. Transparent navbar that gains a background on scroll
2. "Novosti" button in the hero section linking to a new news page
3. "Sljedeća utakmica seniora" match banner below the hero

---

## 1. Transparent Header

**File:** `src/components/navbar/Navbar.tsx` (line 18)

Change the non-scrolled navbar background from `bg-white` to `bg-transparent`. The scrolled state (`bg-white/90 backdrop-blur-md shadow-md`) stays unchanged. This prepares the layout for a future hero background image — the navbar will be invisible until the user scrolls, at which point it becomes an opaque pill/bar.

No text or logo color changes required — the hero background is warm light (#fff8f3), so dark text and the logo remain readable.

---

## 2. "Novosti" Button in Hero

**File:** `src/components/home/HeroSection.tsx`

Add a second button to the existing button row:

```tsx
<Button href="/novosti" variant="primary" size="md">Novosti</Button>
```

The existing `flex items-center gap-4` wrapper already accommodates two buttons. "O Klubu" keeps its `outline` variant; the new "Novosti" button uses `primary` (filled orange) to give it visual prominence.

---

## 3. Novosti Page

**New files:**
- `src/pages/NovostiPage.tsx`

**Modified files:**
- `src/App.tsx` — add route `{ path: 'novosti', element: <NovostiPage /> }`
- `src/data/navigation.ts` — add `{ label: 'Novosti', path: '/novosti' }`

**Page structure:**
- Page header: "Novosti iz kluba" (h1) + subtitle "Najnovije s naših Facebook stranica"
- Calls `useNews(10)` — no new API needed, existing `/api/news` already supports up to 20 posts
- Same card grid as the existing `NewsSection` component (image + date + excerpt + external Facebook link)
- Loading state: 10 skeleton cards (same pulse animation as `NewsSection`)
- Error/empty state: friendly Croatian message "Trenutno nema dostupnih novosti."

---

## 4. "Sljedeća utakmica seniora" Banner

**New file:** `src/components/home/NextMatchBanner.tsx`

**Modified file:** `src/pages/HomePage.tsx` — insert `<NextMatchBanner />` between `<HeroSection />` and `<IntroSection />`

**Data source:** existing `useMatches()` hook → `/api/matches?category=seniori` → Supabase `matches` table (synced from HNS via cron)

**Logic:**
- Filter matches for `status === 'upcoming'`
- Take `[0]` (earliest upcoming match)
- If none found → render `null`

**Card contents:**
- Section label: "Sljedeća utakmica seniora" (small uppercase tracking label, orange)
- Home team vs Away team (large bold)
- Date formatted in Croatian: e.g. "srijeda, 21. svibnja 2026."
- Competition name
- Home/Away badge (e.g. "Domaćin" / "Gost")

**Styling:**
- White card with subtle shadow, centered, max-w ~lg
- Consistent with existing card design language (rounded-xl, shadow-sm)
- Loading state: single skeleton card

---

## File Change Summary

| File | Change |
|------|--------|
| `src/components/navbar/Navbar.tsx` | `bg-white` → `bg-transparent` (non-scrolled state) |
| `src/components/home/HeroSection.tsx` | Add "Novosti" primary button |
| `src/pages/NovostiPage.tsx` | New — full news page |
| `src/components/home/NextMatchBanner.tsx` | New — next match card |
| `src/pages/HomePage.tsx` | Insert `<NextMatchBanner />` |
| `src/App.tsx` | Add `/novosti` route |
| `src/data/navigation.ts` | Add Novosti nav item |
