import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase.js'
import { activeSeason } from '../lib/hns/active-season.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const category = typeof req.query.category === 'string' ? req.query.category : 'seniori'
  const season = typeof req.query.season === 'string' ? req.query.season : await activeSeason(supabase)
  const all = req.query.all === '1'
  const competition = typeof req.query.competition === 'string' ? req.query.competition : null

  let query = supabase
    .from('matches')
    .select('*')
    .eq('category', category)
    .eq('season', season)
    .order('date', { ascending: true })

  if (!all) query = query.eq('is_veli_vrh', true)
  if (competition === 'kup') query = query.ilike('competition', '%KUP%')
  if (competition === 'liga') query = query.not('competition', 'ilike', '%KUP%')

  const { data, error } = await query

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
    venue: m.venue,
    round: m.round ?? null,
    time: m.time ?? null,
    part: m.part ?? '',
    homeLogoUrl: m.home_logo_url ?? '',
    awayLogoUrl: m.away_logo_url ?? '',
    isVeliVrh: m.is_veli_vrh ?? true
  }))

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800')

  return res.status(200).json({
    data: matches,
    fetchedAt: new Date().toISOString()
  })
}
