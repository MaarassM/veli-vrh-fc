// Čisti helperi za rad s utakmicama — bez fetcha, testabilni
export interface MatchItem {
  id: string
  matchId: number | null
  date: string
  time: string | null
  round: number | null
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  competition: string
  status: 'played' | 'upcoming' | 'postponed'
  venue: 'home' | 'away'
  isVeliVrh: boolean
}

export interface RoundGroup {
  round: number | null
  matches: MatchItem[]
}

export function groupByRound(matches: MatchItem[]): RoundGroup[] {
  const byRound = new Map<number | null, MatchItem[]>()
  for (const match of matches) {
    const key = match.round
    const list = byRound.get(key) ?? []
    list.push(match)
    byRound.set(key, list)
  }
  const rounds = [...byRound.keys()].sort((a, b) => {
    if (a === null) return 1
    if (b === null) return -1
    return a - b
  })
  return rounds.map(round => ({
    round,
    matches: (byRound.get(round) ?? []).sort((a, b) => a.date.localeCompare(b.date)),
  }))
}

export function nextMatch(matches: MatchItem[]): MatchItem | null {
  const upcoming = matches
    .filter(match => match.status === 'upcoming')
    .sort((a, b) => a.date.localeCompare(b.date))
  return upcoming[0] ?? null
}

export function lastPlayed(matches: MatchItem[]): MatchItem | null {
  const played = matches
    .filter(match => match.status === 'played')
    .sort((a, b) => b.date.localeCompare(a.date))
  return played[0] ?? null
}
