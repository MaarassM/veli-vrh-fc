// api/cron/sync.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as cheerio from 'cheerio'
import { supabaseAdmin } from '../../lib/supabase.js'

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
