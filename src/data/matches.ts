import type { Match } from '../types/match';

// Real match data from HNS Semafor (2025/26 season)
export const recentMatches: Match[] = [
  {
    id: 'match-1',
    date: '2025-11-29',
    opponent: 'NK Istra-Pula',
    homeTeam: 'NK Veli Vrh',
    awayTeam: 'NK Istra-Pula',
    homeScore: 3,
    awayScore: 1,
    competition: 'ELITNA LIGA NSŽI 25/26',
    venue: 'home',
    status: 'played',
  },
  {
    id: 'match-2',
    date: '2025-11-09',
    opponent: 'NK Dajla',
    homeTeam: 'NK Dajla',
    awayTeam: 'NK Veli Vrh',
    homeScore: 6,
    awayScore: 0,
    competition: 'ELITNA LIGA NSŽI 25/26',
    venue: 'away',
    status: 'played',
  },
  {
    id: 'match-3',
    date: '2025-11-02',
    opponent: 'NK Vrsar',
    homeTeam: 'NK Veli Vrh',
    awayTeam: 'NK Vrsar',
    homeScore: 2,
    awayScore: 0,
    competition: 'ELITNA LIGA NSŽI 25/26',
    venue: 'home',
    status: 'played',
  },
];

export const upcomingMatches: Match[] = [
  {
    id: 'upcoming-1',
    date: '2026-02-28T15:00:00',
    opponent: 'NK Novigrad 1947',
    homeTeam: 'NK Novigrad 1947',
    awayTeam: 'NK Veli Vrh',
    competition: 'ELITNA LIGA NSŽI 25/26',
    round: 14,
    venue: 'away',
    status: 'upcoming',
  },
];
