import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { currentSeason, previousSeason, discoverCompetitions } from '../../lib/hns/discovery.js'

describe('currentSeason', () => {
  it('July and later belongs to the new season', () => {
    expect(currentSeason(new Date('2026-07-30'))).toBe('2026/2027')
    expect(currentSeason(new Date('2026-12-01'))).toBe('2026/2027')
  })
  it('before July belongs to the running season', () => {
    expect(currentSeason(new Date('2026-06-06'))).toBe('2025/2026')
    expect(currentSeason(new Date('2026-01-15'))).toBe('2025/2026')
  })
})

describe('previousSeason', () => {
  it('steps one season back', () => {
    expect(previousSeason('2026/2027')).toBe('2025/2026')
    expect(previousSeason('2025/2026')).toBe('2024/2025')
  })
})

describe('discoverCompetitions', () => {
  const agecats = JSON.parse(readFileSync('tests/fixtures/hns/handler-agecats.json', 'utf-8'))
  const comps = JSON.parse(readFileSync('tests/fixtures/hns/handler-comps.json', 'utf-8'))

  it('maps age categories to competitions with our category keys', async () => {
    const fetchJsonMock = async (url: string): Promise<never[]> => {
      if (url.includes('getAgeCategories')) return agecats
      if (url.includes('getCompetitions')) {
        // fixture sadrži odgovor za Seniors; ostale kategorije vraćaju []
        return url.includes('acat=Seniors') ? comps : []
      }
      throw new Error('unexpected url ' + url)
    }
    const result = await discoverCompetitions(1546, '2025/2026', fetchJsonMock)
    const liga = result.find(c => c.cid === 100703751)!
    expect(liga.category).toBe('seniori')
    expect(liga.isCup).toBe(false)
    const kup = result.find(c => c.cid === 100586758)!
    expect(kup.category).toBe('seniori')
    expect(kup.isCup).toBe(true)
    expect(kup.name).toContain('KUP')
  })
})
