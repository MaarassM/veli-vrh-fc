# Faza 3 — Angažman (kalendar, push, share grafike, PWA) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Navijači se pretplaćuju na raspored (.ics), dobivaju push obavijesti o rezultatima, klub dobiva auto-generirane grafike rezultata, a stranica se instalira kao aplikacija (PWA).

**Architecture:** Sve na postojećem stacku: Vercel funkcije čitaju Supabase; push preko `web-push` (VAPID) s pretplatama u Supabase i okidačem u sync-coreu (novi rezultat → notifikacija); grafike preko `@vercel/og` edge funkcije; .ics čisti string builder (testabilan).

**Tech Stack:** web-push, @vercel/og (jedine 2 nove ovisnosti), Service Worker API, iCalendar RFC 5545.

## Global Constraints

- Tekstovi hrvatski; postojeći vizualni stil (narančasta #f97316, tamna #111827)
- API oblik `{ data, fetchedAt }` gdje ima smisla; .ics i PNG vraćaju sirovi sadržaj s ispravnim Content-Type
- Čisti helperi u `lib/` s vitest testovima; bez `Date.now()` u helperima (parametar)
- Prije commita: `npm test && npm run build`
- Tajne u .env + napomena korisniku što dodati u Vercel env

---

### Task 1: .ics kalendar (TDD)

**Files:** Create `lib/ics.ts`, `api/calendar-ics.ts`; Modify `vercel.json` (rewrite `/kalendar.ics` → `/api/calendar-ics`); Test `tests/web/ics.test.ts`

**Interfaces:** `buildIcs(matches: IcsMatch[], calName: string): string` — VCALENDAR s VEVENT po utakmici; `IcsMatch = { id, date (YYYY-MM-DD), time (HH:mm|null), homeTeam, awayTeam, homeScore, awayScore, status, competition }`. Odigrane: SUMMARY s rezultatom; nadolazeće: SUMMARY "Doma/Gost", DTSTART Europe/Zagreb (18:00 default ako nema vremena), trajanje 2h, UID `{id}@nkvelivrh`. Escapeanje `,;\n`. Endpoint: `?category=seniori` default, sve utakmice Velog Vrha aktivne sezone.

- [ ] Test (VEVENT count, UID, escaped summary, datum format) → FAIL → implementacija → PASS → commit

### Task 2: "Dodaj u kalendar" + countdown

**Files:** Modify `src/pages/UtakmicePage.tsx` (gumb uz naslov), `src/components/home/NextMatchBanner.tsx` (provjeri prazno stanje izvan sezone + gumb pretplate)

- [ ] Gumb linka na `webcal://{host}/kalendar.ics` + fallback download link; NextMatchBanner bez sljedeće utakmice pokazuje "Raspored nove sezone objavljujemo uskoro"; commit

### Task 3: PWA — manifest + ikone

**Files:** Modify `public/site.webmanifest` (`display: standalone`, ikone 192/512 maskable); Create `public/images/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (iz logo.png sa `sips`); Modify `index.html` (apple-touch-icon link)

- [ ] Generiraj ikone, ažuriraj manifest, build, commit

### Task 4: Push notifikacije rezultata

**Files:** Create `supabase/migrations/2026-07-31-phase3-push.sql` (tablica `push_subscriptions`: endpoint TEXT PK, p256dh TEXT, auth TEXT, created_at; RLS service-only), `api/push/subscribe.ts` (POST upsert / DELETE), `api/push/key.ts` (vraća VAPID public key — bez VITE env), `public/sw.js` (push → showNotification s klupskim logom, click → /utakmice), `src/components/ui/PushBell.tsx` (zvonce: registrira SW, Notification.requestPermission, subscribe, spremi; toggle off = unsubscribe), `lib/push.ts` (sendResultNotifications: usporedi svježe scrapeane rezultate sa stanjem u bazi PRIJE upserta — novo odigrana Veli Vrh utakmica → web-push svima; obriši mrtve pretplate na 404/410)

**Modify:** `lib/hns/sync-core.ts` (nakon syncCompetition seniori: pozovi sendResultNotifications s listom novoodigranih), `package.json` (web-push), `src/layouts/MainLayout.tsx` ili Navbar (PushBell)

**Env (korisnik dodaje u Vercel):** `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT=mailto:nkvelivrh@gmail.com` — generiram lokalno u .env.

- [ ] Migracija SQL + generiraj VAPID ključeve u .env
- [ ] lib/push.ts s testom za detekciju novih rezultata (čista funkcija `newlyPlayed(before, after)`) → TDD
- [ ] API + SW + PushBell; build; commit

### Task 5: OG grafika rezultata

**Files:** Create `api/og/match.tsx` (edge runtime, @vercel/og): ulaz `?id={matchId}` → PNG 1200×630: klubovi, rezultat, natjecanje, datum, narančasti brand; podaci preko Supabase REST fetch (anon key). Modify `src/pages/UtakmicaDetaljPage.tsx`: gumb "Preuzmi grafiku" → otvara PNG (klub je dijeli na mrežama).

- [ ] Implementacija + build + ručna provjera PNG-a na produkciji nakon deploya; commit

### Task 6: Verifikacija + deploy

- [ ] `npm test && npm run build`; merge u main, push, deploy; produkcija: /kalendar.ics validan, /api/og/match PNG, /api/push/key; podsjetnik korisniku (migracija + env varovi)
