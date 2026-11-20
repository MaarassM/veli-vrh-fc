import type { NavItem } from '../types';

export const navigationItems: NavItem[] = [
  { label: 'Početna', path: '/' },
  { label: 'O klubu', path: '/o-klubu' },
  { label: 'Momčad', path: '/momcad' },
  { label: 'Galerija', path: '/galerija' },
  { label: 'Kontakt', path: '/kontakt' },
];

// Dodatne stranice — linkane iz footera, ne iz glavne navigacije
export const secondaryItems: NavItem[] = [
  { label: 'Privatnost i uvjeti', path: '/privatnost' },
];
