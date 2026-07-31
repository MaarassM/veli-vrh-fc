import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase.js'
import { activeSeason } from '../lib/hns/active-season.js'
import { buildIcs, type IcsMatch } from '../lib/ics.js'

const CATEGORY_LABELS: Record<string, string> = {
  'seniori': 'Seniori',
  'juniori': 'Juniori',
  'pioniri': 'Pioniri',
  'mladi-pioniri': 'Mlađi pioniri',
  'u-11': 'U-11',
  'u-9': 'U-9',
  'veterani': 'Veterani',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const categoryRaw = typeof req.query.category === 'string' ? req.query.category : 'seniori'
  const category = CATEGORY_LABELS[categoryRaw] ? categoryRaw : 'seniori'
  const season = await activeSeason(supabase)

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('category', category)
    .eq('season', season)
    .eq('is_veli_vrh', true)
    .order('date', { ascending: true })

  if (error) {
    console.error('[/api/calendar-ics] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to build calendar' })
  }

  const matches: IcsMatch[] = (data ?? []).map(m => ({
    id: m.id,
    date: m.date,
    time: m.time ?? null,
    homeTeam: m.home_team,
    awayTeam: m.away_team,
    homeScore: m.home_score,
    awayScore: m.away_score,
    status: m.status,
    competition: m.competition ?? '',
  }))

  const ics = buildIcs(matches, `NK Veli Vrh — ${CATEGORY_LABELS[category]}`)

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', 'inline; filename="nk-veli-vrh.ics"')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).send(ics)
}
