// Vercel Serverless Function
// GET /api/matches - Vraca utakmice iz Supabase baze

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('date', { ascending: true })

  if (error) {
    console.error('[/api/matches] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch matches' })
  }

  // Normalizacija u camelCase za frontend
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
