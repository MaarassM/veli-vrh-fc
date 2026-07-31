import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseClubRoster } from '../../lib/hns/parsers.js'

const html = readFileSync('tests/fixtures/hns/club-page.html', 'utf-8')

describe('parseClubRoster', () => {
  const roster = parseClubRoster(html)

  it('parses a non-empty roster with numbers and names', () => {
    expect(roster.length).toBeGreaterThan(10)
    expect(roster.every(p => p.number > 0)).toBe(true)
    expect(roster.every(p => p.firstName.length > 0)).toBe(true)
  })

  it('includes goalkeepers with position Vratar', () => {
    expect(roster.some(p => p.position === 'Vratar')).toBe(true)
  })

  it('parses appearance and goal counts as numbers', () => {
    expect(roster.every(p => Number.isInteger(p.appearances))).toBe(true)
    expect(roster.every(p => Number.isInteger(p.goals))).toBe(true)
  })
})
