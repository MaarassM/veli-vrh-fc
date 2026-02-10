export interface Match {
  id: string;
  date: string;
  opponent: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  competition: string;
  round?: number;
  venue?: 'home' | 'away';
  status: 'played' | 'upcoming' | 'postponed';
}

export interface StandingsEntry {
  position: number;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}
