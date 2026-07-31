import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase.js'
import { activeSeason } from '../lib/hns/active-season.js'

const VELI_VRH_CLUB_ID = 1546

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const category = typeof req.query.category === 'string' ? req.query.category : 'seniori'
  const season = typeof req.query.season === 'string' ? req.query.season : await activeSeason(supabase)

  const { data, error } = await supabase
    .from('standings')
    .select('*')
    .eq('category', category)
    .eq('season', season)
    .order('position', { ascending: true })

  if (error) {
    console.error('[/api/standings] Supabase error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch standings' })
  }

  const rows = data ?? []

  // Odabir dijela lige: preferiraj onaj u kojem igra Veli Vrh; među njima uzmi
  // kasniji dio sezone (labela je najduža/zadnja po abecedi tek slučajno, pa
  // koristimo redoslijed: dio s najviše odigranih kola Velog Vrha = aktualniji).
  const parts = [...new Set(rows.map(r => r.part ?? ''))]
  let selectedPart = parts[0] ?? ''
  if (parts.length > 1) {
    const vvParts = parts.filter(p =>
      rows.some(r => (r.part ?? '') === p && r.club_id === VELI_VRH_CLUB_ID)
    )
    const candidates = vvParts.length > 0 ? vvParts : parts
    // aktualniji dio = onaj s manje odigranih utakmica po klubu (kasnija faza tek počinje)
    // stabilnije: uzmi dio čiji naziv NE sadrži "1.DIO" ako postoji više kandidata
    selectedPart =
      candidates.find(p => !/1\.\s*DIO/i.test(p)) ?? candidates[candidates.length - 1]
  }

  const standings = rows
    .filter(r => (r.part ?? '') === selectedPart)
    .map(s => ({
      position: s.position,
      team: s.team,
      played: s.played,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      goalsFor: s.goals_for,
      goalsAgainst: s.goals_against,
      goalDifference: s.goal_difference,
      points: s.points,
      form: s.form ?? '',
      logoUrl: s.logo_url ?? '',
      clubId: s.club_id ?? null,
    }))

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')

  return res.status(200).json({
    data: standings,
    part: selectedPart,
    fetchedAt: new Date().toISOString()
  })
}
