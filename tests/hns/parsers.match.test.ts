import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseMatchDetail } from '../../lib/hns/parsers.js'

const html = readFileSync('tests/fixtures/hns/match-velivrh.html', 'utf-8')

describe('parseMatchDetail', () => {
  const d = parseMatchDetail(html)

  it('parses header: teams, score, status', () => {
    expect(d.homeTeam).toBe('NK Štinjan')
    expect(d.awayTeam).toBe('NK Veli Vrh')
    expect(d.homeScore).toBe(7)
    expect(d.awayScore).toBe(1)
    expect(d.status).toBe('Završeno')
  })

  it('parses venue, kickoff and attendance', () => {
    expect(d.venue).toBe('Fortin, Štinjan')
    expect(d.kickoffAt).toBe('2025-10-26T10:30')
    expect(d.attendance).toBe(100)
  })

  it('parses both lineups with numbers and positions', () => {
    const home = d.lineups.filter(l => l.team === 'home')
    const away = d.lineups.filter(l => l.team === 'away')
    expect(home.length).toBeGreaterThanOrEqual(11)
    expect(away.length).toBeGreaterThanOrEqual(11)
    expect(d.lineups.every(l => l.personId > 0)).toBe(true)
    expect(d.lineups.some(l => l.position === 'Vratar')).toBe(true)
  })

  it('parses goal events with minutes', () => {
    const goals = d.events.filter(e => e.type === 'goal')
    expect(goals.length).toBe(8) // 7:1
    expect(goals.every(g => g.minute !== null && g.minute > 0)).toBe(true)
    expect(goals.some(g => g.team === 'away')).toBe(true) // gol Velog Vrha
  })

  it('parses substitutions', () => {
    expect(d.events.some(e => e.type === 'substitutionIn')).toBe(true)
    expect(d.events.some(e => e.type === 'substitutionOut')).toBe(true)
  })
})

const dupHtml = readFileSync('tests/fixtures/hns/match-dup-person.html', 'utf-8')

describe('parseMatchDetail — igrač koji je ujedno i trener', () => {
  const d = parseMatchDetail(dupHtml)

  it('vraća svakog person_id samo jednom (PK je match_id+person_id)', () => {
    const ids = d.lineups.map(l => l.personId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('zadržava igračku ulogu umjesto trenerske', () => {
    const marić = d.lineups.filter(l => l.personId === 92814)
    expect(marić).toHaveLength(1)
    expect(marić[0].position).toBe('Igrač')
  })
})

describe('parseMatchDetail — sudačka nadoknada', () => {
  const d = parseMatchDetail(dupHtml)

  it('razdvaja 90+1 na minutu i nadoknadu', () => {
    const late = d.events.filter(e => e.minute === 90)
    expect(late.length).toBeGreaterThan(0)
    expect(late.some(e => e.minuteExtra === 1)).toBe(true)
    expect(late.some(e => e.minuteExtra === 3)).toBe(true)
  })

  it('Ćosićev gol je u 90+1, ne u 1. minuti', () => {
    const cosic = d.events.find(e => e.playerName.includes('Ćosić') && e.type === 'goal')!
    expect(cosic.minute).toBe(90)
    expect(cosic.minuteExtra).toBe(1)
  })

  it('obična minuta nema nadoknadu', () => {
    const regular = d.events.find(e => e.minute === 13)!
    expect(regular.minuteExtra).toBeNull()
  })
})
