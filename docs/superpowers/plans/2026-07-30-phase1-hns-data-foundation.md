# Phase 1: HNS Data Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the club-page-only HNS scraper with a competition-page scraper that captures full league fixtures, standings with form, league scorers, and per-match details (events, lineups, attendance), with automatic season/competition discovery and safe (non-destructive) sync.

**Architecture:** Pure parser functions (`lib/hns/parsers.ts`) tested against real HTML fixtures with Vitest; a discovery module (`lib/hns/discovery.ts`) that resolves competition IDs per season via Semafor's public JSON handlers; a rewritten cron orchestrator (`api/cron/sync.ts`) that scrapes competition pages + club roster pages + a bounded number of match-detail pages per run, writing to Supabase with guarded replace/upsert. Frequent triggering happens via a GitHub Actions schedule hitting the existing endpoint (Vercel Hobby crons are limited to 1×/day).

**Tech Stack:** TypeScript, Cheerio, Vitest, Vercel serverless functions, Supabase (Postgres), GitHub Actions.

## Global Constraints

- ESM project (`"type": "module"`); relative imports in `api/` and `lib/` code MUST use the `.js` extension (existing pattern, e.g. `import { supabaseAdmin } from '../../lib/supabase.js'`).
- Shared server code lives in root `lib/` (NOT inside `api/` — every `api/**/*.ts` becomes a Vercel function).
- Existing API response shapes must remain backward compatible (frontend hooks `useHNSData.ts` and `useKategorija.ts` consume them). Changes are additive only.
- Veli Vrh HNS club ID: `1546`. Semafor base URL: `https://semafor.hns.family`.
- Scraper etiquette: single User-Agent string `Mozilla/5.0 (compatible; NK-Veli-Vrh-Site/1.0)`, ≥300 ms delay between requests, max 5 match-detail fetches per sync run.
- Category keys (frontend depends on them): `seniori`, `juniori`, `pioniri`, `mladi-pioniri`, `u-11`, `u-9`, `veterani`. Cup matches use category `seniori` with a separate competition.
- All UI copy is Croatian (no UI changes in this phase).
- Test command: `npm test` (vitest run). Build must pass: `npm run build`.
- Commit after every green step (`Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`).

## HNS Semafor reference (verified 2026-07-30 against live site)

- Competition page: `GET /natjecanja/{cid}/x/` (slug arbitrary). Verified layout (cheerio, 2026-07-30):
  - **Standings** are OUTSIDE the `competition_results_scorers_cards` block: exactly one `div.competition_table.type1` per league part, page-wide (fixture: pane `tabContent_10003_1` = "ELITNA LIGA NSŽI 25/26 1.DIO", `tabContent_10003_2` = "…TREĆI DIO", 10 rows each). Part label: `closest('div[id^="tabContent"]')` → match its `id` against `.tabs li[data-content]` → `span` text. Rows `li.row[data-clubid]` with children `.position .club a .played .wins .draws .losses .gplus .gminus .gdiff .points .form` — form is `div.formW|formD|formL` children. Club logo: `.club img@src`; club link `a@href` = `/klubovi/{id}/{slug}/`. The top `div.scoreboard_matches_line` (unrelated national live matches) has no `competition_table`, so page-wide table selection is safe — but matches MUST be scoped (below).
  - **Fixtures/results** are INSIDE `div.competition_results_scorers_cards` → `div.current_results div.matchlist` (fixture: pane `tabContent_10001_1` = 90 matches/18 rounds, `tabContent_10001_2` = 45 matches/9 rounds). Rows `li.row[data-round][data-match]`, children: `.date` ("06.09.2025. 17:30"), `.club1[data-id] a` (text + nested `.logo img`), `.club2[data-id] a`, `.res1`/`.res2` ("-" when not played).
  - **Scorers**: league-wide list is the FIRST `div.playerslist` inside `competition_results_scorers_cards` (pane `tabContent_10002_1`, tab "Strijelci") and contains only the **top 5** (fixture: Antonio Gračić 24, Sebastian Jokić 19, Laurent Kastrati 12, Irian Beviakva 12, Josip Pavišić 11). Sibling panes `_2`/`_3` are "Kartoni" and "Nastupi / minute" (their rows have empty `.goals`). Rows `li.row[data-personid]` with `.position`, `.playerName h3 a` (name + player URL), `.playerName` trailing text (club name), `.goals`, `.playerPhoto img@src`. NOTE: panes `tabContent_10004+` are per-club widgets (Utakmice/Igrači/Strijelci/… per club) OUTSIDE the scope block — must not leak in.
- Match page: `GET /utakmice/{matchId}/x/`. Contains: `.clubs .club1|.club2 .title` (names) + `.logo img`, `.result .res1|.res2`, `.status` ("Završeno"), `.facility` ("Fortin, Štinjan, 26.10.2025. 10:30"), `.attendance` ("Gledatelja: 100"), `.referees`; lineups: two `div.playerslist` blocks (`li.header.clubName` gives team name), rows `li.row.match_lineup[data-personid]` with `.shirtNumber`, `.playerName h3 a` (name; "(C)" suffix = captain), trailing text = position ("Vratar"/"Igrač"), `.matchEvents ul.events li.{goal|substitutionIn|substitutionOut|yellowCard|redCard|...}` with `div.icon@title` (Croatian label) and text minute ("78'").
- Discovery JSON handlers (public, no auth; require `t` = ms timestamp and `lang=hr`):
  - `GET /handlers/getAgeCategories/?season={YYYY/YYYY+1}&t={ts}&lang=hr&clubID=1546` → `[{"id":"Seniors","value":"Seniors"},...]`
  - `GET /handlers/getCompetitions/?season={s}&acat={acat}&t={ts}&lang=hr&clubID=1546&linkType=club_profile&linkConstructor=/x` → `[{"id":100703751,"value":"ELITNA LIGA NSŽI 25/26",...},...]`
- Fixtures already committed under `tests/fixtures/hns/`: `competition-elitna.html` (full Elitna liga page), `match-velivrh.html` (Štinjan 7:1 Veli Vrh, attendance 100, goals + subs events), `club-page.html` (club page, seniors), `handler-agecats.json`, `handler-comps.json`.

## File Structure

```
lib/hns/types.ts          — shared TS types for parsed data
lib/hns/parsers.ts        — pure HTML → data functions (cheerio), no IO
lib/hns/discovery.ts      — season computation + competition discovery (fetch injected)
lib/hns/fetch.ts          — fetchHtml/fetchJson with UA + delay helper
lib/hns/sync-core.ts      — runSync(): full orchestration, exported for reuse
api/cron/sync.ts          — thin Vercel handler calling runSync()
api/scorers.ts            — NEW endpoint: league scorers per category
api/match.ts              — NEW endpoint: match detail (info+lineups+events)
api/standings.ts          — additive update (part/form fields, part selection)
api/matches.ts            — additive update (veliVrh filter default, round/time fields)
supabase/migrations/2026-07-30-phase1-hns.sql — schema changes (manual run)
tests/hns/parsers.competition.test.ts
tests/hns/parsers.match.test.ts
tests/hns/parsers.club.test.ts
tests/hns/discovery.test.ts
.github/workflows/hns-sync.yml — scheduled trigger
scripts/sync-local.ts     — run sync locally against Supabase (tsx)
vitest.config.ts
```

---

### Task 1: Vitest infrastructure

**Files:**
- Modify: `package.json` (add vitest devDependency + `test` script)
- Create: `vitest.config.ts`
- Create: `tests/hns/smoke.test.ts` (temporary, deleted in Task 2)

**Interfaces:**
- Produces: `npm test` runs vitest against `tests/**/*.test.ts`.

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Add test script and config**

In `package.json` scripts add: `"test": "vitest run"`.

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
```

- [ ] **Step 3: Write smoke test verifying fixtures exist**

`tests/hns/smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

describe('fixtures', () => {
  it('competition fixture is present and non-trivial', () => {
    const html = readFileSync('tests/fixtures/hns/competition-elitna.html', 'utf-8')
    expect(html.length).toBeGreaterThan(100_000)
    expect(html).toContain('ELITNA LIGA')
  })
})
```

- [ ] **Step 4: Run and verify pass**

Run: `npm test`
Expected: 1 test PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/
git commit -m "test: add vitest infrastructure and HNS fixtures"
```

---

### Task 2: Types + competition-page standings parser

**Files:**
- Create: `lib/hns/types.ts`
- Create: `lib/hns/parsers.ts`
- Create: `tests/hns/parsers.competition.test.ts`
- Delete: `tests/hns/smoke.test.ts`

**Interfaces:**
- Produces:
  - `lib/hns/types.ts` exports: `ParsedStanding`, `ParsedMatch`, `ParsedScorer`, `ParsedCompetitionPage`, `ParsedMatchDetail`, `ParsedLineupPlayer`, `ParsedMatchEvent`, `ParsedRosterPlayer`, `CompetitionInfo` (exact shapes below — later tasks import these verbatim).
  - `parsers.ts` exports `parseCompetitionPage(html: string): ParsedCompetitionPage` (this task implements only the `standingsParts` portion; `matches`/`scorers` arrive in Task 3 — return empty arrays for them here).

`lib/hns/types.ts` (write in full now; later tasks rely on all of it):

```typescript
export interface ParsedStanding {
  part: string            // league part label, e.g. "ELITNA LIGA NSŽI 25/26 1.DIO"; '' if single table
  position: number
  clubId: number | null   // from /klubovi/{id}/ href
  team: string
  logoUrl: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string            // e.g. "WWDLW", oldest→newest as rendered, '' if absent
}

export interface ParsedMatch {
  matchId: number         // data-match
  round: number           // data-round
  part: string            // same labels as standings parts
  date: string | null     // ISO "2025-09-06" or null if unparseable
  time: string | null     // "17:30" or null
  homeClubId: number | null
  homeTeam: string
  homeLogoUrl: string
  awayClubId: number | null
  awayTeam: string
  awayLogoUrl: string
  homeScore: number | null
  awayScore: number | null
  status: 'played' | 'upcoming'
}

export interface ParsedScorer {
  personId: number
  position: number
  name: string
  club: string
  goals: number
  photoUrl: string
  playerUrl: string
}

export interface ParsedCompetitionPage {
  standingsParts: ParsedStanding[]   // all parts concatenated, distinguished by `part`
  matches: ParsedMatch[]
  scorers: ParsedScorer[]
}

export interface ParsedLineupPlayer {
  personId: number
  team: 'home' | 'away'
  teamName: string
  number: number
  name: string
  isCaptain: boolean
  position: string        // "Vratar" | "Igrač"
  photoUrl: string
}

export interface ParsedMatchEvent {
  personId: number
  playerName: string
  team: 'home' | 'away'
  minute: number | null
  type: string            // css class: 'goal' | 'substitutionIn' | 'substitutionOut' | 'yellowCard' | 'redCard' | ...
  label: string           // Croatian title attr: 'Gol', 'Izmjena', ...
}

export interface ParsedMatchDetail {
  homeTeam: string
  awayTeam: string
  homeLogoUrl: string
  awayLogoUrl: string
  homeScore: number | null
  awayScore: number | null
  status: string          // "Završeno" etc.
  venue: string           // facility without trailing datetime, e.g. "Fortin, Štinjan"
  kickoffAt: string | null // ISO "2025-10-26T10:30" (local, no TZ)
  attendance: number | null
  referees: string
  lineups: ParsedLineupPlayer[]
  events: ParsedMatchEvent[]
}

export interface ParsedRosterPlayer {
  firstName: string
  lastName: string
  number: number
  position: string
  appearances: number
  goals: number
  yellowCards: number
  redCards: number
  imageUrl: string
}

export interface CompetitionInfo {
  cid: number
  name: string
  season: string          // "2025/2026"
  acat: string            // HNS age category id, e.g. "Seniors"
  category: string        // our key, e.g. "seniori"
  isCup: boolean
}
```

- [ ] **Step 1: Write failing tests for standings parsing**

`tests/hns/parsers.competition.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseCompetitionPage } from '../../lib/hns/parsers.js'

const html = readFileSync('tests/fixtures/hns/competition-elitna.html', 'utf-8')

describe('parseCompetitionPage — standings', () => {
  const { standingsParts } = parseCompetitionPage(html)

  it('parses both league parts (1.DIO and TREĆI DIO), 10 rows each', () => {
    const parts = [...new Set(standingsParts.map(s => s.part))]
    expect(parts).toHaveLength(2)
    expect(parts.some(p => p.includes('1.DIO'))).toBe(true)
    expect(parts.some(p => p.includes('TREĆI DIO'))).toBe(true)
    expect(standingsParts).toHaveLength(20)
  })

  it('parses Štinjan as leader of a part with correct numbers', () => {
    const stinjan = standingsParts.find(s => s.team === 'NK Štinjan' && s.position === 1)
    expect(stinjan).toBeDefined()
    expect(stinjan!.clubId).toBe(1542)
    expect(stinjan!.played).toBe(27)
    expect(stinjan!.wins).toBe(20)
    expect(stinjan!.draws).toBe(5)
    expect(stinjan!.losses).toBe(2)
    expect(stinjan!.goalsFor).toBe(90)
    expect(stinjan!.goalsAgainst).toBe(22)
    expect(stinjan!.goalDifference).toBe(68)
    expect(stinjan!.points).toBe(65)
    expect(stinjan!.form).toBe('WWWWW')
    expect(stinjan!.logoUrl).toContain('hns.family')
  })

  it('includes Veli Vrh with clubId 1546', () => {
    const vv = standingsParts.filter(s => s.clubId === 1546)
    expect(vv.length).toBeGreaterThan(0)
  })

  it('ignores content outside competition_results_scorers_cards block', () => {
    // The top scoreboard contains HNL clubs like GNK Dinamo — must not leak in
    expect(standingsParts.some(s => s.team.includes('Dinamo'))).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests, verify they fail** (`npm test` — module not found / assertions fail)

- [ ] **Step 3: Implement `parseCompetitionPage` standings portion**

`lib/hns/parsers.ts` — key implementation notes:

```typescript
import * as cheerio from 'cheerio'
import type { ParsedCompetitionPage, ParsedStanding /* ... */ } from './types.js'

export function parseCompetitionPage(html: string): ParsedCompetitionPage {
  const $ = cheerio.load(html)
  // NOTE: standings tables are OUTSIDE this block; matches and scorers are INSIDE it.
  const $scope = $('div.competition_results_scorers_cards').first()

  const standingsParts: ParsedStanding[] = []
  // Standings: page-wide competition_table.type1 (one per league part), label resolved
  // via the containing tab pane (div[id^="tabContent"]) matched against
  // .tabs li[data-content="..."] > span. If no tabs exist, part = ''.
  $('div.competition_table.type1').each((_, tableEl) => {
    const $table = $(tableEl)
    const pane = $table.closest('div[id^="tabContent"]')
    let part = ''
    if (pane.length) {
      const paneId = pane.attr('id')!
      part = $(`.tabs li[data-content="${paneId}"] span`).first().text().trim()
    }
    $table.find('li.row[data-clubid]').each((_, rowEl) => {
      const $row = $(rowEl)
      const href = $row.find('.club a').attr('href') || ''
      const idMatch = href.match(/\/klubovi\/(\d+)\//)
      const $club = $row.find('.club a').clone()
      $club.find('div').remove()
      const form = $row.find('.form div').toArray()
        .map(d => ($(d).attr('class') || '').replace('form', ''))
        .filter(c => 'WDL'.includes(c)).join('')
      standingsParts.push({
        part,
        position: parseInt($row.find('.position').text().trim()) || 0,
        clubId: idMatch ? parseInt(idMatch[1]) : null,
        team: $club.text().trim(),
        logoUrl: $row.find('.club img').attr('src') || '',
        played: parseInt($row.find('.played').text().trim()) || 0,
        wins: parseInt($row.find('.wins').text().trim()) || 0,
        draws: parseInt($row.find('.draws').text().trim()) || 0,
        losses: parseInt($row.find('.losses').text().trim()) || 0,
        goalsFor: parseInt($row.find('.gplus').text().trim()) || 0,
        goalsAgainst: parseInt($row.find('.gminus').text().trim()) || 0,
        goalDifference: parseInt($row.find('.gdiff').text().trim().replace('+', '')) || 0,
        points: parseInt($row.find('.points').text().trim()) || 0,
        form,
      })
    })
  })

  return { standingsParts, matches: [], scorers: [] }
}
```

Note: gdiff can be negative ("-8") — `parseInt` handles the minus sign; only strip `+`.

- [ ] **Step 4: Run tests, verify pass; delete `tests/hns/smoke.test.ts`**

- [ ] **Step 5: Commit**

```bash
git add lib/hns tests/hns
git commit -m "feat: HNS competition-page standings parser with parts and form"
```

---

### Task 3: Competition-page matches + scorers parser

**Files:**
- Modify: `lib/hns/parsers.ts`
- Modify: `tests/hns/parsers.competition.test.ts`

**Interfaces:**
- Consumes: `parseCompetitionPage`, types from Task 2.
- Produces: `parseCompetitionPage` now fills `matches: ParsedMatch[]` and `scorers: ParsedScorer[]`.

- [ ] **Step 1: Write failing tests**

Append to `tests/hns/parsers.competition.test.ts`:

```typescript
describe('parseCompetitionPage — matches', () => {
  const { matches } = parseCompetitionPage(html)

  it('parses all rounds of both parts (18 + 9 rounds × 5 matches)', () => {
    expect(matches.length).toBeGreaterThanOrEqual(27 * 5 - 5) // allow postponed quirks
    const rounds = new Set(matches.map(m => m.round))
    expect(rounds.has(1)).toBe(true)
    expect(rounds.has(18)).toBe(true)
  })

  it('parses the Štinjan 7:1 Veli Vrh match (round 8, id 100703921)', () => {
    const m = matches.find(x => x.matchId === 100703921)!
    expect(m).toBeDefined()
    expect(m.round).toBe(8)
    expect(m.homeTeam).toBe('NK Štinjan')
    expect(m.awayTeam).toBe('NK Veli Vrh')
    expect(m.homeClubId).toBe(1542)
    expect(m.awayClubId).toBe(1546)
    expect(m.homeScore).toBe(7)
    expect(m.awayScore).toBe(1)
    expect(m.status).toBe('played')
    expect(m.date).toBe('2025-10-26')
    expect(m.time).toBe('10:30')
  })

  it('does not include HNL matches from the top scoreboard', () => {
    expect(matches.some(m => m.homeTeam.includes('Dinamo'))).toBe(false)
  })

  it('marks matches without result as upcoming with null scores', () => {
    const upcoming = matches.filter(m => m.status === 'upcoming')
    for (const m of upcoming.slice(0, 3)) {
      expect(m.homeScore).toBeNull()
      expect(m.awayScore).toBeNull()
    }
  })
})

describe('parseCompetitionPage — scorers (league top 5)', () => {
  const { scorers } = parseCompetitionPage(html)

  it('parses exactly the top-5 league list', () => {
    expect(scorers).toHaveLength(5)
    expect(scorers[0].name).toBe('Antonio Gračić')
    expect(scorers[0].goals).toBe(24)
  })

  it('parses Irian Beviakva (NK Veli Vrh) with 12 goals', () => {
    const b = scorers.find(s => s.name === 'Irian Beviakva')!
    expect(b).toBeDefined()
    expect(b.personId).toBe(215967)
    expect(b.club).toBe('NK Veli Vrh')
    expect(b.goals).toBe(12)
    expect(b.photoUrl).toContain('hns.family')
  })

  it('does not leak per-club widget lists or the Kartoni list', () => {
    // per-club top-5s live outside the scope block; Kartoni rows have empty .goals
    expect(scorers.every(s => s.goals > 0)).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests, verify new ones fail**

- [ ] **Step 3: Implement matches + scorers parsing**

Inside `parseCompetitionPage`, scoped to `$scope`:

```typescript
// --- Matches: each tab pane under current_results contains a matchlist ---
const matches: ParsedMatch[] = []
$scope.find('div.current_results').each((_, resEl) => {
  const $res = $(resEl)
  const pane = $res.closest('div[id^="tabContent"]')
  let part = ''
  if (pane.length) {
    const paneId = pane.attr('id')!
    part = $scope.find(`.tabs li[data-content="${paneId}"] span`).first().text().trim()
  }
  $res.find('div.matchlist li.row[data-match]').each((_, rowEl) => {
    const $row = $(rowEl)
    const matchId = parseInt($row.attr('data-match')!) || 0
    const round = parseInt($row.attr('data-round') || '0') || 0
    // date "06.09.2025. 17:30"
    const dateText = $row.find('.date').first().text().trim()
    const dm = dateText.match(/(\d{2})\.(\d{2})\.(\d{4})\.?(?:\s+(\d{2}:\d{2}))?/)
    const date = dm ? `${dm[3]}-${dm[2]}-${dm[1]}` : null
    const time = dm?.[4] ?? null
    const club = (sel: string) => {
      const $c = $row.find(sel)
      const id = parseInt($c.attr('data-id') || '') || null
      const $a = $c.find('a').first().clone()
      $a.find('div').remove()
      return { id, name: $a.text().trim(), logo: $c.find('img').attr('src') || '' }
    }
    const c1 = club('.club1'), c2 = club('.club2')
    const r1 = $row.find('.res1').first().text().trim()
    const r2 = $row.find('.res2').first().text().trim()
    const played = /^\d+$/.test(r1) && /^\d+$/.test(r2)
    if (!matchId || (!c1.name && !c2.name)) return
    matches.push({
      matchId, round, part, date, time,
      homeClubId: c1.id, homeTeam: c1.name, homeLogoUrl: c1.logo,
      awayClubId: c2.id, awayTeam: c2.name, awayLogoUrl: c2.logo,
      homeScore: played ? parseInt(r1) : null,
      awayScore: played ? parseInt(r2) : null,
      status: played ? 'played' : 'upcoming',
    })
  })
})

// --- Scorers: FIRST playerslist inside $scope = league "Strijelci" top-5 tab.
//     (Second/third are Kartoni and Nastupi/minute; per-club lists are outside $scope.)
const scorers: ParsedScorer[] = []
$scope.find('div.playerslist').first().find('li.row[data-personid]').each((_, rowEl) => {
  const $row = $(rowEl)
  const goals = parseInt($row.find('.goals').first().text().trim())
  if (Number.isNaN(goals)) return   // skips the cards list (no .goals)
  const $name = $row.find('.playerName')
  const name = $name.find('h3 a').first().text().trim()
  const playerUrl = $name.find('h3 a').first().attr('href') || ''
  const $clone = $name.clone(); $clone.find('h3').remove()
  scorers.push({
    personId: parseInt($row.attr('data-personid')!) || 0,
    position: parseInt($row.find('.position').first().text().trim()) || 0,
    name,
    club: $clone.text().trim(),
    goals,
    photoUrl: $row.find('.playerPhoto img').attr('src') || '',
    playerUrl,
  })
})
scorers.sort((a, b) => b.goals - a.goals)
```

Deduplicate matches by `matchId` after collection (the page may render the same list twice — keep first occurrence):

```typescript
const seen = new Set<number>()
const deduped = matches.filter(m => (seen.has(m.matchId) ? false : (seen.add(m.matchId), true)))
```

- [ ] **Step 4: Run tests, verify pass**

- [ ] **Step 5: Commit**

```bash
git add lib/hns tests/hns
git commit -m "feat: parse full fixtures and league scorers from HNS competition page"
```

---

### Task 4: Match-detail parser

**Files:**
- Modify: `lib/hns/parsers.ts`
- Create: `tests/hns/parsers.match.test.ts`

**Interfaces:**
- Produces: `parseMatchDetail(html: string): ParsedMatchDetail`

- [ ] **Step 1: Write failing tests**

`tests/hns/parsers.match.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseMatchDetail } from '../../lib/hns/parsers.js'

const html = readFileSync('tests/fixtures/hns/match-velivrh.html', 'utf-8')

describe('parseMatchDetail', () => {
  const d = parseMatchDetail(html)

  it('parses header: teams, score, status', () => {
    expect(d.homeTeam).toBe('NK Štinjan')
    expect(d.awayTeam).toBe('NK Veli Vrh')
    expect(d.homeScore).toBe(7)
    expect(d.awayScore).toBe(1)
    expect(d.status).toBe('Završeno')
  })

  it('parses venue, kickoff and attendance', () => {
    expect(d.venue).toBe('Fortin, Štinjan')
    expect(d.kickoffAt).toBe('2025-10-26T10:30')
    expect(d.attendance).toBe(100)
  })

  it('parses both lineups with numbers and positions', () => {
    const home = d.lineups.filter(l => l.team === 'home')
    const away = d.lineups.filter(l => l.team === 'away')
    expect(home.length).toBeGreaterThanOrEqual(11)
    expect(away.length).toBeGreaterThanOrEqual(11)
    expect(d.lineups.every(l => l.personId > 0)).toBe(true)
    expect(d.lineups.some(l => l.position === 'Vratar')).toBe(true)
  })

  it('parses goal events with minutes', () => {
    const goals = d.events.filter(e => e.type === 'goal')
    expect(goals.length).toBe(8) // 7:1
    expect(goals.every(g => g.minute !== null && g.minute > 0)).toBe(true)
    expect(goals.some(g => g.team === 'away')).toBe(true) // Veli Vrh's goal
  })

  it('parses substitutions', () => {
    expect(d.events.some(e => e.type === 'substitutionIn')).toBe(true)
    expect(d.events.some(e => e.type === 'substitutionOut')).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests, verify fail**

- [ ] **Step 3: Implement `parseMatchDetail`**

```typescript
export function parseMatchDetail(html: string): ParsedMatchDetail {
  const $ = cheerio.load(html)

  const homeTeam = $('.clubs .club1 .title').first().text().trim()
  const awayTeam = $('.clubs .club2 .title').first().text().trim()
  const homeLogoUrl = $('.clubs .club1 img').attr('src') || ''
  const awayLogoUrl = $('.clubs .club2 img').attr('src') || ''
  const r1 = $('.result .res1').first().text().trim()
  const r2 = $('.result .res2').first().text().trim()
  const played = /^\d+$/.test(r1) && /^\d+$/.test(r2)

  // facility: "Fortin, Štinjan, 26.10.2025. 10:30" → venue + kickoff
  const facility = $('.facility').first().text().trim()
  const fm = facility.match(/^(.*?),?\s*(\d{2})\.(\d{2})\.(\d{4})\.?\s+(\d{2}:\d{2})$/)
  const venue = fm ? fm[1].replace(/,\s*$/, '') : facility
  const kickoffAt = fm ? `${fm[4]}-${fm[3]}-${fm[2]}T${fm[5]}` : null

  const attText = $('.attendance').first().text() // "Gledatelja: 24.935"
  const am = attText.match(/([\d.]+)\s*$/)
  const attendance = am ? parseInt(am[1].replace(/\./g, '')) : null

  const lineups: ParsedLineupPlayer[] = []
  const events: ParsedMatchEvent[] = []
  // Lineup lists: div.playerslist blocks containing li.row.match_lineup.
  // Order on page: first block = home, second = away.
  const lineupBlocks = $('div.playerslist').filter((_, el) => $(el).find('li.row.match_lineup').length > 0)
  lineupBlocks.each((blockIdx, blockEl) => {
    const team: 'home' | 'away' = blockIdx === 0 ? 'home' : 'away'
    const teamName = $(blockEl).find('li.header.clubName').first().text().trim()
    $(blockEl).find('li.row.match_lineup').each((_, rowEl) => {
      const $row = $(rowEl)
      const personId = parseInt($row.attr('data-personid') || '') || 0
      const $nameEl = $row.find('.playerName')
      const rawName = $nameEl.find('h3').first().text().trim()
      const isCaptain = /\(C\)\s*$/.test(rawName)
      const name = $nameEl.find('h3 a').first().text().trim()
      const $pos = $nameEl.clone(); $pos.find('h3').remove()
      lineups.push({
        personId, team, teamName,
        number: parseInt($row.find('.shirtNumber').text().trim()) || 0,
        name, isCaptain,
        position: $pos.text().trim(),
        photoUrl: $row.find('.playerPhoto img').attr('src') || '',
      })
      $row.find('.matchEvents ul.events li').each((_, evEl) => {
        const $ev = $(evEl)
        const type = ($ev.attr('class') || '').trim()
        const label = $ev.find('.icon').attr('title') || ''
        const minuteMatch = $ev.text().match(/(\d+)\s*'/)
        events.push({
          personId, playerName: name, team,
          minute: minuteMatch ? parseInt(minuteMatch[1]) : null,
          type, label,
        })
      })
    })
  })

  return {
    homeTeam, awayTeam, homeLogoUrl, awayLogoUrl,
    homeScore: played ? parseInt(r1) : null,
    awayScore: played ? parseInt(r2) : null,
    status: $('.status').first().text().trim(),
    venue, kickoffAt, attendance,
    referees: $('.referees').first().text().trim(),
    lineups, events,
  }
}
```

Caution: verify against the fixture whether lineup blocks are exactly 2; if a combined block exists, split on `li.header.clubName` boundaries instead (headers precede each team's rows within one list). Adjust implementation to whichever structure the fixture shows, keeping the test green.

- [ ] **Step 4: Run tests, verify pass**

- [ ] **Step 5: Commit**

```bash
git add lib/hns tests/hns
git commit -m "feat: HNS match-detail parser (lineups, events, attendance)"
```

---

### Task 5: Club roster parser (port of existing logic, now tested)

**Files:**
- Modify: `lib/hns/parsers.ts`
- Create: `tests/hns/parsers.club.test.ts`

**Interfaces:**
- Produces: `parseClubRoster(html: string): ParsedRosterPlayer[]`

- [ ] **Step 1: Write failing tests**

`tests/hns/parsers.club.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseClubRoster } from '../../lib/hns/parsers.js'

const html = readFileSync('tests/fixtures/hns/club-page.html', 'utf-8')

describe('parseClubRoster', () => {
  const roster = parseClubRoster(html)

  it('parses a non-empty roster with numbers and names', () => {
    expect(roster.length).toBeGreaterThan(10)
    expect(roster.every(p => p.number > 0)).toBe(true)
    expect(roster.every(p => p.firstName.length > 0)).toBe(true)
  })

  it('includes goalkeepers with position Vratar', () => {
    expect(roster.some(p => p.position === 'Vratar')).toBe(true)
  })

  it('parses appearance and goal counts as numbers', () => {
    expect(roster.every(p => Number.isInteger(p.appearances))).toBe(true)
    expect(roster.every(p => Number.isInteger(p.goals))).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests, verify fail**

- [ ] **Step 3: Implement `parseClubRoster`** — port the player block from the current `api/cron/sync.ts` (`div.playerslist.withStats li.row` selector logic, lines 77–109) into `parsers.ts`, returning `ParsedRosterPlayer[]` (camelCase fields, `image_url` → `imageUrl` from `img@data-url` falling back to `img@src`). Keep the goalkeeper `.goals span.conceded` → 0 rule and the `cards` "Y/R" split.

- [ ] **Step 4: Run tests, verify pass**

- [ ] **Step 5: Commit**

```bash
git add lib/hns tests/hns
git commit -m "feat: club roster parser extracted from sync with tests"
```

---

### Task 6: Season + competition discovery

**Files:**
- Create: `lib/hns/discovery.ts`
- Create: `lib/hns/fetch.ts`
- Create: `tests/hns/discovery.test.ts`

**Interfaces:**
- Produces:
  - `fetch.ts`: `fetchHtml(url: string): Promise<string>`, `fetchJson<T>(url: string): Promise<T>`, `sleep(ms: number): Promise<void>`, `SEMAFOR_BASE = 'https://semafor.hns.family'`, `USER_AGENT` const.
  - `discovery.ts`: `currentSeason(now: Date): string`; `discoverCompetitions(clubId: number, season: string, fetchJsonImpl?: typeof fetchJson): Promise<CompetitionInfo[]>`; `ACAT_TO_CATEGORY: Record<string, string>`.

- [ ] **Step 1: Write failing tests**

`tests/hns/discovery.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { currentSeason, discoverCompetitions } from '../../lib/hns/discovery.js'

describe('currentSeason', () => {
  it('July and later belongs to the new season', () => {
    expect(currentSeason(new Date('2026-07-30'))).toBe('2026/2027')
    expect(currentSeason(new Date('2026-12-01'))).toBe('2026/2027')
  })
  it('before July belongs to the running season', () => {
    expect(currentSeason(new Date('2026-06-06'))).toBe('2025/2026')
    expect(currentSeason(new Date('2026-01-15'))).toBe('2025/2026')
  })
})

describe('discoverCompetitions', () => {
  const agecats = JSON.parse(readFileSync('tests/fixtures/hns/handler-agecats.json', 'utf-8'))
  const comps = JSON.parse(readFileSync('tests/fixtures/hns/handler-comps.json', 'utf-8'))

  it('maps age categories to competitions with our category keys', async () => {
    const fetchJsonMock = async (url: string): Promise<any> => {
      if (url.includes('getAgeCategories')) return agecats
      if (url.includes('getCompetitions')) {
        // fixture holds the Seniors answer; return it only for Seniors, [] otherwise
        return url.includes('acat=Seniors') ? comps : []
      }
      throw new Error('unexpected url ' + url)
    }
    const result = await discoverCompetitions(1546, '2025/2026', fetchJsonMock)
    const liga = result.find(c => c.cid === 100703751)!
    expect(liga.category).toBe('seniori')
    expect(liga.isCup).toBe(false)
    const kup = result.find(c => c.cid === 100586758)!
    expect(kup.category).toBe('seniori')
    expect(kup.isCup).toBe(true)
    expect(kup.name).toContain('KUP')
  })
})
```

- [ ] **Step 2: Run tests, verify fail**

- [ ] **Step 3: Implement `fetch.ts` and `discovery.ts`**

`lib/hns/fetch.ts`:

```typescript
export const SEMAFOR_BASE = 'https://semafor.hns.family'
export const USER_AGENT = 'Mozilla/5.0 (compatible; NK-Veli-Vrh-Site/1.0)'

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`HNS returned ${res.status} for ${url}`)
  return res.text()
}

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`HNS returned ${res.status} for ${url}`)
  return res.json() as Promise<T>
}
```

`lib/hns/discovery.ts`:

```typescript
import { SEMAFOR_BASE, fetchJson } from './fetch.js'
import type { CompetitionInfo } from './types.js'

export const ACAT_TO_CATEGORY: Record<string, string> = {
  'Seniors': 'seniori',
  'Juniors': 'juniori',
  'Pioneers': 'pioniri',
  'Young pioneers': 'mladi-pioniri',
  'Young pioneers (mix)': 'u-11',
  'Pre-beginners': 'u-9',
  'Veterans': 'veterani',
}

// Sezona počinje u srpnju: 2026-07 → "2026/2027"
export function currentSeason(now: Date): string {
  const y = now.getFullYear()
  return now.getMonth() >= 6 ? `${y}/${y + 1}` : `${y - 1}/${y}`
}

export async function discoverCompetitions(
  clubId: number,
  season: string,
  fetchJsonImpl: typeof fetchJson = fetchJson,
): Promise<CompetitionInfo[]> {
  const ts = Date.now()
  const seasonEnc = encodeURIComponent(season)
  const agecats = await fetchJsonImpl<Array<{ id: string }>>(
    `${SEMAFOR_BASE}/handlers/getAgeCategories/?season=${seasonEnc}&t=${ts}&lang=hr&clubID=${clubId}`
  )
  const out: CompetitionInfo[] = []
  for (const { id: acat } of agecats) {
    const category = ACAT_TO_CATEGORY[acat]
    if (!category) continue
    const comps = await fetchJsonImpl<Array<{ id: number; value: string }>>(
      `${SEMAFOR_BASE}/handlers/getCompetitions/?season=${seasonEnc}&acat=${encodeURIComponent(acat)}&t=${ts}&lang=hr&clubID=${clubId}&linkType=club_profile&linkConstructor=/x`
    )
    for (const c of comps) {
      out.push({
        cid: c.id,
        name: c.value,
        season,
        acat,
        category,
        isCup: /\bKUP\b/i.test(c.value),
      })
    }
  }
  return out
}
```

- [ ] **Step 4: Run tests, verify pass**

- [ ] **Step 5: Commit**

```bash
git add lib/hns tests/hns
git commit -m "feat: HNS season and competition discovery via public JSON handlers"
```

---

### Task 7: Supabase schema migration (SQL file + USER ACTION)

**Files:**
- Create: `supabase/migrations/2026-07-30-phase1-hns.sql`

**Interfaces:**
- Produces: tables/columns used by Tasks 8–9: `competitions`, `scorers`, `match_details`, `match_lineups`, `match_events`; new columns on `standings` (`season`, `competition_id`, `part`, `form`, `club_id`, `logo_url`) and `matches` (`season`, `competition_id`, `round`, `time`, `part`, `is_veli_vrh`, `home_club_id`, `away_club_id`, `home_logo_url`, `away_logo_url`) and `players` (`season`).

- [ ] **Step 1: Write the migration SQL**

```sql
-- Phase 1: HNS data foundation
-- Pokreni u Supabase SQL Editoru (Dashboard → SQL Editor)

CREATE TABLE IF NOT EXISTS competitions (
  id BIGINT PRIMARY KEY,               -- HNS competitionID (cid)
  name TEXT NOT NULL,
  season TEXT NOT NULL,
  acat TEXT NOT NULL,
  category TEXT NOT NULL,
  is_cup BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE standings ADD COLUMN IF NOT EXISTS season TEXT NOT NULL DEFAULT '2025/2026';
ALTER TABLE standings ADD COLUMN IF NOT EXISTS competition_id BIGINT;
ALTER TABLE standings ADD COLUMN IF NOT EXISTS part TEXT NOT NULL DEFAULT '';
ALTER TABLE standings ADD COLUMN IF NOT EXISTS form TEXT NOT NULL DEFAULT '';
ALTER TABLE standings ADD COLUMN IF NOT EXISTS club_id BIGINT;
ALTER TABLE standings ADD COLUMN IF NOT EXISTS logo_url TEXT NOT NULL DEFAULT '';

-- matches: sync sada puni cijelu ligu; postojeći redovi se brišu (sync ih obnavlja)
TRUNCATE matches;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS season TEXT NOT NULL DEFAULT '2025/2026';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS competition_id BIGINT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS round INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS part TEXT NOT NULL DEFAULT '';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_veli_vrh BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_club_id BIGINT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_club_id BIGINT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_logo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_logo_url TEXT NOT NULL DEFAULT '';

ALTER TABLE players ADD COLUMN IF NOT EXISTS season TEXT NOT NULL DEFAULT '2025/2026';

CREATE TABLE IF NOT EXISTS scorers (
  competition_id BIGINT NOT NULL,
  season TEXT NOT NULL,
  person_id BIGINT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  club TEXT NOT NULL DEFAULT '',
  goals INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT NOT NULL DEFAULT '',
  player_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (competition_id, season, person_id)
);

CREATE TABLE IF NOT EXISTS match_details (
  match_id BIGINT PRIMARY KEY,         -- HNS matchId
  home_team TEXT NOT NULL DEFAULT '',
  away_team TEXT NOT NULL DEFAULT '',
  home_score INTEGER,
  away_score INTEGER,
  status TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  kickoff_at TEXT,
  attendance INTEGER,
  referees TEXT NOT NULL DEFAULT '',
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_lineups (
  match_id BIGINT NOT NULL,
  person_id BIGINT NOT NULL,
  team TEXT NOT NULL CHECK (team IN ('home','away')),
  team_name TEXT NOT NULL DEFAULT '',
  number INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  is_captain BOOLEAN NOT NULL DEFAULT FALSE,
  position TEXT NOT NULL DEFAULT '',
  photo_url TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (match_id, person_id)
);

CREATE TABLE IF NOT EXISTS match_events (
  id SERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL,
  person_id BIGINT NOT NULL DEFAULT 0,
  player_name TEXT NOT NULL DEFAULT '',
  team TEXT NOT NULL CHECK (team IN ('home','away')),
  minute INTEGER,
  type TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events (match_id);
CREATE INDEX IF NOT EXISTS idx_matches_category_season ON matches (category, season);
CREATE INDEX IF NOT EXISTS idx_standings_category_season ON standings (category, season);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorers ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read competitions" ON competitions FOR SELECT USING (true);
CREATE POLICY "Public read scorers" ON scorers FOR SELECT USING (true);
CREATE POLICY "Public read match_details" ON match_details FOR SELECT USING (true);
CREATE POLICY "Public read match_lineups" ON match_lineups FOR SELECT USING (true);
CREATE POLICY "Public read match_events" ON match_events FOR SELECT USING (true);

CREATE POLICY "Service role full access competitions" ON competitions USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access scorers" ON scorers USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access match_details" ON match_details USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access match_lineups" ON match_lineups USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access match_events" ON match_events USING (auth.role() = 'service_role');
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/2026-07-30-phase1-hns.sql
git commit -m "feat: supabase schema for competitions, scorers, match details"
```

- [ ] **Step 3: USER ACTION — run the SQL in the Supabase Dashboard SQL Editor.** The new sync (Task 8) will fail against the DB until this is done. Flag this clearly to the user at handoff.

---

### Task 8: Sync core rewrite

**Files:**
- Create: `lib/hns/sync-core.ts`
- Modify: `api/cron/sync.ts` (reduce to thin handler)
- Create: `scripts/sync-local.ts`

**Interfaces:**
- Consumes: `parseCompetitionPage`, `parseMatchDetail`, `parseClubRoster`, `discoverCompetitions`, `currentSeason`, `fetchHtml`, `sleep`, `SEMAFOR_BASE`, `supabaseAdmin`.
- Produces: `runSync(): Promise<SyncResult>` where `SyncResult = { season: string, counts: { competitions: number, standings: number, matches: number, scorers: number, players: number, matchDetails: number }, errors: string[] }`.

Orchestration logic for `runSync()`:

```typescript
const CLUB_ID = 1546
const REQUEST_DELAY_MS = 300
const MAX_MATCH_DETAILS_PER_RUN = 5

// 1. season = currentSeason(new Date())
// 2. competitions = await discoverCompetitions(CLUB_ID, season)
//    - if empty (handler outage): fall back to previously stored rows:
//      supabaseAdmin.from('competitions').select('*').eq('season', season)
//      and log an error string; if still empty → throw (nothing to do).
// 3. upsert competitions (onConflict: 'id').
// 4. for each competition (sleep(REQUEST_DELAY_MS) between HTTP calls):
//    html = fetchHtml(`${SEMAFOR_BASE}/natjecanja/${cid}/x/`)
//    { standingsParts, matches, scorers } = parseCompetitionPage(html)
//    a) standings — GUARDED replace, scoped to this competition:
//       if standingsParts.length > 0:
//         delete from standings where competition_id = cid AND season = season
//         insert rows (map to snake_case; category from CompetitionInfo)
//       (cup pages typically have no table → skip delete, keep nothing)
//    b) matches — upsert (onConflict: 'id'), id = String(matchId):
//       is_veli_vrh = homeClubId === CLUB_ID || awayClubId === CLUB_ID
//       opponent   = is_veli_vrh ? (home is VV ? awayTeam : homeTeam) : ''
//       venue      = is_veli_vrh ? (home is VV ? 'home' : 'away') : null
//       competition = CompetitionInfo.name, category = CompetitionInfo.category
//    c) scorers — guarded replace scoped to (competition_id, season), only when scorers.length > 0.
// 5. roster per category (skip cups — same club page): for each non-cup competition:
//    html = fetchHtml(`${SEMAFOR_BASE}/klubovi/${CLUB_ID}/nk-veli-vrh/?cid=${cid}`)
//    roster = parseClubRoster(html)
//    guarded replace players scoped to (category, season) when roster.length > 0.
// 6. match details: query matches where is_veli_vrh = true AND status = 'played' AND season = season,
//    order by date desc; fetch existing match_details ids; take first MAX_MATCH_DETAILS_PER_RUN
//    missing ones; for each: fetchHtml(`${SEMAFOR_BASE}/utakmice/${id}/x/`), parseMatchDetail,
//    upsert match_details (onConflict: 'match_id'), guarded replace match_lineups + match_events per match_id.
//    team ('home'|'away') maps straight from parser output.
// 7. insert sync_log row (existing table: players_count, standings_count, matches_count, success, error_message).
// Each competition/category wrapped in try/catch — one failure must not abort the rest (existing pattern).
```

`api/cron/sync.ts` becomes:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runSync } from '../../lib/hns/sync-core.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const startTime = Date.now()
  try {
    const result = await runSync()
    return res.status(200).json({ success: true, duration_ms: Date.now() - startTime, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[sync] Fatal:', message)
    return res.status(500).json({ success: false, error: message })
  }
}
```

`scripts/sync-local.ts`:

```typescript
import 'dotenv/config'
import { runSync } from '../lib/hns/sync-core.js'

runSync()
  .then(r => { console.log(JSON.stringify(r, null, 2)); process.exit(r.errors.length ? 1 : 0) })
  .catch(e => { console.error(e); process.exit(1) })
```

Add script to `package.json`: `"sync:local": "tsx scripts/sync-local.ts"`.

- [ ] **Step 1: Implement `lib/hns/sync-core.ts` per the orchestration above** (no unit test — it is IO glue over already-tested parsers; verification is the live run below)
- [ ] **Step 2: Rewrite `api/cron/sync.ts` as the thin handler**
- [ ] **Step 3: Add `scripts/sync-local.ts` + npm script**
- [ ] **Step 4: Verify types compile**: `npm run build` — expected PASS (build includes `tsc -b`; if api/lib files are outside tsconfig scope, run `npx tsc --noEmit -p tsconfig.json` or the project's equivalent and ensure no errors in `lib/hns`)
- [ ] **Step 5: LIVE VERIFICATION (requires Task 7 USER ACTION done): run `npm run sync:local`** — expected: JSON result with non-zero counts for standings/matches/scorers/players, errors []. If the migration hasn't been run yet, defer this step to final verification (Task 12) — do not skip silently; record it.
- [ ] **Step 6: Commit**

```bash
git add lib/hns api/cron/sync.ts scripts/sync-local.ts package.json
git commit -m "feat: rewrite HNS sync around competition pages with discovery and guarded writes"
```

---

### Task 9: API endpoints — additive updates + new endpoints

**Files:**
- Modify: `api/standings.ts`
- Modify: `api/matches.ts`
- Create: `api/scorers.ts`
- Create: `api/match.ts`

**Interfaces:**
- Consumes: Supabase tables from Task 7.
- Produces (response shapes):
  - `/api/standings?category=seniori` → `{ data: Standing[], part: string, fetchedAt }`; `Standing` keeps existing fields and ADDS `form: string`, `logoUrl: string`, `clubId: number|null`. Part selection: among rows for the category, pick the `part` whose rows include `club_id = 1546`; when several parts contain the club, pick the one whose label sorts LAST by `part` string DESC after preferring labels containing "TREĆI"/"DRUGI" — implement simply: prefer part containing club AND max `updated_at`; if none contain the club, use the first part alphabetically. Return only that part's rows.
  - `/api/matches?category=seniori` → default WHERE `is_veli_vrh = true` (backward compatible: response items keep existing fields and ADD `round`, `time`, `homeLogoUrl`, `awayLogoUrl`, `isVeliVrh`). Query params: `all=1` returns whole league; `competition=kup|liga` filters `is_cup` via join on competitions (simpler: filter by `competition` name ILIKE '%KUP%' when `competition=kup`).
  - `/api/scorers?category=seniori&limit=10` → `{ data: Scorer[], fetchedAt }`, `Scorer = { personId, position, name, club, goals, photoUrl }` — resolved via `competitions` table: find non-cup competition for category+current season, then scorers for that `competition_id` ordered by goals desc, limited (default 10, max 50). Note: Semafor exposes only the league top 5, so expect ≤5 rows per competition.
  - `/api/match?id=100703921` → `{ data: { info, lineups, events }, fetchedAt }` — `info` from `match_details`, `lineups` array, `events` array (camelCase mapping of table columns). 400 if `id` missing/non-numeric; 404 if no `match_details` row.
- All endpoints keep the existing header pattern: CORS `*`, GET only, `Cache-Control: s-maxage=300, stale-while-revalidate=3600`.

- [ ] **Step 1: Update `api/standings.ts`** per above (keep existing mapping, add fields, add part selection; season filter = `currentSeason(new Date())` imported from `lib/hns/discovery.js`)
- [ ] **Step 2: Update `api/matches.ts`** per above
- [ ] **Step 3: Create `api/scorers.ts` and `api/match.ts`** per above (follow the exact handler skeleton of `api/standings.ts` — CORS, method check, error logging pattern `[/api/scorers]`)
- [ ] **Step 4: Verify compile**: `npm run build` — PASS
- [ ] **Step 5: Commit**

```bash
git add api/
git commit -m "feat: scorers and match-detail endpoints; standings form/part, matches round/time"
```

---

### Task 10: Scheduling — GitHub Actions trigger + vercel.json

**Files:**
- Create: `.github/workflows/hns-sync.yml`
- Modify: `vercel.json` (maxDuration 60)

Constraint: Vercel Hobby plan crons run at most once per day — keep the existing daily crons as baseline, add GitHub Actions for frequency (repo: `github.com/MaarassM/veli-vrh-fc`).

- [ ] **Step 1: Create workflow**

`.github/workflows/hns-sync.yml`:

```yaml
name: HNS sync trigger

on:
  schedule:
    # Radnim danom: 10:00 i 20:00 po hrvatskom (UTC+1/+2 — koristimo 8 i 18 UTC)
    - cron: '0 8,18 * * 1-5'
    # Vikendom: svaki sat 13–21 UTC (≈ 15–23 po HR ljeti) — rezultati stižu tijekom dana
    - cron: '0 13-21 * * 6,0'
  workflow_dispatch:

jobs:
  trigger-sync:
    runs-on: ubuntu-latest
    steps:
      - name: Call sync endpoint
        run: |
          curl -fsS --max-time 120 \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            "${{ vars.SYNC_URL || 'https://veli-vrh-fc.vercel.app/api/cron/sync' }}"
```

- [ ] **Step 2: Update `vercel.json`**: in `functions."api/**/*.ts"` set `"maxDuration": 60`. Keep existing crons unchanged.
- [ ] **Step 3: Commit**

```bash
git add .github/workflows/hns-sync.yml vercel.json
git commit -m "feat: frequent HNS sync via GitHub Actions schedule, bump function duration"
```

- [ ] **Step 4: USER ACTION — add `CRON_SECRET` as a GitHub Actions secret** (repo Settings → Secrets and variables → Actions), same value as in Vercel env. Optionally a `SYNC_URL` repository variable if the production domain differs from `veli-vrh-fc.vercel.app`. Flag at handoff.

---

### Task 11: Dead-code cleanup + README

**Files:**
- Delete: `prisma/` (all), `prisma.config.ts`, `dev.db`, `scripts/seed-players.ts`, `scripts/seed-simple.ts`, `scripts/test-sync.ts`, `scripts/players-data.json`, `scripts/players-simple.json`, `src/services/hnsService.ts`, `src/components/home/TopScorers.tsx`, `src/components/home/HighlightsGrid.tsx`, `75463-1778667382/` (tracked leftovers), `schema-simple.prisma`
- Move: root `superpowers/plans/*.md` and `superpowers/specs/*.md` → `docs/superpowers/plans|specs/` (git mv), delete empty root `superpowers/`
- Modify: `package.json` (remove deps: `prisma`, `@prisma/client`, `@prisma/adapter-libsql`, `@libsql/client`, `better-sqlite3`; remove scripts `db:seed`, `db:seed-simple`; keep `dotenv` — used by `scripts/sync-local.ts`)
- Rewrite: `README.md` (project-specific)

- [ ] **Step 1: Verify nothing imports the deleted modules**

Run: `grep -rn "hnsService\|TopScorers\|HighlightsGrid\|@prisma\|better-sqlite3\|@libsql" src/ api/ lib/ scripts/ --include="*.ts" --include="*.tsx"`
Expected: no hits outside the files being deleted. If a hit exists, resolve it first (do not delete blindly).

- [ ] **Step 2: Delete files, move docs, update package.json, `npm install` to refresh lockfile**

- [ ] **Step 3: Rewrite `README.md`** — sections: project intro (NK Veli Vrh site), stack, dev setup (`npm install`, `.env` iz `.env.example`, `npm run dev`), data architecture (HNS Semafor scraping → Supabase; discovery; sync schedule; `npm run sync:local`), testing (`npm test`), deploy (Vercel), pointer to `docs/superpowers/specs/2026-07-30-website-max-upgrade-plan.md`.

- [ ] **Step 4: Verify build + tests pass**: `npm run build && npm test` — PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Prisma/SQLite legacy, mock service, unused components; project README"
```

---

### Task 12: Final verification

- [ ] **Step 1: Full check**: `npm run build && npm run lint && npm test` — all PASS (lint may carry pre-existing warnings; no NEW errors)
- [ ] **Step 2: If migration (Task 7) is applied, run `npm run sync:local`** and verify: counts > 0 for standings/matches/scorers/players; `matchDetails` ≤ 5; errors []. Then spot-check Supabase: `matches` has both `is_veli_vrh=true` rows and league rows; `scorers` contains Beviakva; one `match_details` row with lineups/events.
- [ ] **Step 3: Start dev server, confirm homepage LeagueTable and Kategorije page still render with live API** (fallback statics acceptable if env vars absent locally)
- [ ] **Step 4: Report to user**: what changed, remaining USER ACTIONS (run migration SQL if not done, add GitHub secret `CRON_SECRET`, optionally request COMET LIVE API key from HNS), and that Phase 2 (new pages) can start.
