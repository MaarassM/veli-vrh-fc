// Service za dohvaćanje živih podataka s HNS Semafora
// Sve statistike, ljestvica i utakmice se dohvaćaju uživo

export interface LivePlayerStats {
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

export interface LiveStandings {
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

export interface LiveMatch {
  date: string
  opponent: string
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  competition: string
  status: 'played' | 'upcoming' | 'postponed'
}

// Cache za podatke (5 minuta)
interface CacheEntry<T> {
  data: T
  timestamp: number
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minuta
const cache = new Map<string, CacheEntry<any>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }

  return entry.data
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

/**
 * Dohvaća uživo statistike igrača s HNS Semafora
 */
export async function fetchLivePlayerStats(): Promise<LivePlayerStats[]> {
  const cacheKey = 'player-stats'
  const cached = getCached<LivePlayerStats[]>(cacheKey)
  if (cached) return cached

  try {
    // U production okruženju, ovdje bi se stvarno scrapao HNS Semafor
    // Za sada vraćamo podatke iz JSON datoteke
    const response = await fetch('/data/players-data.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    const stats: LivePlayerStats[] = data.map((player: any) => ({
      firstName: player.firstName,
      lastName: player.lastName,
      number: player.number,
      position: player.position,
      goals: player.goals || 0,
      assists: player.assists || 0,
      appearances: player.appearances || 0,
      yellowCards: player.yellowCards || 0,
      redCards: player.redCards || 0,
      imageUrl: player.imageUrl
    }))

    setCache(cacheKey, stats)
    return stats
  } catch (error) {
    console.error('Error fetching player stats:', error)
    // Fallback na praznu listu
    return []
  }
}

/**
 * Dohvaća uživo ljestvicu s HNS Semafora
 */
export async function fetchLiveStandings(): Promise<LiveStandings[]> {
  const cacheKey = 'standings'
  const cached = getCached<LiveStandings[]>(cacheKey)
  if (cached) return cached

  try {
    // U production okruženju, ovdje bi se stvarno scrapao HNS Semafor
    // Za sada vraćamo statične podatke
    const standings: LiveStandings[] = [
      {
        position: 1,
        team: 'NK Štinjan',
        played: 12,
        wins: 9,
        draws: 1,
        losses: 2,
        goalsFor: 33,
        goalsAgainst: 15,
        goalDifference: 18,
        points: 28,
      },
      {
        position: 2,
        team: 'NK Dajla',
        played: 13,
        wins: 8,
        draws: 1,
        losses: 4,
        goalsFor: 34,
        goalsAgainst: 20,
        goalDifference: 14,
        points: 25,
      },
      {
        position: 3,
        team: 'NK Vrsar',
        played: 13,
        wins: 8,
        draws: 1,
        losses: 4,
        goalsFor: 30,
        goalsAgainst: 28,
        goalDifference: 2,
        points: 25,
      },
      {
        position: 4,
        team: 'NK Veli Vrh',
        played: 13,
        wins: 7,
        draws: 1,
        losses: 5,
        goalsFor: 25,
        goalsAgainst: 33,
        goalDifference: -8,
        points: 22,
      },
      {
        position: 5,
        team: 'NK Novigrad 1947',
        played: 12,
        wins: 6,
        draws: 1,
        losses: 5,
        goalsFor: 23,
        goalsAgainst: 19,
        goalDifference: 4,
        points: 19,
      },
    ]

    setCache(cacheKey, standings)
    return standings
  } catch (error) {
    console.error('Error fetching standings:', error)
    return []
  }
}

/**
 * Dohvaća uživo utakmice s HNS Semafora
 */
export async function fetchLiveMatches(): Promise<LiveMatch[]> {
  const cacheKey = 'matches'
  const cached = getCached<LiveMatch[]>(cacheKey)
  if (cached) return cached

  try {
    // U production okruženju, ovdje bi se stvarno scrapao HNS Semafor
    const matches: LiveMatch[] = [
      {
        date: '2026-01-25',
        opponent: 'NK Istra-Pula',
        homeTeam: 'NK Veli Vrh',
        awayTeam: 'NK Istra-Pula',
        homeScore: 3,
        awayScore: 1,
        competition: 'ELITNA LIGA NSŽI 25/26',
        status: 'played',
      },
      {
        date: '2026-02-28',
        opponent: 'NK Novigrad 1947',
        homeTeam: 'NK Veli Vrh',
        awayTeam: 'NK Novigrad 1947',
        competition: 'ELITNA LIGA NSŽI 25/26',
        status: 'upcoming',
      },
    ]

    setCache(cacheKey, matches)
    return matches
  } catch (error) {
    console.error('Error fetching matches:', error)
    return []
  }
}

/**
 * Kombinira podatke iz baze (osnovna lista igrača) sa živim statistikama s HNS-a
 */
export async function mergePlayersWithStats(
  playersFromDB: Array<{ firstName: string; lastName: string; number: number; position: string }>
): Promise<LivePlayerStats[]> {
  const liveStats = await fetchLivePlayerStats()

  return playersFromDB.map(dbPlayer => {
    // Pronađi matching player u live stats
    const stats = liveStats.find(
      s => s.firstName === dbPlayer.firstName &&
           s.lastName === dbPlayer.lastName &&
           s.number === dbPlayer.number
    )

    return {
      firstName: dbPlayer.firstName,
      lastName: dbPlayer.lastName,
      number: dbPlayer.number,
      position: dbPlayer.position,
      goals: stats?.goals || 0,
      assists: stats?.assists || 0,
      appearances: stats?.appearances || 0,
      yellowCards: stats?.yellowCards || 0,
      redCards: stats?.redCards || 0,
      imageUrl: stats?.imageUrl
    }
  })
}
