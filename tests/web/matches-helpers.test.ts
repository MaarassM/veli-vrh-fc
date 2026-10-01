import { describe, it, expect } from 'vitest'
import { groupByRound, groupByPart, nextMatch, lastPlayed, type MatchItem } from '../../src/lib/matches'

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

describe('groupByPart', () => {
  it('splits matches into league parts ordered by earliest date, rounds within', () => {
    const withParts: MatchItem[] = [
      m({ id: 'p2', part: 'TREĆI DIO', round: 1, date: '2026-04-12' }),
      m({ id: 'p1', part: '1.DIO', round: 1, date: '2025-09-07' }),
      m({ id: 'p3', part: '1.DIO', round: 2, date: '2025-09-13' }),
    ]
    const parts = groupByPart(withParts)
    expect(parts.map(p => p.part)).toEqual(['1.DIO', 'TREĆI DIO'])
    expect(parts[0].groups.map(g => g.round)).toEqual([1, 2])
    expect(parts[1].groups[0].matches[0].id).toBe('p2')
  })

  it('single unnamed part keeps everything together', () => {
    const parts = groupByPart(fixture)
    expect(parts).toHaveLength(1)
    expect(parts[0].part).toBe('')
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

describe('utakmice bez datuma (HNS još nije objavio termin)', () => {
  const bezDatuma = m({ id: 'bezDatuma', date: null as unknown as string, round: 2, status: 'upcoming' })
  const imaDatum = m({ id: 'imaDatum', date: '2026-10-05', round: 2, status: 'upcoming' })
  const kasnije = m({ id: 'kasnije', date: '2026-10-12', round: 2, status: 'upcoming' })
  const odigrana = m({ id: 'odigrana', date: '2026-09-20', round: 1, status: 'played', homeScore: 1, awayScore: 0 })

  // Sort poziva komparator s argumentima u raznim redoslijedima, pa null mora
  // biti siguran na obje strane — zato provjeravamo sve permutacije.
  const permutacije: MatchItem[][] = [
    [bezDatuma, imaDatum, kasnije, odigrana],
    [imaDatum, bezDatuma, kasnije, odigrana],
    [imaDatum, kasnije, bezDatuma, odigrana],
    [odigrana, kasnije, imaDatum, bezDatuma],
  ]

  it('nijedan helper ne puca ni u jednom redoslijedu', () => {
    for (const lista of permutacije) {
      expect(() => groupByRound(lista)).not.toThrow()
      expect(() => groupByPart(lista)).not.toThrow()
      expect(() => nextMatch(lista)).not.toThrow()
      expect(() => lastPlayed(lista)).not.toThrow()
    }
  })

  it('utakmice bez datuma idu na kraj kola', () => {
    for (const lista of permutacije) {
      const round2 = groupByRound(lista).find(g => g.round === 2)!
      expect(round2.matches.map(x => x.id)).toEqual(['imaDatum', 'kasnije', 'bezDatuma'])
    }
  })

  it('nextMatch bira prvu s objavljenim terminom', () => {
    for (const lista of permutacije) expect(nextMatch(lista)?.id).toBe('imaDatum')
  })

  it('lastPlayed i dalje radi', () => {
    for (const lista of permutacije) expect(lastPlayed(lista)?.id).toBe('odigrana')
  })
})
