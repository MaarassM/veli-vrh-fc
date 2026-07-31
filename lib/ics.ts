// iCalendar (RFC 5545) builder za raspored utakmica — čisto, bez fetcha
export interface IcsMatch {
  id: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  status: 'played' | 'upcoming' | 'postponed'
  competition: string
}

const DEFAULT_KICKOFF = '18:00'
const MATCH_DURATION_HOURS = 2

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function toDtValue(date: string, time: string): string {
  const [h, m] = time.split(':')
  return `${date.replace(/-/g, '')}T${h.padStart(2, '0')}${m.padStart(2, '0')}00`
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number)
  const end = (h + hours) % 24
  return `${String(end).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function summaryFor(match: IcsMatch): string {
  if (match.status === 'played' && match.homeScore !== null && match.awayScore !== null) {
    return `${match.homeTeam} ${match.homeScore}:${match.awayScore} ${match.awayTeam}`
  }
  const suffix = match.status === 'postponed' ? ' (odgođeno)' : ''
  return `${match.homeTeam} - ${match.awayTeam}${suffix}`
}

export function buildIcs(matches: IcsMatch[], calName: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NK Veli Vrh//Raspored//HR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calName)}`,
    'X-WR-TIMEZONE:Europe/Zagreb',
  ]

  for (const match of matches) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(match.date)) continue
    const start = match.time ?? DEFAULT_KICKOFF
    const end = addHours(start, MATCH_DURATION_HOURS)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${match.id}@nkvelivrh`,
      `DTSTAMP:${match.date.replace(/-/g, '')}T000000Z`,
      `DTSTART;TZID=Europe/Zagreb:${toDtValue(match.date, start)}`,
      `DTEND;TZID=Europe/Zagreb:${toDtValue(match.date, end)}`,
      `SUMMARY:${escapeText(summaryFor(match))}`,
      `DESCRIPTION:${escapeText(match.competition)}`,
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n') + '\r\n'
}
