export type PlayerPosition = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  number: number;
  position: PlayerPosition;
  image: string;
  isCaptain: boolean;
  goals?: number;
  assists?: number;
  appearances?: number;
  minutesPlayed?: number;
}
