export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  /** Fotografije stožera se više ne prikazuju; polje ostaje zbog zapisa u bazi. */
  image?: string | null;
  since: string | null;
}
