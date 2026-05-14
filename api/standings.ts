// Vercel Serverless Function
// GET /api/standings - Vraca ljestvicu iz Supabase baze

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { data, error } = await supabase
    .from('standings')
    .select('*')
    .order('position', { ascending: true })

  if (error) {
    console.error('[/api/standings] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch standings' })
  }

  // Normalizacija u camelCase za frontend
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
