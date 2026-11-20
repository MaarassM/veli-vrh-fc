// Jedan izvor istine za naslove, opise i prioritete statičnih ruta.
// Koriste ga React stranice (komponenta SEO), generator sitemapa i prerender.

export const SITE_URL = 'https://nkvelivrh.com'
export const SITE_NAME = 'NK Veli Vrh'

export const DEFAULT_DESCRIPTION =
  'NK Veli Vrh je hrvatska nogometna udruga iz Pule, Istra. Povijest kluba od 1975., momčad, galerija i kontakt.'
export const DEFAULT_KEYWORDS =
  'NK Veli Vrh, veli vrh, pula nogomet, Istra, nk veli vrh, stadion Tivoli, nogomet pula'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/team-celebration.jpg`

export interface RouteSeo {
  path: string
  title: string
  description: string
  changefreq: 'weekly' | 'monthly' | 'yearly'
  priority: string
}

export const ROUTE_SEO: RouteSeo[] = [
  {
    path: '/',
    title: 'NK Veli Vrh | Nogometni klub iz Pule, Istra',
    description: DEFAULT_DESCRIPTION,
    changefreq: 'monthly',
    priority: '1.0',
  },
  {
    path: '/momcad',
    title: 'Momčad | NK Veli Vrh',
    description:
      'Seniorska momčad NK Veli Vrh — igrači i stručni stožer.',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    path: '/o-klubu',
    title: 'O klubu | NK Veli Vrh — Povijest od 1975.',
    description:
      'Saznajte više o NK Veli Vrh, nogometnom klubu osnovanom 1975. godine u Puli, Istra. Povijest, tradicija i zajedništvo.',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/galerija',
    title: 'Galerija | NK Veli Vrh',
    description: 'Fotografije s utakmica, treninga i klupskih događaja NK Veli Vrh Pula.',
    changefreq: 'monthly',
    priority: '0.6',
  },
  {
    path: '/kontakt',
    title: 'Kontakt | NK Veli Vrh Pula',
    description:
      'Kontaktirajte NK Veli Vrh. Adresa: Veli Vrh 1, 52100 Pula. Email: nkvelivrh@gmail.com. Pratite nas na Facebooku i Instagramu.',
    changefreq: 'yearly',
    priority: '0.5',
  },
  {
    path: '/privatnost',
    title: 'Privatnost i uvjeti | NK Veli Vrh',
    description:
      'Kako NK Veli Vrh postupa s osobnim podacima, fotografijama i kolačićima na ovoj stranici.',
    changefreq: 'yearly',
    priority: '0.3',
  },
]

/** Props za <SEO /> na statičnoj ruti. Baca ako ruta nije u tablici — bolje odmah nego tiho krivi naslov. */
export function seoProps(path: string) {
  const route = ROUTE_SEO.find(r => r.path === path)
  if (!route) throw new Error(`Nema SEO podataka za rutu ${path}`)
  return { title: route.title, description: route.description, canonicalPath: route.path }
}
