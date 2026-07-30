// Tipovi za podatke parsirane s HNS Semafora

export interface ParsedStanding {
  part: string            // dio lige, npr. "ELITNA LIGA NSŽI 25/26 1.DIO"; '' ako je jedna tablica
  position: number
  clubId: number | null   // iz /klubovi/{id}/ href-a
  team: string
  logoUrl: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string            // npr. "WWDLW", '' ako nema
}

export interface ParsedMatch {
  matchId: number         // data-match
  round: number           // data-round
  part: string            // iste oznake kao standings parts
  date: string | null     // ISO "2025-09-06" ili null
  time: string | null     // "17:30" ili null
  homeClubId: number | null
  homeTeam: string
  homeLogoUrl: string
  awayClubId: number | null
  awayTeam: string
  awayLogoUrl: string
  homeScore: number | null
  awayScore: number | null
  status: 'played' | 'upcoming'
}

export interface ParsedScorer {
  personId: number
  position: number
  name: string
  club: string
  goals: number
  photoUrl: string
  playerUrl: string
}

export interface ParsedCompetitionPage {
  standingsParts: ParsedStanding[]   // svi dijelovi, razlikuju se po `part`
  matches: ParsedMatch[]
  scorers: ParsedScorer[]
}

export interface ParsedLineupPlayer {
  personId: number
  team: 'home' | 'away'
  teamName: string
  number: number
  name: string
  isCaptain: boolean
  position: string        // "Vratar" | "Igrač"
  photoUrl: string
}

export interface ParsedMatchEvent {
  personId: number
  playerName: string
  team: 'home' | 'away'
  minute: number | null
  type: string            // css klasa: 'goal' | 'substitutionIn' | 'substitutionOut' | 'yellowCard' | ...
  label: string           // hrvatska oznaka iz title atributa: 'Gol', 'Izmjena', ...
}

export interface ParsedMatchDetail {
  homeTeam: string
  awayTeam: string
  homeLogoUrl: string
  awayLogoUrl: string
  homeScore: number | null
  awayScore: number | null
  status: string          // "Završeno" itd.
  venue: string           // facility bez datuma, npr. "Fortin, Štinjan"
  kickoffAt: string | null // ISO "2025-10-26T10:30" (lokalno, bez TZ)
  attendance: number | null
  referees: string
  lineups: ParsedLineupPlayer[]
  events: ParsedMatchEvent[]
}

export interface ParsedRosterPlayer {
  firstName: string
  lastName: string
  number: number
  position: string
  appearances: number
  goals: number
  yellowCards: number
  redCards: number
  imageUrl: string
}

export interface CompetitionInfo {
  cid: number
  name: string
  season: string          // "2025/2026"
  acat: string            // HNS kategorija, npr. "Seniors"
  category: string        // naš ključ, npr. "seniori"
  isCup: boolean
}
