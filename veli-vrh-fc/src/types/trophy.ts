export type TrophyCategory = 'League' | 'Cup' | 'Regional' | 'Youth';

export interface Trophy {
  id: string;
  name: string;
  category: TrophyCategory;
  year: number;
  season: string;
  description: string;
}
