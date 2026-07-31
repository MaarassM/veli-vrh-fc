import { useState, useEffect } from 'react'

export interface MatchInfo {
  matchId: number
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  status: string
  venue: string | null
  kickoffAt: string | null
  attendance: number | null
  referees: string | null
}

export interface LineupEntry {
  personId: number | null
  team: 'home' | 'away'
  teamName: string
  number: number | null
  name: string
  isCaptain: boolean
  position: string | null
  photoUrl: string | null
}

export interface MatchEvent {
  personId: number | null
  playerName: string
  team: 'home' | 'away'
  minute: number | null
  type: string
  label: string | null
}

export interface MatchDetail {
  info: MatchInfo
  lineups: LineupEntry[]
  events: MatchEvent[]
}

export function useMatch(id: string | undefined) {
  const [match, setMatch] = useState<MatchDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    setError(null)

    fetch(`/api/match?id=${encodeURIComponent(id)}`)
      .then(r => {
        if (r.status === 404) {
          setNotFound(true)
          return null
        }
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(result => {
        if (result) setMatch(result.data)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Greška pri učitavanju utakmice'))
      .finally(() => setLoading(false))
  }, [id])

  return { match, loading, notFound, error }
}
