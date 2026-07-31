import { describe, it, expect } from 'vitest'
import { groupByRound, nextMatch, lastPlayed, type MatchItem } from '../../src/lib/matches'

function m(over: Partial<MatchItem>): MatchItem {
  return {
    id: 'seniori-1',
    matchId: 1,
    date: '2026-03-01',
    time: '15:00',
    round: 1,
    homeTeam: 'NK Veli Vrh',
    awayTeam: 'NK Dajla',
    homeScore: null,
    awayScore: null,
    competition: 'ELITNA LIGA NSŽI 25/26',
    status: 'upcoming',
    venue: 'home',
    isVeliVrh: true,
    ...over,
  }
}

const fixture: MatchItem[] = [
  m({ id: 'a', round: 2, date: '2026-03-08', status: 'played', homeScore: 2, awayScore: 1 }),
  m({ id: 'b', round: 1, date: '2026-03-01', status: 'played', homeScore: 0, awayScore: 0 }),
  m({ id: 'c', round: null, date: '2026-04-01', status: 'upcoming' }),
  m({ id: 'd', round: 3, date: '2026-03-15', status: 'upcoming' }),
]

describe('groupByRound', () => {
  it('groups ascending with null rounds last', () => {
    const groups = groupByRound(fixture)
    expect(groups.map(g => g.round)).toEqual([1, 2, 3, null])
    expect(groups[0].matches[0].id).toBe('b')
  })
})

describe('nextMatch', () => {
  it('returns earliest upcoming by date', () => {
    expect(nextMatch(fixture)?.id).toBe('d')
  })
  it('returns null when nothing upcoming', () => {
    expect(nextMatch(fixture.filter(x => x.status === 'played'))).toBeNull()
  })
})

describe('lastPlayed', () => {
  it('returns latest played by date', () => {
    expect(lastPlayed(fixture)?.id).toBe('a')
  })
  it('returns null when nothing played', () => {
    expect(lastPlayed(fixture.filter(x => x.status === 'upcoming'))).toBeNull()
  })
})
