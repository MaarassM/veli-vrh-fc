// Vercel Cron Job
// POST /api/cron/sync - Scrape HNS i spremi u Supabase
// Vercel poziva ovo automatski prema rasporedu u vercel.json

import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as cheerio from 'cheerio'
import { supabaseAdmin } from '../../lib/supabase'

const HNS_URL = 'https://semafor.hns.family/klubovi/1546/nk-veli-vrh/'
const VELI_VRH_ID = '1546'

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
}

async function scrapeAll(): Promise<{
  players: PlayerRow[]
  standings: StandingRow[]
  matches: MatchRow[]
}> {
  const response = await fetch(HNS_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NK-Veli-Vrh-Bot/1.0)' }
  })

  if (!response.ok) throw new Error(`HNS returned ${response.status}`)

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

    // Pozicija je tekst direktno u .playerName, van h3
    const playerNameEl = $row.find('.playerName')
    playerNameEl.find('h3').remove()
    const position = playerNameEl.text().trim()

    const appearances = parseInt($row.find('.apps').text().trim()) || 0

    // Golovi — ako span ima klasu 'conceded' to su primljeni golovi (vratar), ne daju se
    const $goalsSpan = $row.find('.goals span')
    const goals = $goalsSpan.hasClass('conceded') ? 0 : parseInt($goalsSpan.text().trim()) || 0

    // Kartoni format: "2 / 0"
    const cardsText = $row.find('.cards').text().trim()
    const cardsParts = cardsText.split('/')
    const yellow_cards = parseInt(cardsParts[0]?.trim()) || 0
    const red_cards = parseInt(cardsParts[1]?.trim()) || 0

    // Slika — lazy loaded, src je u data-url
    const image_url = $row.find('.playerPhoto img').attr('data-url') || ''

    if (fullName && number > 0) {
      players.push({ first_name, last_name, number, position, goals, assists: 0, appearances, yellow_cards, red_cards, image_url })
    }
  })

  // --- Standings ---
  const standings: StandingRow[] = []
  $('div.competition_table.type1 li.row[data-clubid]').each((_, row) => {
    const $row = $(row)
    const position = parseInt($row.find('.position').text().trim()) || 0

    // Tim naziv — ukloni logo div da dobijemo cisti tekst
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
      standings.push({ position, team, played, wins, draws, losses, goals_for, goals_against, goal_difference, points })
    }
  })

  // --- Matches ---
  const matches: MatchRow[] = []
  $('div.matchlist li.row[data-match]').each((_, row) => {
    const $row = $(row)
    const matchId = $row.attr('data-match') || ''

    const dateText = $row.find('.date').text().trim()
    // Format: "07.09.2025. 10:30" → "2025-09-07"
    let date = dateText
    try {
      const datePart = dateText.split(' ')[0].replace('.', '')
      const parts = datePart.split('.')
      if (parts.length === 3) {
        date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
    } catch (_) {}

    const club1Id = $row.find('.club1').attr('data-id') || ''
    const club2Id = $row.find('.club2').attr('data-id') || ''

    // Izvuci ime kluba bez logo diva
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
    const isPlayed = res1Text !== '-' && res2Text !== '-'

    const home_score = isPlayed ? (parseInt(res1Text) || 0) : null
    const away_score = isPlayed ? (parseInt(res2Text) || 0) : null
    const status: 'played' | 'upcoming' = isPlayed ? 'played' : 'upcoming'

    const competition = $row.find('.competitionround').text().split(',')[0].trim() || 'ELITNA LIGA NSŽI'

    if (matchId && (club1Name || club2Name)) {
      matches.push({ id: matchId, date, opponent, home_team, away_team, home_score, away_score, competition, status, venue })
    }
  })

  return { players, standings, matches }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const startTime = Date.now()
  console.log('[sync] Starting HNS scrape...')

  try {
    const { players, standings, matches } = await scrapeAll()
    console.log(`[sync] Scraped: ${players.length} players, ${standings.length} standings, ${matches.length} matches`)

    const [playersResult, standingsResult, matchesResult] = await Promise.all([
      supabaseAdmin.from('players').delete().neq('id', 0).then(() =>
        supabaseAdmin.from('players').insert(players)
      ),
      supabaseAdmin.from('standings').delete().neq('id', 0).then(() =>
        supabaseAdmin.from('standings').insert(standings)
      ),
      supabaseAdmin.from('matches').delete().neq('id', '').then(() =>
        supabaseAdmin.from('matches').insert(matches)
      )
    ])

    const errors = [playersResult, standingsResult, matchesResult]
      .map(r => r.error?.message)
      .filter(Boolean)

    if (errors.length > 0) throw new Error(`DB errors: ${errors.join(', ')}`)

    await supabaseAdmin.from('sync_log').insert({
      players_count: players.length,
      standings_count: standings.length,
      matches_count: matches.length,
      success: true
    })

    const duration = Date.now() - startTime
    console.log(`[sync] Done in ${duration}ms`)

    return res.status(200).json({
      success: true,
      duration_ms: duration,
      counts: { players: players.length, standings: standings.length, matches: matches.length }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[sync] Error:', message)

    await supabaseAdmin.from('sync_log').insert({
      success: false,
      error_message: message
    }).catch(() => {})

    return res.status(500).json({ success: false, error: message })
  }
}
