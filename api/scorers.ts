import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase.js'
import { currentSeason } from '../lib/hns/discovery.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const category = typeof req.query.category === 'string' ? req.query.category : 'seniori'
  const season = typeof req.query.season === 'string' ? req.query.season : currentSeason(new Date())
  const limitRaw = parseInt(String(req.query.limit ?? '10'))
  const limit = Math.min(Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10, 50)

  // Nađi ligaško (ne-kup) natjecanje za kategoriju i sezonu
  const { data: comps, error: compError } = await supabase
    .from('competitions')
    .select('id')
    .eq('category', category)
    .eq('season', season)
    .eq('is_cup', false)
    .limit(1)

  if (compError) {
    console.error('[/api/scorers] Supabase error:', compError.message)
    return res.status(500).json({ error: 'Failed to fetch scorers' })
  }

  if (!comps || comps.length === 0) {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')
    return res.status(200).json({ data: [], fetchedAt: new Date().toISOString() })
  }

  const { data, error } = await supabase
    .from('scorers')
    .select('*')
    .eq('competition_id', comps[0].id)
    .eq('season', season)
    .order('goals', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[/api/scorers] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch scorers' })
  }

  const scorers = (data ?? []).map(s => ({
    personId: s.person_id,
    position: s.position,
    name: s.name,
    club: s.club,
    goals: s.goals,
    photoUrl: s.photo_url
  }))

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')

  return res.status(200).json({
    data: scorers,
    fetchedAt: new Date().toISOString()
  })
}
