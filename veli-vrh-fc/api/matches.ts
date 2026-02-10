// Vercel/Netlify Serverless Function
// GET /api/matches - Dohvaća utakmice s HNS Semafora

import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as cheerio from 'cheerio'

interface Match {
  id: string
  date: string
  opponent: string
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  competition: string
  status: 'played' | 'upcoming' | 'postponed'
  venue: 'home' | 'away'
}

const CACHE_DURATION = 1800 // 30 minuta (utakmice se češće mijenjaju)
let cachedData: { data: Match[]; timestamp: number } | null = null

async function scrapeMatches(): Promise<Match[]> {
  try {
    const response = await fetch('https://semafor.hns.family/klubovi/1546/nk-veli-vrh/')
    const html = await response.text()
    const $ = cheerio.load(html)

    const matches: Match[] = []
    let matchIndex = 0

    // Find the matches table/section
    $('table.table').each((i, table) => {
      const $table = $(table)

      // Look for matches table - usually has date, teams, and score columns
      const headers = $table.find('thead th').map((_, th) => $(th).text().toLowerCase()).get()
      const isMatchTable = headers.some(h => h.includes('datum') || h.includes('date'))

      if (isMatchTable) {
        $table.find('tbody tr').each((j, row) => {
          const $row = $(row)
          const cells = $row.find('td')

          if (cells.length >= 3) {
            matchIndex++

            const dateText = cells.eq(0).text().trim()
            const teamsText = cells.eq(1).text().trim()
            const scoreText = cells.eq(2).text().trim()

            // Parse teams (format: "Team A - Team B" or "Team A vs Team B")
            const teamsSplit = teamsText.split(/\s*[-:]\s*|\s+vs\s+/i)
            const homeTeam = teamsSplit[0]?.trim() || ''
            const awayTeam = teamsSplit[1]?.trim() || ''

            // Determine opponent and venue
            const isHome = homeTeam.toLowerCase().includes('veli vrh')
            const opponent = isHome ? awayTeam : homeTeam
            const venue: 'home' | 'away' = isHome ? 'home' : 'away'

            // Parse score (format: "3:1" or "3 - 1")
            let homeScore: number | undefined
            let awayScore: number | undefined
            let status: 'played' | 'upcoming' | 'postponed' = 'upcoming'

            const scoreParts = scoreText.split(/[-:]/).map(s => s.trim())
            if (scoreParts.length === 2) {
              const home = parseInt(scoreParts[0])
              const away = parseInt(scoreParts[1])
              if (!isNaN(home) && !isNaN(away)) {
                homeScore = home
                awayScore = away
                status = 'played'
              }
            }

            // Parse date
            let date = dateText
            try {
              // Convert Croatian date format DD.MM.YYYY to YYYY-MM-DD
              const dateParts = dateText.split('.')
              if (dateParts.length === 3) {
                date = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`
              }
            } catch (e) {
              console.error('Error parsing date:', e)
            }

            if (homeTeam && awayTeam) {
              matches.push({
                id: `match-${matchIndex}`,
                date,
                opponent,
                homeTeam,
                awayTeam,
                homeScore,
                awayScore,
                competition: 'ELITNA LIGA NSŽI 25/26',
                status,
                venue
              })
            }
          }
        })
      }
    })

    // If we got data, return it
    if (matches.length > 0) {
      return matches
    }

    // Otherwise fall through to mock data
    throw new Error('No match data found')
  } catch (error) {
    console.error('Error scraping matches:', error)

    // Fallback to mock data
    return [
      {
        id: '1',
        date: '2026-01-25',
        opponent: 'NK Istra-Pula',
        homeTeam: 'NK Veli Vrh',
        awayTeam: 'NK Istra-Pula',
        homeScore: 3,
        awayScore: 1,
        competition: 'ELITNA LIGA NSŽI 25/26',
        status: 'played',
        venue: 'home'
      },
      {
        id: '2',
        date: '2026-02-01',
        opponent: 'NK Dajla',
        homeTeam: 'NK Dajla',
        awayTeam: 'NK Veli Vrh',
        homeScore: 6,
        awayScore: 0,
        competition: 'ELITNA LIGA NSŽI 25/26',
        status: 'played',
        venue: 'away'
      },
      {
        id: '3',
        date: '2026-02-08',
        opponent: 'NK Vrsar',
        homeTeam: 'NK Veli Vrh',
        awayTeam: 'NK Vrsar',
        homeScore: 2,
        awayScore: 0,
        competition: 'ELITNA LIGA NSŽI 25/26',
        status: 'played',
        venue: 'home'
      },
      {
        id: '4',
        date: '2026-02-28',
        opponent: 'NK Novigrad 1947',
        homeTeam: 'NK Veli Vrh',
        awayTeam: 'NK Novigrad 1947',
        competition: 'ELITNA LIGA NSŽI 25/26',
        status: 'upcoming',
        venue: 'home'
      }
    ]
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const now = Date.now()

    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION * 1000) {
      return res.status(200).json({
        data: cachedData.data,
        cached: true,
        cachedAt: new Date(cachedData.timestamp).toISOString()
      })
    }

    const matches = await scrapeMatches()

    cachedData = {
      data: matches,
      timestamp: now
    }

    res.setHeader('Cache-Control', `s-maxage=${CACHE_DURATION}, stale-while-revalidate`)

    return res.status(200).json({
      data: matches,
      cached: false,
      fetchedAt: new Date(now).toISOString()
    })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return res.status(500).json({ error: 'Failed to fetch matches' })
  }
}
