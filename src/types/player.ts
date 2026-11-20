export const PLAYER_POSITIONS = ['Vratar', 'Obrana', 'Vezni red', 'Napad'] as const;

export type PlayerPosition = (typeof PLAYER_POSITIONS)[number];

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  number: number | null;
  position: PlayerPosition | null;
}
