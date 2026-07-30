import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

describe('fixtures', () => {
  it('competition fixture is present and non-trivial', () => {
    const html = readFileSync('tests/fixtures/hns/competition-elitna.html', 'utf-8')
    expect(html.length).toBeGreaterThan(100_000)
    expect(html).toContain('ELITNA LIGA')
  })
})
