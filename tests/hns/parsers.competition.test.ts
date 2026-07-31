import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseCompetitionPage } from '../../lib/hns/parsers.js'

const html = readFileSync('tests/fixtures/hns/competition-elitna.html', 'utf-8')

describe('parseCompetitionPage — standings', () => {
  const { standingsParts } = parseCompetitionPage(html)

  it('parses both league parts (1.DIO and TREĆI DIO), 10 rows each', () => {
    const parts = [...new Set(standingsParts.map(s => s.part))]
    expect(parts).toHaveLength(2)
    expect(parts.some(p => p.includes('1.DIO'))).toBe(true)
    expect(parts.some(p => p.includes('TREĆI DIO'))).toBe(true)
    expect(standingsParts).toHaveLength(20)
  })

  it('parses Štinjan as leader of a part with correct numbers', () => {
    const stinjan = standingsParts.find(s => s.team === 'NK Štinjan' && s.position === 1)
    expect(stinjan).toBeDefined()
    expect(stinjan!.clubId).toBe(1542)
    expect(stinjan!.played).toBe(27)
    expect(stinjan!.wins).toBe(20)
    expect(stinjan!.draws).toBe(5)
    expect(stinjan!.losses).toBe(2)
    expect(stinjan!.goalsFor).toBe(90)
    expect(stinjan!.goalsAgainst).toBe(22)
    expect(stinjan!.goalDifference).toBe(68)
    expect(stinjan!.points).toBe(65)
    expect(stinjan!.form).toBe('WWWWW')
    expect(stinjan!.logoUrl).toContain('hns.family')
  })

  it('includes Veli Vrh with clubId 1546', () => {
    const vv = standingsParts.filter(s => s.clubId === 1546)
    expect(vv.length).toBeGreaterThan(0)
  })

  it('ignores content outside the league blocks', () => {
    // Vrh stranice sadrži HNL utakmice (GNK Dinamo) — ne smiju procuriti u tablicu
    expect(standingsParts.some(s => s.team.includes('Dinamo'))).toBe(false)
  })
})

describe('parseCompetitionPage — matches', () => {
  const { matches } = parseCompetitionPage(html)

  it('parses all rounds of both parts (18 + 9 rounds × 5 matches)', () => {
    expect(matches.length).toBeGreaterThanOrEqual(130)
    const rounds = new Set(matches.map(m => m.round))
    expect(rounds.has(1)).toBe(true)
    expect(rounds.has(18)).toBe(true)
  })

  it('parses the Štinjan 7:1 Veli Vrh match (round 8, id 100703921)', () => {
    const m = matches.find(x => x.matchId === 100703921)!
    expect(m).toBeDefined()
    expect(m.round).toBe(8)
    expect(m.homeTeam).toBe('NK Štinjan')
    expect(m.awayTeam).toBe('NK Veli Vrh')
    expect(m.homeClubId).toBe(1542)
    expect(m.awayClubId).toBe(1546)
    expect(m.homeScore).toBe(7)
    expect(m.awayScore).toBe(1)
    expect(m.status).toBe('played')
    expect(m.date).toBe('2025-10-26')
    expect(m.time).toBe('10:30')
  })

  it('does not include HNL matches from the top scoreboard', () => {
    expect(matches.some(m => m.homeTeam.includes('Dinamo'))).toBe(false)
  })

  it('has no duplicate matchIds', () => {
    const ids = matches.map(m => m.matchId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('marks matches without result as upcoming with null scores', () => {
    const upcoming = matches.filter(m => m.status === 'upcoming')
    for (const m of upcoming.slice(0, 3)) {
      expect(m.homeScore).toBeNull()
      expect(m.awayScore).toBeNull()
    }
  })
})

describe('parseCompetitionPage — scorers (league top 5)', () => {
  const { scorers } = parseCompetitionPage(html)

  it('parses exactly the top-5 league list', () => {
    expect(scorers).toHaveLength(5)
    expect(scorers[0].name).toBe('Antonio Gračić')
    expect(scorers[0].goals).toBe(24)
  })

  it('parses Irian Beviakva (NK Veli Vrh) with 12 goals', () => {
    const b = scorers.find(s => s.name === 'Irian Beviakva')!
    expect(b).toBeDefined()
    expect(b.personId).toBe(215967)
    expect(b.club).toBe('NK Veli Vrh')
    expect(b.goals).toBe(12)
    expect(b.photoUrl).toContain('hns.family')
  })

  it('does not leak per-club widget lists or the Kartoni list', () => {
    // top-5 liste po klubovima su izvan scope bloka; Kartoni redovi imaju prazan .goals
    expect(scorers.every(s => s.goals > 0)).toBe(true)
  })
})
