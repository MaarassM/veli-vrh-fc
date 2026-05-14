export type StaffRole =
  | "President"
  | "Head Coach"
  | "Uprava kluba";

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  image: string;
  since: string;
}
