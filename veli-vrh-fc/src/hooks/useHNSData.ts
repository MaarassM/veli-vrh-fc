// React hooks za dohvaćanje živih podataka s API-ja
import { useState, useEffect } from 'react'
import { players as staticPlayers } from '@/data/players'
import { leagueStandings as staticStandings } from '@/data/standings'

const API_BASE_URL = '/api'

interface PlayerStats {
  firstName: string
  lastName: string
  number: number
  position: string
  goals: number
  assists: number
  appearances: number
  yellowCards: number
  redCards: number
  imageUrl?: string
}

interface Standing {
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

interface Match {
  id: string
  date: string
  opponent: string
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  competition: string
  status: 'played' | 'upcoming' | 'postponed'
  venue: 'home' | 'away'
}

interface APIResponse<T> {
  data: T
  cached: boolean
  cachedAt?: string
  fetchedAt?: string
}

/**
 * Hook za dohvaćanje statistika igrača
 * U development modu koristi statičke podatke kao fallback
 */
export function usePlayerStats() {
  const [data, setData] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_BASE_URL}/players`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result: APIResponse<PlayerStats[]> = await response.json()
        setData(result.data)
        setError(null)
      } catch (err) {
        // Fallback to static data in development
        console.log('Using static player data as fallback')
        const fallbackData = staticPlayers.map(p => ({
          firstName: p.firstName,
          lastName: p.lastName,
          number: p.number,
          position: p.position,
          goals: p.goals || 0,
          assists: p.assists || 0,
          appearances: p.appearances || 0,
          yellowCards: 0,
          redCards: 0,
          imageUrl: p.image
        }))
        setData(fallbackData)
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

/**
 * Hook za dohvaćanje ljestvice
 * U development modu koristi statičke podatke kao fallback
 */
export function useStandings() {
  const [data, setData] = useState<Standing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_BASE_URL}/standings`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result: APIResponse<Standing[]> = await response.json()
        setData(result.data)
        setError(null)
      } catch (err) {
        // Fallback to static data in development
        console.log('Using static standings data as fallback')
        setData(staticStandings)
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

/**
 * Hook za dohvaćanje utakmica
 */
export function useMatches() {
  const [data, setData] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_BASE_URL}/matches`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result: APIResponse<Match[]> = await response.json()
        setData(result.data)
        setError(null)
      } catch (err) {
        // No fallback for matches - just show error
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching matches:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

/**
 * Hook za dohvaćanje top strijelaca iz statistika
 */
export function useTopScorers(limit: number = 5) {
  const { data: players, loading, error } = usePlayerStats()

  const topScorers = players
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, limit)

  return { data: topScorers, loading, error }
}
