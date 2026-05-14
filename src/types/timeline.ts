export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  category: 'founding' | 'achievement' | 'milestone' | 'infrastructure';
}
