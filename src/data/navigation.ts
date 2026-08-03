import type { NavItem } from '../types';

export const navigationItems: NavItem[] = [
  { label: 'Početna', path: '/' },
  { label: 'Utakmice', path: '/utakmice' },
  { label: 'Momčad', path: '/momcad' },
  { label: 'Kategorije', path: '/kategorije' },
  { label: 'Novosti', path: '/novosti' },
  { label: 'Galerija', path: '/galerija' },
  { label: 'O klubu', path: '/o-klubu' },
  { label: 'Kontakt', path: '/kontakt' },
];

// Dodatne stranice — linkane iz footera, ne iz glavne navigacije
export const secondaryItems: NavItem[] = [
  { label: 'Statistika', path: '/statistika' },
  { label: 'Stručni stožer', path: '/strucni-stozer' },
  { label: 'Postani član', path: '/postani-clan' },
  { label: 'Obavijesti i aplikacija', path: '/obavijesti' },
];
