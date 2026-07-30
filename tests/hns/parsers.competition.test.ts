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
