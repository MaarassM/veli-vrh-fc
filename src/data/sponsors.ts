// Sponzori kluba — uredi ovu listu (logo u public/images/sponsors/).
// Ako je lista prazna, traka se ne prikazuje.
export interface Sponsor {
  name: string
  logoUrl: string | null
  url: string | null
}

export const sponsors: Sponsor[] = [
  // { name: 'Naziv sponzora', logoUrl: '/images/sponsors/naziv.png', url: 'https://...' },
]
