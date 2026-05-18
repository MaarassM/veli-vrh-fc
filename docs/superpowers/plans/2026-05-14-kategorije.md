# Sve Kategorije Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the daily HNS scraper to cover all 8 uzrast categories and add a "Sve kategorije" page with a pill tab picker showing standings and players per category.

**Architecture:** Two sequential sub-projects — (1) schema migration + extended cron + updated API endpoints, (2) new React page with hook, standings table component, and players list component. The cron loops through a hardcoded category map, tagging each row with a `category` key. The page fetches standings and players filtered by the selected category.

**Tech Stack:** TypeScript, Vercel Serverless Functions, Cheerio, Supabase, React, Tailwind CSS, framer-motion

---

## Sub-project 1: Data Sync

---

### Task 1: Supabase migration — add `category` column

**Files:**
- Create: `supabase/migrations/add-category-column.sql`
- Modify: `supabase/schema.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/add-category-column.sql
ALTER TABLE standings ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'seniori';
ALTER TABLE matches   ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'seniori';
ALTER TABLE players   ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'seniori';
```

- [ ] **Step 2: Run it in Supabase**

Open Supabase Dashboard → SQL Editor → paste and run the migration above.

Expected: "Success. No rows returned."

- [ ] **Step 3: Update `supabase/schema.sql` to document the new columns**

In `supabase/schema.sql`, update the three `CREATE TABLE` statements to include the `category` column:

In the `standings` table block, add after `points INTEGER DEFAULT 0,`:
```sql
  category TEXT NOT NULL DEFAULT 'seniori',
```

In the `matches` table block, add after `venue TEXT CHECK (venue IN ('home', 'away')),`:
```sql
  category TEXT NOT NULL DEFAULT 'seniori',
```

In the `players` table block, add after `image_url TEXT,`:
```sql
  category TEXT NOT NULL DEFAULT 'seniori',
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/add-category-column.sql supabase/schema.sql
git commit -m "feat: add category column to standings, matches, players tables"
```

---

### Task 2: Extend sync cron to scrape all 8 categories

**Files:**
- Modify: `api/cron/sync.ts`

- [ ] **Step 1: Replace the file with the multi-category version**

```typescript
// api/cron/sync.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as cheerio from 'cheerio'
import { supabaseAdmin } from '../../lib/supabase'

const BASE_URL = 'https://semafor.hns.family/klubovi/1546/nk-veli-vrh/'
const VELI_VRH_ID = '1546'

const CATEGORIES = [
  { key: 'seniori',       cid: '100703751' },
  { key: 'juniori',       cid: '100949387' },
  { key: 'pioniri',       cid: '112161359' },
  { key: 'mladi-pioniri', cid: '100968848' },
  { key: 'u-11',          cid: '102600299' },
  { key: 'u-9',           cid: '102049500' },
  { key: 'veterani',      cid: '102383368' },
]

interface PlayerRow {
  first_name: string
  last_name: string
  number: number
  position: string
  goals: number
  assists: number
  appearances: number
  yellow_cards: number
  red_cards: number
  image_url: string
  category: string
}

interface StandingRow {
  position: number
  team: string
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  category: string
}

interface MatchRow {
  id: string
  date: string
  opponent: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  competition: string
  status: 'played' | 'upcoming' | 'postponed'
  venue: 'home' | 'away'
  category: string
}

async function scrapeCategory(categoryKey: string, cid: string): Promise<{
  players: PlayerRow[]
  standings: StandingRow[]
  matches: MatchRow[]
}> {
  const url = `${BASE_URL}?cid=${cid}`
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NK-Veli-Vrh-Bot/1.0)' }
  })

  if (!response.ok) throw new Error(`HNS returned ${response.status} for ${url}`)

  const html = await response.text()
  const $ = cheerio.load(html)

  // --- Players ---
  const players: PlayerRow[] = []
  $('div.playerslist.withStats li.row').each((_, row) => {
    const $row = $(row)
    const number = parseInt($row.find('.shirtNumber').text().trim()) || 0
    const fullName = $row.find('.playerName h3 a').text().trim()
    const nameParts = fullName.split(' ')
    const first_name = nameParts[0] || ''
    const last_name = nameParts.slice(1).join(' ') || ''

    const playerNameEl = $row.find('.playerName')
    playerNameEl.find('h3').remove()
    const position = playerNameEl.text().trim()

    const appearances = parseInt($row.find('.apps').text().trim()) || 0

    const $goalsSpan = $row.find('.goals span')
    const goals = $goalsSpan.hasClass('conceded') ? 0 : parseInt($goalsSpan.text().trim()) || 0

    const cardsText = $row.find('.cards').text().trim()
    const cardsParts = cardsText.split('/')
    const yellow_cards = parseInt(cardsParts[0]?.trim()) || 0
    const red_cards = parseInt(cardsParts[1]?.trim()) || 0

    const image_url = $row.find('.playerPhoto img').attr('data-url') || ''

    if (fullName && number > 0) {
      players.push({
        first_name, last_name, number, position,
        goals, assists: 0, appearances, yellow_cards, red_cards,
        image_url, category: categoryKey
      })
    }
  })

  // --- Standings ---
  const standings: StandingRow[] = []
  $('div.competition_table.type1 li.row[data-clubid]').each((_, row) => {
    const $row = $(row)
    const position = parseInt($row.find('.position').text().trim()) || 0

    const $clubEl = $row.find('.club a').clone()
    $clubEl.find('div').remove()
    const team = $clubEl.text().trim()

    const played = parseInt($row.find('.played').text().trim()) || 0
    const wins = parseInt($row.find('.wins').text().trim()) || 0
    const draws = parseInt($row.find('.draws').text().trim()) || 0
    const losses = parseInt($row.find('.losses').text().trim()) || 0
    const goals_for = parseInt($row.find('.gplus').text().trim()) || 0
    const goals_against = parseInt($row.find('.gminus').text().trim()) || 0
    const goal_difference = parseInt($row.find('.gdiff').text().trim()) || (goals_for - goals_against)
    const points = parseInt($row.find('.points').text().trim()) || 0

    if (team && position > 0) {
      standings.push({
        position, team, played, wins, draws, losses,
        goals_for, goals_against, goal_difference, points,
        category: categoryKey
      })
    }
  })

  // --- Matches ---
  const matches: MatchRow[] = []
  $('div.matchlist li.row[data-match]').each((_, row) => {
    const $row = $(row)
    const matchId = $row.attr('data-match') || ''

    const dateText = $row.find('.date').text().trim()
    let date = dateText
    try {
      const datePart = dateText.split(' ')[0].replace(/\.$/, '')
      const parts = datePart.split('.')
      if (parts.length === 3) {
        date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
    } catch (_) {}

    const club1Id = $row.find('.club1').attr('data-id') || ''

    const $club1 = $row.find('.club1 a').clone()
    $club1.find('div').remove()
    const club1Name = $club1.text().trim()

    const $club2 = $row.find('.club2 a').clone()
    $club2.find('div').remove()
    const club2Name = $club2.text().trim()

    const isVeliVrhHome = club1Id === VELI_VRH_ID
    const home_team = club1Name
    const away_team = club2Name
    const opponent = isVeliVrhHome ? away_team : home_team
    const venue: 'home' | 'away' = isVeliVrhHome ? 'home' : 'away'

    const res1Text = $row.find('.res1').text().trim()
    const res2Text = $row.find('.res2').text().trim()
    const isPlayed = res1Text !== '-' && res2Text !== '-' && res1Text !== '' && res2Text !== ''

    const home_score = isPlayed ? (parseInt(res1Text) || 0) : null
    const away_score = isPlayed ? (parseInt(res2Text) || 0) : null
    const status: 'played' | 'upcoming' = isPlayed ? 'played' : 'upcoming'

    const competition = $row.find('.competitionround').text().split(',')[0].trim() || ''

    if (matchId && (club1Name || club2Name)) {
      matches.push({
        id: `${categoryKey}-${matchId}`,
        date, opponent, home_team, away_team,
        home_score, away_score, competition,
        status, venue, category: categoryKey
      })
    }
  })

  return { players, standings, matches }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const startTime = Date.now()
  console.log('[sync] Starting multi-category HNS scrape...')

  const results = { players: 0, standings: 0, matches: 0 }
  const errors: string[] = []

  for (const { key, cid } of CATEGORIES) {
    try {
      console.log(`[sync] Scraping category: ${key}`)
      const { players, standings, matches } = await scrapeCategory(key, cid)

      // Delete old rows for this category, then insert fresh
      await supabaseAdmin.from('players').delete().eq('category', key)
      await supabaseAdmin.from('standings').delete().eq('category', key)
      await supabaseAdmin.from('matches').delete().eq('category', key)

      if (players.length > 0) {
        const { error } = await supabaseAdmin.from('players').insert(players)
        if (error) throw new Error(`players insert: ${error.message}`)
      }
      if (standings.length > 0) {
        const { error } = await supabaseAdmin.from('standings').insert(standings)
        if (error) throw new Error(`standings insert: ${error.message}`)
      }
      if (matches.length > 0) {
        const { error } = await supabaseAdmin.from('matches').insert(matches)
        if (error) throw new Error(`matches insert: ${error.message}`)
      }

      results.players += players.length
      results.standings += standings.length
      results.matches += matches.length

      console.log(`[sync] ${key}: ${standings.length} standings, ${players.length} players, ${matches.length} matches`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[sync] Error in category ${key}:`, msg)
      errors.push(`${key}: ${msg}`)
    }
  }

  await supabaseAdmin.from('sync_log').insert({
    players_count: results.players,
    standings_count: results.standings,
    matches_count: results.matches,
    success: errors.length === 0,
    error_message: errors.length > 0 ? errors.join(' | ') : null
  })

  const duration = Date.now() - startTime
  console.log(`[sync] Done in ${duration}ms`, results)

  return res.status(200).json({
    success: true,
    duration_ms: duration,
    counts: results,
    errors: errors.length > 0 ? errors : undefined
  })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/mihaelmaras/veli-vrh-fc && npm run build 2>&1 | grep -v "supabase.ts"
```

Expected: No new TypeScript errors from `api/cron/sync.ts`.

- [ ] **Step 3: Commit**

```bash
git add api/cron/sync.ts
git commit -m "feat: extend sync cron to scrape all 8 uzrast categories"
```

---

### Task 3: Add `category` filter to API endpoints

**Files:**
- Modify: `api/standings.ts`
- Modify: `api/players.ts`
- Modify: `api/matches.ts`

- [ ] **Step 1: Update `api/standings.ts`**

```typescript
// api/standings.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const category = typeof req.query.category === 'string' ? req.query.category : 'seniori'

  const { data, error } = await supabase
    .from('standings')
    .select('*')
    .eq('category', category)
    .order('position', { ascending: true })

  if (error) {
    console.error('[/api/standings] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch standings' })
  }

  const standings = (data ?? []).map(s => ({
    position: s.position,
    team: s.team,
    played: s.played,
    wins: s.wins,
    draws: s.draws,
    losses: s.losses,
    goalsFor: s.goals_for,
    goalsAgainst: s.goals_against,
    goalDifference: s.goal_difference,
    points: s.points
  }))

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')

  return res.status(200).json({
    data: standings,
    fetchedAt: new Date().toISOString()
  })
}
```

- [ ] **Step 2: Update `api/players.ts`**

```typescript
// api/players.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const category = typeof req.query.category === 'string' ? req.query.category : 'seniori'

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('category', category)
    .order('number', { ascending: true })

  if (error) {
    console.error('[/api/players] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch players' })
  }

  const players = (data ?? []).map(p => ({
    firstName: p.first_name,
    lastName: p.last_name,
    number: p.number,
    position: p.position,
    goals: p.goals,
    assists: p.assists,
    appearances: p.appearances,
    yellowCards: p.yellow_cards,
    redCards: p.red_cards,
    imageUrl: p.image_url
  }))

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')

  return res.status(200).json({
    data: players,
    fetchedAt: new Date().toISOString()
  })
}
```

- [ ] **Step 3: Update `api/matches.ts`**

```typescript
// api/matches.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const category = typeof req.query.category === 'string' ? req.query.category : 'seniori'

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('category', category)
    .order('date', { ascending: true })

  if (error) {
    console.error('[/api/matches] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch matches' })
  }

  const matches = (data ?? []).map(m => ({
    id: m.id,
    date: m.date,
    opponent: m.opponent,
    homeTeam: m.home_team,
    awayTeam: m.away_team,
    homeScore: m.home_score,
    awayScore: m.away_score,
    competition: m.competition,
    status: m.status,
    venue: m.venue
  }))

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800')

  return res.status(200).json({
    data: matches,
    fetchedAt: new Date().toISOString()
  })
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/mihaelmaras/veli-vrh-fc && npm run build 2>&1 | grep -v "supabase.ts"
```

Expected: No new TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add api/standings.ts api/players.ts api/matches.ts
git commit -m "feat: add category filter to standings, players, matches API endpoints"
```

---

## Sub-project 2: Kategorije Page

---

### Task 4: Create `useKategorija` hook

**Files:**
- Create: `src/hooks/useKategorija.ts`

- [ ] **Step 1: Create the hook**

```typescript
// src/hooks/useKategorija.ts
import { useState, useEffect } from 'react'

export interface Standing {
  position: number
  team: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface KategorijaPlayer {
  firstName: string
  lastName: string
  number: number
  position: string
  goals: number
  appearances: number
  yellowCards: number
  redCards: number
  imageUrl: string | null
}

export function useKategorija(category: string) {
  const [standings, setStandings] = useState<Standing[]>([])
  const [players, setPlayers] = useState<KategorijaPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    Promise.all([
      fetch(`/api/standings?category=${category}`).then(r => r.json()),
      fetch(`/api/players?category=${category}`).then(r => r.json()),
    ])
      .then(([standingsRes, playersRes]) => {
        setStandings(standingsRes.data ?? [])
        setPlayers(playersRes.data ?? [])
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Greška pri učitavanju podataka')
      })
      .finally(() => setLoading(false))
  }, [category])

  return { standings, players, loading, error }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/mihaelmaras/veli-vrh-fc && npm run build 2>&1 | grep -v "supabase.ts"
```

Expected: No errors from `useKategorija.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useKategorija.ts
git commit -m "feat: add useKategorija hook"
```

---

### Task 5: Create `StandingsTable` component

**Files:**
- Create: `src/components/kategorija/StandingsTable.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/kategorija/StandingsTable.tsx
import { motion } from 'motion/react'
import type { Standing } from '@/hooks/useKategorija'

interface StandingsTableProps {
  standings: Standing[]
}

export default function StandingsTable({ standings }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8 text-sm">
        Podaci još nisu dostupni.
      </p>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 text-white">
            <tr>
              {['#', 'Klub', 'U', 'P', 'N', 'I', 'GD', 'GR', 'B'].map(h => (
                <th
                  key={h}
                  className={`px-4 py-3 text-sm font-semibold ${h === 'Klub' ? 'text-left' : 'text-center'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((team, i) => (
              <motion.tr
                key={team.team}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className={`border-b border-gray-100 last:border-b-0 ${
                  team.team === 'NK Veli Vrh' ? 'bg-orange-50 font-semibold' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-gray-900">{team.position}</td>
                <td className="px-4 py-3 text-gray-900">{team.team}</td>
                <td className="px-4 py-3 text-center text-gray-600">{team.played}</td>
                <td className="px-4 py-3 text-center text-gray-600">{team.wins}</td>
                <td className="px-4 py-3 text-center text-gray-600">{team.draws}</td>
                <td className="px-4 py-3 text-center text-gray-600">{team.losses}</td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {team.goalsFor}:{team.goalsAgainst}
                </td>
                <td className={`px-4 py-3 text-center font-semibold ${
                  team.goalDifference > 0 ? 'text-green-600' :
                  team.goalDifference < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                </td>
                <td className="px-4 py-3 text-center font-bold text-gray-900">{team.points}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100">
        {standings.map((team, i) => (
          <motion.div
            key={team.team}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className={`p-4 ${team.team === 'NK Veli Vrh' ? 'bg-orange-50' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">{team.position}</span>
                <span className={`font-semibold ${team.team === 'NK Veli Vrh' ? 'text-orange-500' : 'text-gray-900'}`}>
                  {team.team}
                </span>
              </div>
              <span className="font-bold text-gray-900 text-lg">{team.points}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-xs text-gray-500">
              <div className="text-center"><div className="font-semibold text-gray-800">{team.played}</div><div>Ut.</div></div>
              <div className="text-center"><div className="font-semibold text-gray-800">{team.wins}-{team.draws}-{team.losses}</div><div>P-N-I</div></div>
              <div className="text-center"><div className="font-semibold text-gray-800">{team.goalsFor}:{team.goalsAgainst}</div><div>Golovi</div></div>
              <div className="text-center">
                <div className={`font-semibold ${team.goalDifference > 0 ? 'text-green-600' : team.goalDifference < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                </div>
                <div>GR</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/mihaelmaras/veli-vrh-fc && npm run build 2>&1 | grep -v "supabase.ts"
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/kategorija/StandingsTable.tsx
git commit -m "feat: add StandingsTable component for kategorije page"
```

---

### Task 6: Create `PlayersList` component

**Files:**
- Create: `src/components/kategorija/PlayersList.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/kategorija/PlayersList.tsx
import { motion } from 'motion/react'
import type { KategorijaPlayer } from '@/hooks/useKategorija'

interface PlayersListProps {
  players: KategorijaPlayer[]
}

export default function PlayersList({ players }: PlayersListProps) {
  if (players.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8 text-sm">
        Podaci još nisu dostupni.
      </p>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-semibold">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Igrač</th>
              <th className="px-4 py-3 text-left text-sm font-semibold hidden sm:table-cell">Pozicija</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Nastupi</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Golovi</th>
              <th className="px-4 py-3 text-center text-sm font-semibold hidden sm:table-cell">Žuti</th>
              <th className="px-4 py-3 text-center text-sm font-semibold hidden sm:table-cell">Crveni</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <motion.tr
                key={`${p.number}-${p.firstName}-${p.lastName}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-lg">
                    {p.number}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-gray-900">
                    {p.firstName} {p.lastName}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm hidden sm:table-cell">{p.position}</td>
                <td className="px-4 py-3 text-center text-gray-700">{p.appearances}</td>
                <td className="px-4 py-3 text-center font-semibold text-orange-500">{p.goals}</td>
                <td className="px-4 py-3 text-center text-yellow-500 hidden sm:table-cell">{p.yellowCards}</td>
                <td className="px-4 py-3 text-center text-red-500 hidden sm:table-cell">{p.redCards}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/mihaelmaras/veli-vrh-fc && npm run build 2>&1 | grep -v "supabase.ts"
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/kategorija/PlayersList.tsx
git commit -m "feat: add PlayersList component for kategorije page"
```

---

### Task 7: Create `KategorijaPage`

**Files:**
- Create: `src/pages/KategorijaPage.tsx`

- [ ] **Step 1: Create the page**

```tsx
// src/pages/KategorijaPage.tsx
import { useState } from 'react'
import { motion } from 'motion/react'
import { useKategorija } from '@/hooks/useKategorija'
import StandingsTable from '@/components/kategorija/StandingsTable'
import PlayersList from '@/components/kategorija/PlayersList'

const TABS = [
  { key: 'seniori',       label: 'Seniori' },
  { key: 'juniori',       label: 'Juniori' },
  { key: 'pioniri',       label: 'Pioniri' },
  { key: 'mladi-pioniri', label: 'Mlađi pioniri' },
  { key: 'u-11',          label: 'U-11' },
  { key: 'u-9',           label: 'U-9' },
  { key: 'veterani',      label: 'Veterani' },
]

export default function KategorijaPage() {
  const [activeTab, setActiveTab] = useState('seniori')
  const { standings, players, loading, error } = useKategorija(activeTab)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Sve kategorije
          </h1>
          <p className="text-gray-500 text-lg">
            Ljestvice i igrači po uzrastu — NK Veli Vrh
          </p>
        </motion.div>

        {/* Tab strip */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            <div className="animate-pulse bg-white rounded-2xl h-64 border border-gray-200" />
            <div className="animate-pulse bg-white rounded-2xl h-48 border border-gray-200" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-12">{error}</p>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <h2
                className="text-xl font-bold text-gray-800 mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ljestvica
              </h2>
              <StandingsTable standings={standings} />
            </div>

            <div>
              <h2
                className="text-xl font-bold text-gray-800 mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Igrači
              </h2>
              <PlayersList players={players} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/mihaelmaras/veli-vrh-fc && npm run build 2>&1 | grep -v "supabase.ts"
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/KategorijaPage.tsx
git commit -m "feat: add KategorijaPage with tab picker, standings, and players"
```

---

### Task 8: Wire up route and navigation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/data/navigation.ts`

- [ ] **Step 1: Add route to `src/App.tsx`**

```tsx
// src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router'
import MainLayout from '@/layouts/MainLayout'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages//AboutPage'
import TeamPage from '@/pages/TeamPage'
import ContactPage from '@/pages/ContactPage'
import KategorijaPage from '@/pages/KategorijaPage'
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
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 2: Add nav link to `src/data/navigation.ts`**

```typescript
// src/data/navigation.ts
import type { NavItem } from '../types';

export const navigationItems: NavItem[] = [
  { label: 'Početna', path: '/' },
  { label: 'O klubu', path: '/about' },
  { label: 'Momčad', path: '/team' },
  { label: 'Kategorije', path: '/kategorije' },
  { label: 'Kontakt', path: '/contact' },
];
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/mihaelmaras/veli-vrh-fc && npm run build 2>&1 | grep -v "supabase.ts"
```

Expected: Build succeeds with no new errors.

- [ ] **Step 4: Start dev server and verify**

```bash
cd /Users/mihaelmaras/veli-vrh-fc && npm run dev
```

Open `http://localhost:5173` and check:
- "Kategorije" link appears in the navbar
- Clicking it navigates to `/kategorije`
- All 7 pill tabs are visible
- Clicking a tab updates the content area (loading state shows, then "Podaci još nisu dostupni" since sync hasn't run yet — this is correct)
- Page is responsive on mobile viewport

- [ ] **Step 5: Commit and push**

```bash
git add src/App.tsx src/data/navigation.ts
git commit -m "feat: wire up /kategorije route and nav link"
git push
```
