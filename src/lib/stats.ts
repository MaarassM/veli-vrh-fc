// Statistike Velog Vrha izvedene iz liste utakmica — čisto, bez fetcha
import type { MatchItem } from './matches'

interface VenueRecord {
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
}

export interface HomeAwayRecord {
  home: VenueRecord
  away: VenueRecord
}

interface Perspective {
  scored: number
  conceded: number
}

// Rezultat iz perspektive Velog Vrha, bez obzira je li domaćin
function perspective(match: MatchItem): Perspective | null {
  if (match.status !== 'played' || match.homeScore === null || match.awayScore === null) return null
  return match.venue === 'home'
    ? { scored: match.homeScore, conceded: match.awayScore }
    : { scored: match.awayScore, conceded: match.homeScore }
}

export function homeAwayRecord(matches: MatchItem[]): HomeAwayRecord {
  const empty = (): VenueRecord => ({ wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 })
  const record: HomeAwayRecord = { home: empty(), away: empty() }

  for (const match of matches) {
    const p = perspective(match)
    if (!p) continue
    const side = match.venue === 'home' ? record.home : record.away
    side.goalsFor += p.scored
    side.goalsAgainst += p.conceded
    if (p.scored > p.conceded) side.wins++
    else if (p.scored === p.conceded) side.draws++
    else side.losses++
  }
  return record
}

export function biggestWin(matches: MatchItem[]): MatchItem | null {
  let best: MatchItem | null = null
  let bestMargin = 0
  for (const match of matches) {
    const p = perspective(match)
    if (!p) continue
    const margin = p.scored - p.conceded
    if (margin > bestMargin) {
      bestMargin = margin
      best = match
    }
  }
  return best
}

export function formString(matches: MatchItem[], n = 5): string {
  const played = matches
    .filter(match => perspective(match) !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, n)

  return played
    .map(match => {
      const p = perspective(match)!
      if (p.scored > p.conceded) return 'W'
      if (p.scored === p.conceded) return 'D'
      return 'L'
    })
    .join('')
}
