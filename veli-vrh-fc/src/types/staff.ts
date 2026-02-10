export type StaffRole =
  | 'Head Coach'
  | 'Assistant Coach'
  | 'Goalkeeping Coach'
  | 'Fitness Coach'
  | 'Physiotherapist'
  | 'Team Manager';

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  image: string;
  since: string;
}
