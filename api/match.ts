import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const idRaw = String(req.query.id ?? '')
  if (!/^\d+$/.test(idRaw)) {
    return res.status(400).json({ error: 'Missing or invalid id' })
  }
  const matchId = parseInt(idRaw)

  const [detailRes, lineupsRes, eventsRes] = await Promise.all([
    supabase.from('match_details').select('*').eq('match_id', matchId).maybeSingle(),
    supabase.from('match_lineups').select('*').eq('match_id', matchId).order('number', { ascending: true }),
    supabase.from('match_events').select('*').eq('match_id', matchId).order('minute', { ascending: true }),
  ])

  if (detailRes.error || lineupsRes.error || eventsRes.error) {
    const msg = detailRes.error?.message || lineupsRes.error?.message || eventsRes.error?.message
    console.error('[/api/match] Supabase error:', msg)
    return res.status(500).json({ error: 'Failed to fetch match' })
  }

  if (!detailRes.data) {
    return res.status(404).json({ error: 'Match not found' })
  }

  const d = detailRes.data
  const info = {
    matchId: d.match_id,
    homeTeam: d.home_team,
    awayTeam: d.away_team,
    homeScore: d.home_score,
    awayScore: d.away_score,
    status: d.status,
    venue: d.venue,
    kickoffAt: d.kickoff_at,
    attendance: d.attendance,
    referees: d.referees
  }

  const lineups = (lineupsRes.data ?? []).map(l => ({
    personId: l.person_id,
    team: l.team,
    teamName: l.team_name,
    number: l.number,
    name: l.name,
    isCaptain: l.is_captain,
    position: l.position,
    photoUrl: l.photo_url
  }))

  const events = (eventsRes.data ?? []).map(e => ({
    personId: e.person_id,
    playerName: e.player_name,
    team: e.team,
    minute: e.minute,
    type: e.type,
    label: e.label
  }))

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')

  return res.status(200).json({
    data: { info, lineups, events },
    fetchedAt: new Date().toISOString()
  })
}
