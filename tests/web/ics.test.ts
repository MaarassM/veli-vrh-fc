import { describe, it, expect } from 'vitest'
import { buildIcs, type IcsMatch } from '../../lib/ics'

const matches: IcsMatch[] = [
  {
    id: 'seniori-100703886',
    date: '2025-09-07',
    time: '10:30',
    homeTeam: 'NK Veli Vrh',
    awayTeam: 'NK Dajla',
    homeScore: 1,
    awayScore: 3,
    status: 'played',
    competition: 'ELITNA LIGA NSŽI 25/26',
  },
  {
    id: 'seniori-100703999',
    date: '2026-08-30',
    time: null,
    homeTeam: 'NK Štinjan; Pula',
    awayTeam: 'NK Veli Vrh',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
    competition: 'ELITNA LIGA NSŽI 26/27',
  },
]

describe('buildIcs', () => {
  const ics = buildIcs(matches, 'NK Veli Vrh — Utakmice')

  it('is a valid VCALENDAR wrapper with one VEVENT per match', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true)
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true)
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    expect(ics).toContain('X-WR-CALNAME:NK Veli Vrh — Utakmice')
  })

  it('played match has score in summary', () => {
    expect(ics).toContain('NK Veli Vrh 1:3 NK Dajla')
  })

  it('upcoming match without time defaults to 18:00 local with 2h duration', () => {
    expect(ics).toContain('DTSTART;TZID=Europe/Zagreb:20260830T180000')
    expect(ics).toContain('DTEND;TZID=Europe/Zagreb:20260830T200000')
  })

  it('uses stable UID and escapes special characters', () => {
    expect(ics).toContain('UID:seniori-100703999@nkvelivrh')
    expect(ics).toContain('NK Štinjan\\; Pula')
  })

  it('played match uses its time (10:30 → 12:30 end)', () => {
    expect(ics).toContain('DTSTART;TZID=Europe/Zagreb:20250907T103000')
    expect(ics).toContain('DTEND;TZID=Europe/Zagreb:20250907T123000')
  })
})
