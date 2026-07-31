import { describe, it, expect } from 'vitest'
import { homeAwayRecord, biggestWin, formString } from '../../src/lib/stats'
import type { MatchItem } from '../../src/lib/matches'

function m(over: Partial<MatchItem>): MatchItem {
  return {
    id: 'x',
    matchId: 1,
    date: '2026-03-01',
    time: null,
    round: 1,
    homeTeam: 'NK Veli Vrh',
    awayTeam: 'NK Dajla',
    homeScore: null,
    awayScore: null,
    competition: 'LIGA',
    status: 'played',
    venue: 'home',
    isVeliVrh: true,
    ...over,
  }
}

const matches: MatchItem[] = [
  // dom: pobjeda 4:1
  m({ id: 'a', date: '2026-03-01', venue: 'home', homeScore: 4, awayScore: 1 }),
  // dom: poraz 1:6
  m({ id: 'b', date: '2026-03-08', venue: 'home', homeScore: 1, awayScore: 6 }),
  // gosti: remi 2:2 (Veli Vrh je away)
  m({ id: 'c', date: '2026-03-15', venue: 'away', homeTeam: 'NK Dajla', awayTeam: 'NK Veli Vrh', homeScore: 2, awayScore: 2 }),
  // gosti: pobjeda 0:3
  m({ id: 'd', date: '2026-03-22', venue: 'away', homeTeam: 'NK Dajla', awayTeam: 'NK Veli Vrh', homeScore: 0, awayScore: 3 }),
  // neodigrana — ignorira se
  m({ id: 'e', date: '2026-04-01', status: 'upcoming' }),
]

describe('homeAwayRecord', () => {
  it('splits wins/draws/losses and goals by venue from Veli Vrh perspective', () => {
    const rec = homeAwayRecord(matches)
    expect(rec.home).toEqual({ wins: 1, draws: 0, losses: 1, goalsFor: 5, goalsAgainst: 7 })
    expect(rec.away).toEqual({ wins: 1, draws: 1, losses: 0, goalsFor: 5, goalsAgainst: 2 })
  })
})

describe('biggestWin', () => {
  it('finds the largest margin victory', () => {
    expect(biggestWin(matches)?.id).toBe('a') // +3 kod kuće i +3 u gostima → prva po marginu pa datumu
  })
  it('returns null without wins', () => {
    expect(biggestWin([matches[1]])).toBeNull()
  })
})

describe('formString', () => {
  it('returns last n results newest-first as W/D/L', () => {
    expect(formString(matches, 3)).toBe('WDL')
  })
})
