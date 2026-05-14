import { useState, useEffect } from 'react'

export interface Standing {
  position: number
  team: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface KategorijaPlayer {
  firstName: string
  lastName: string
  number: number
  position: string
  goals: number
  appearances: number
  yellowCards: number
  redCards: number
  imageUrl: string | null
}

export function useKategorija(category: string) {
  const [standings, setStandings] = useState<Standing[]>([])
  const [players, setPlayers] = useState<KategorijaPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    Promise.all([
      fetch(`/api/standings?category=${category}`).then(r => r.json()),
      fetch(`/api/players?category=${category}`).then(r => r.json()),
    ])
      .then(([standingsRes, playersRes]) => {
        setStandings(standingsRes.data ?? [])
        setPlayers(playersRes.data ?? [])
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Greška pri učitavanju podataka')
      })
      .finally(() => setLoading(false))
  }, [category])

  return { standings, players, loading, error }
}
