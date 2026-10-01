// Čisti helperi za rad s utakmicama — bez fetcha, testabilni
export interface MatchItem {
  id: string
  matchId: number | null
  date: string | null
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
  part?: string
}

// HNS ponekad objavi utakmicu bez termina — takve idu na kraj umjesto da ruše sort
export function compareByDate(a: string | null, b: string | null): number {
  if (!a && !b) return 0
  if (!a) return 1
  if (!b) return -1
  return a.localeCompare(b)
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
    matches: (byRound.get(round) ?? []).sort((a, b) => compareByDate(a.date, b.date)),
  }))
}

export interface PartGroup {
  part: string
  groups: RoundGroup[]
}

// Liga u više dijelova (1.DIO, TREĆI DIO...) broji kola ispočetka —
// dijelovi se razdvajaju i sortiraju po najranijem datumu utakmice.
export function groupByPart(matches: MatchItem[]): PartGroup[] {
  const byPart = new Map<string, MatchItem[]>()
  for (const match of matches) {
    const key = match.part ?? ''
    const list = byPart.get(key) ?? []
    list.push(match)
    byPart.set(key, list)
  }
  const parts = [...byPart.entries()].map(([part, list]) => ({
    part,
    earliest: list.reduce<string | null>(
      (min, m) => (compareByDate(m.date, min) < 0 ? m.date : min),
      list[0].date,
    ),
    groups: groupByRound(list),
  }))
  parts.sort((a, b) => compareByDate(a.earliest, b.earliest))
  return parts.map(({ part, groups }) => ({ part, groups }))
}

export function nextMatch(matches: MatchItem[]): MatchItem | null {
  const upcoming = matches
    .filter(match => match.status === 'upcoming' && match.date)
    .sort((a, b) => compareByDate(a.date, b.date))
  return upcoming[0] ?? null
}

export function lastPlayed(matches: MatchItem[]): MatchItem | null {
  const played = matches
    .filter(match => match.status === 'played' && match.date)
    .sort((a, b) => compareByDate(b.date, a.date))
  return played[0] ?? null
}
