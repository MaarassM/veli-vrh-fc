import { useState, useEffect } from 'react'
import type { MatchItem } from '@/lib/matches'

export type CompetitionFilter = 'liga' | 'kup' | 'sve'

interface ApiMatch {
  id: string
  date: string
  opponent: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  competition: string
  status: 'played' | 'upcoming' | 'postponed'
  venue: 'home' | 'away'
  round: number | null
  time: string | null
  part: string
  homeLogoUrl: string
  awayLogoUrl: string
  isVeliVrh: boolean
}

// id je oblika "{kategorija}-{hnsMatchId}" — broj treba za /utakmice/{id}
function extractMatchId(id: string): number | null {
  const numeric = id.split('-').pop() ?? ''
  return /^\d+$/.test(numeric) ? parseInt(numeric, 10) : null
}

export function mapApiMatch(m: ApiMatch): MatchItem & { homeLogoUrl: string; awayLogoUrl: string; part: string } {
  return {
    id: m.id,
    matchId: extractMatchId(m.id),
    date: m.date,
    time: m.time,
    round: m.round,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    competition: m.competition,
    status: m.status,
    venue: m.venue,
    isVeliVrh: m.isVeliVrh,
    homeLogoUrl: m.homeLogoUrl,
    awayLogoUrl: m.awayLogoUrl,
    part: m.part,
  }
}

export function useMatchList(category: string, competition: CompetitionFilter, all: boolean, season?: string) {
  const [matches, setMatches] = useState<ReturnType<typeof mapApiMatch>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({ category })
    if (all) params.set('all', '1')
    if (competition !== 'sve') params.set('competition', competition)
    if (season) params.set('season', season)

    fetch(`/api/matches?${params}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(result => setMatches((result.data ?? []).map(mapApiMatch)))
      .catch(err => setError(err instanceof Error ? err.message : 'Greška pri učitavanju utakmica'))
      .finally(() => setLoading(false))
  }, [category, competition, all, season])

  return { matches, loading, error }
}
