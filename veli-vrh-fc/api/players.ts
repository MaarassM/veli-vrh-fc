// Vercel/Netlify Serverless Function
// GET /api/players - Dohvaća igrače sa statistikama s HNS Semafora

import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as cheerio from 'cheerio'

interface PlayerStats {
  firstName: string
  lastName: string
  number: number
  position: string
  goals: number
  assists: number
  appearances: number
  yellowCards: number
  redCards: number
  imageUrl?: string
}

// Cache configuration
const CACHE_DURATION = 3600 // 1 sat u sekundama
let cachedData: { data: PlayerStats[]; timestamp: number } | null = null

async function scrapePlayerStats(): Promise<PlayerStats[]> {
  try {
    const response = await fetch('https://semafor.hns.family/klubovi/1546/nk-veli-vrh/')
    const html = await response.text()
    const $ = cheerio.load(html)

    const players: PlayerStats[] = []

    // Scrape players from the roster table
    $('table.table tbody tr').each((i, row) => {
      const $row = $(row)

      // Extract player info from columns
      const numberText = $row.find('td').eq(0).text().trim()
      const number = parseInt(numberText) || 0

      const fullName = $row.find('td').eq(1).text().trim()
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const position = $row.find('td').eq(2).text().trim()
      const goals = parseInt($row.find('td').eq(3).text().trim()) || 0
      const appearances = parseInt($row.find('td').eq(4).text().trim()) || 0
      const yellowCards = parseInt($row.find('td').eq(5).text().trim()) || 0
      const redCards = parseInt($row.find('td').eq(6).text().trim()) || 0

      // Extract image URL from player link
      const playerLink = $row.find('a').attr('href')
      let imageUrl = ''

      // Try to get image from img tag
      const imgSrc = $row.find('img').attr('src')
      if (imgSrc) {
        imageUrl = imgSrc.startsWith('http') ? imgSrc : `https://hns.family${imgSrc}`
      }

      if (fullName && number > 0) {
        players.push({
          firstName,
          lastName,
          number,
          position,
          goals,
          assists: 0, // Assists not available on main page
          appearances,
          yellowCards,
          redCards,
          imageUrl
        })
      }
    })

    return players
  } catch (error) {
    console.error('Error scraping player stats:', error)

    // Fallback to mock data if scraping fails
    return [
      {
        firstName: 'Marko',
        lastName: 'Grgić',
        number: 1,
        position: 'Vratar',
        goals: 0,
        assists: 0,
        appearances: 10,
        yellowCards: 2,
        redCards: 0,
        imageUrl: 'https://hns.family/files/images_comet/fd/c/fdced8031008ff8082a039df35c52babc8a37460.png'
      },
      {
        firstName: 'Petar',
        lastName: 'Grgić',
        number: 8,
        position: 'Napadač',
        goals: 7,
        assists: 0,
        appearances: 13,
        yellowCards: 0,
        redCards: 0,
        imageUrl: 'https://hns.family/files/images_comet/c4/b/c4b03371a5c509b41378075e925721350e823d0b.png'
      },
      {
        firstName: 'Irian',
        lastName: 'Beviakva',
        number: 6,
        position: 'Napadač',
        goals: 7,
        assists: 0,
        appearances: 15,
        yellowCards: 1,
        redCards: 0,
        imageUrl: 'https://hns.family/files/images_comet/a0/e/a0ef59071c642716ac57b2990e1bbe31d9641cdf.png'
      },
      {
        firstName: 'Mateo',
        lastName: 'Lovrić',
        number: 20,
        position: 'Vezni',
        goals: 4,
        assists: 0,
        appearances: 14,
        yellowCards: 1,
        redCards: 0,
        imageUrl: 'https://hns.family/files/images_comet/1c/5/1c5f3bba969bd2d7e5672aa30db9be12a30b4c57.png'
      },
      {
        firstName: 'Mihael',
        lastName: 'Maras',
        number: 10,
        position: 'Vezni',
        goals: 3,
        assists: 0,
        appearances: 15,
        yellowCards: 2,
        redCards: 0,
        imageUrl: 'https://hns.family/files/images_comet/eb/4/eb43982d07d9900b79d3c5e03a7108e0f53a3ab5.png'
      }
    ]
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const now = Date.now()

    // Provjeri cache
    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION * 1000) {
      return res.status(200).json({
        data: cachedData.data,
        cached: true,
        cachedAt: new Date(cachedData.timestamp).toISOString()
      })
    }

    // Dohvati nove podatke
    const players = await scrapePlayerStats()

    // Spremi u cache
    cachedData = {
      data: players,
      timestamp: now
    }

    // Cache headers za CDN
    res.setHeader('Cache-Control', `s-maxage=${CACHE_DURATION}, stale-while-revalidate`)

    return res.status(200).json({
      data: players,
      cached: false,
      fetchedAt: new Date(now).toISOString()
    })
  } catch (error) {
    console.error('Error fetching player stats:', error)
    return res.status(500).json({ error: 'Failed to fetch player stats' })
  }
}
