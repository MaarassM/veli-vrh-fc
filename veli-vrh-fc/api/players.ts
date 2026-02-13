// Vercel Serverless Function
// GET /api/players - Vraca igraca iz Supabase baze

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('goals', { ascending: false })

  if (error) {
    console.error('[/api/players] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch players' })
  }

  // Normalizacija u camelCase za frontend
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
