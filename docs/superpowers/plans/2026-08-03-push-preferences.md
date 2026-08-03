# Push preference + kalendar po kategoriji — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Checkbox (`- [ ]`) koraci.

**Goal:** Korisnici biraju kategorije i vrste push obavijesti (rezultati / podsjetnici na dan utakmice); kalendar link jasno vezan uz odabranu kategoriju.

**Architecture:** Preferencije žive uz pretplatu u `push_subscriptions` (categories TEXT[], notify_results, notify_reminders). Sync šalje rezultate za SVE kategorije filtrirano po preferencijama; podsjetnike šalje jutarnji sync za današnje utakmice (marker `matches.reminder_sent`). UI: zvonce otvara panel s postavkama.

**Ograničenje (recieno korisniku):** live golovi nemogući sa scrapingom — samo uz COMET LIVE API.

## Global Constraints
- Hrvatski tekstovi; postojeći stil (PageHeader tipografija, orange-500)
- Čiste funkcije u lib/ s vitest testovima; `npm test && npm run build` prije commita
- Migracija: `supabase/migrations/2026-08-03-push-preferences.sql` (korisnik pokreće)

### Task 1: Migracija + tipovi
- `ALTER TABLE push_subscriptions ADD categories TEXT[] DEFAULT '{seniori}', notify_results BOOL DEFAULT TRUE, notify_reminders BOOL DEFAULT FALSE`
- `ALTER TABLE matches ADD reminder_sent BOOL DEFAULT FALSE`

### Task 2: lib/push-detect — recipijenti (TDD)
- `recipientsFor(subs, category, kind: 'result'|'reminder')` → subs filtrirani po categories & notify_*
- `todayInZagreb(now: Date): string` (YYYY-MM-DD, Europe/Zagreb)

### Task 3: Slanje po preferencijama
- `ResultNotification` dobiva `category`; sync-core skuplja notifikacije za SVE kategorije
- `lib/push.ts`: dohvat subs s prefs; rezultati filtrirani `recipientsFor`; naslov uključuje kategoriju za ne-seniore ("Juniori — kraj utakmice")
- Podsjetnici: u runSync nakon petlje — matches WHERE date=danas AND status=upcoming AND is_veli_vrh AND NOT reminder_sent → pošalji ("Danas: X - Y u HH:MM") → set reminder_sent

### Task 4: API
- `POST /api/push/subscribe` prima `{endpoint, keys, categories, notifyResults, notifyReminders}` → upsert s prefs
- `GET /api/push/subscribe?endpoint=` → vraća prefs (za popunjavanje panela)

### Task 5: PushBell → panel s postavkama
- Klik na zvonce (osim iOS neinstaliran → postojeći guide) otvara modal: master toggle, chips kategorija (multi), checkboxi "Rezultati" i "Podsjetnik na dan utakmice", Spremi
- Prefs mirror u localStorage; na otvaranje GET s endpointom ako je pretplaćen

### Task 6: Kalendar po kategoriji
- /utakmice link tekst prati aktivni tab: "Dodaj raspored u kalendar (Juniori)" — href već ima ?category

### Task 7: Verifikacija + deploy + podsjetnik korisniku (migracija)
