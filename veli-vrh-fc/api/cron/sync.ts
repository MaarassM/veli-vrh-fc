// Vercel Cron Job
// POST /api/cron/sync - Scrape HNS i spremi u Supabase
// Vercel poziva ovo automatski prema rasporedu u vercel.json

import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as cheerio from 'cheerio'
import { supabaseAdmin } from '../../lib/supabase'

const HNS_URL = 'https://semafor.hns.family/klubovi/1546/nk-veli-vrh/'

interface PlayerStats {
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

interface Standing {
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

interface Match {
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
  players: PlayerStats[]
  standings: Standing[]
  matches: Match[]
}> {
  const response = await fetch(HNS_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NK-Veli-Vrh-Bot/1.0)' }
  })

  if (!response.ok) {
    throw new Error(`HNS returned ${response.status}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  // --- Players ---
  const players: PlayerStats[] = []
  $('table.table tbody tr').each((i, row) => {
    const $row = $(row)
    const numberText = $row.find('td').eq(0).text().trim()
    const number = parseInt(numberText) || 0
    const fullName = $row.find('td').eq(1).text().trim()
    const nameParts = fullName.split(' ')
    const first_name = nameParts[0] || ''
    const last_name = nameParts.slice(1).join(' ') || ''
    const position = $row.find('td').eq(2).text().trim()
    const goals = parseInt($row.find('td').eq(3).text().trim()) || 0
    const appearances = parseInt($row.find('td').eq(4).text().trim()) || 0
    const yellow_cards = parseInt($row.find('td').eq(5).text().trim()) || 0
    const red_cards = parseInt($row.find('td').eq(6).text().trim()) || 0
    const imgSrc = $row.find('img').attr('src') || ''
    const image_url = imgSrc.startsWith('http') ? imgSrc : imgSrc ? `https://hns.family${imgSrc}` : ''

    if (fullName && number > 0) {
      players.push({ first_name, last_name, number, position, goals, assists: 0, appearances, yellow_cards, red_cards, image_url })
    }
  })

  // --- Standings ---
  const standings: Standing[] = []
  $('table.table').each((i, table) => {
    const $table = $(table)
    const firstHeader = $table.find('thead th').first().text().toLowerCase()
    if (firstHeader.includes('poz') || firstHeader === '#') {
      $table.find('tbody tr').each((j, row) => {
        const $row = $(row)
        const cells = $row.find('td')
        if (cells.length >= 10) {
          const position = parseInt(cells.eq(0).text().trim()) || 0
          const team = cells.eq(1).text().trim()
          const played = parseInt(cells.eq(2).text().trim()) || 0
          const wins = parseInt(cells.eq(3).text().trim()) || 0
          const draws = parseInt(cells.eq(4).text().trim()) || 0
          const losses = parseInt(cells.eq(5).text().trim()) || 0
          const goals_for = parseInt(cells.eq(6).text().trim()) || 0
          const goals_against = parseInt(cells.eq(7).text().trim()) || 0
          const goal_difference = parseInt(cells.eq(8).text().trim()) || (goals_for - goals_against)
          const points = parseInt(cells.eq(9).text().trim()) || 0
          if (team && position > 0) {
            standings.push({ position, team, played, wins, draws, losses, goals_for, goals_against, goal_difference, points })
          }
        }
      })
    }
  })

  // --- Matches ---
  const matches: Match[] = []
  let matchIndex = 0
  $('table.table').each((i, table) => {
    const $table = $(table)
    const headers = $table.find('thead th').map((_, th) => $(th).text().toLowerCase()).get()
    if (headers.some(h => h.includes('datum') || h.includes('date'))) {
      $table.find('tbody tr').each((j, row) => {
        const $row = $(row)
        const cells = $row.find('td')
        if (cells.length >= 3) {
          matchIndex++
          const dateText = cells.eq(0).text().trim()
          const teamsText = cells.eq(1).text().trim()
          const scoreText = cells.eq(2).text().trim()

          const teamsSplit = teamsText.split(/\s*[-:]\s*|\s+vs\s+/i)
          const home_team = teamsSplit[0]?.trim() || ''
          const away_team = teamsSplit[1]?.trim() || ''
          const isHome = home_team.toLowerCase().includes('veli vrh')
          const opponent = isHome ? away_team : home_team
          const venue: 'home' | 'away' = isHome ? 'home' : 'away'

          let home_score: number | null = null
          let away_score: number | null = null
          let status: 'played' | 'upcoming' | 'postponed' = 'upcoming'

          const scoreParts = scoreText.split(/[-:]/).map(s => s.trim())
          if (scoreParts.length === 2) {
            const h = parseInt(scoreParts[0])
            const a = parseInt(scoreParts[1])
            if (!isNaN(h) && !isNaN(a)) {
              home_score = h
              away_score = a
              status = 'played'
            }
          }

          let date = dateText
          try {
            const dateParts = dateText.split('.')
            if (dateParts.length === 3) {
              date = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`
            }
          } catch (_) {}

          if (home_team && away_team) {
            matches.push({
              id: `match-${matchIndex}`,
              date,
              opponent,
              home_team,
              away_team,
              home_score,
              away_score,
              competition: 'ELITNA LIGA NSŽI 25/26',
              status,
              venue
            })
          }
        }
      })
    }
  })

  return { players, standings, matches }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Provjeri Vercel cron autorizaciju
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const startTime = Date.now()
  console.log('[sync] Starting HNS scrape...')

  try {
    const { players, standings, matches } = await scrapeAll()
    console.log(`[sync] Scraped: ${players.length} players, ${standings.length} standings, ${matches.length} matches`)

    // Brisi stare podatke i umetni nove (upsert tablice)
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

    if (errors.length > 0) {
      throw new Error(`DB errors: ${errors.join(', ')}`)
    }

    // Zabilježi uspjesnu sinkronizaciju
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
    }).catch(() => {}) // ne fail-aj ako ni log ne radi

    return res.status(500).json({ success: false, error: message })
  }
}
