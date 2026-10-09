// Jedan izvor istine za naslove, opise i prioritete statičnih ruta.
// Koriste ga React stranice (komponenta SEO), generator sitemapa i prerender.
import { CATEGORY_TABS } from './categories'

export const SITE_URL = 'https://nkvelivrh.com'
export const SITE_NAME = 'NK Veli Vrh'

export const DEFAULT_DESCRIPTION =
  'NK Veli Vrh je hrvatska nogometna udruga iz Pule, Istra. Pratite rezultate, vijesti i raspored utakmica.'
export const DEFAULT_KEYWORDS =
  'NK Veli Vrh, veli vrh, pula nogomet, Istra, HNS, 5. liga Istra, nk veli vrh, istrasport, nogomet pula'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/team-celebration.jpg`

export interface RouteSeo {
  path: string
  title: string
  description: string
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority: string
}

export const ROUTE_SEO: RouteSeo[] = [
  {
    path: '/',
    title: 'NK Veli Vrh | Nogometni klub iz Pule, Istra',
    description: DEFAULT_DESCRIPTION,
    changefreq: 'daily',
    priority: '1.0',
  },
  {
    path: '/utakmice',
    title: 'Utakmice | NK Veli Vrh',
    description:
      'Raspored i rezultati utakmica NK Veli Vrh — liga, kup i sve kategorije. Podaci s HNS Semafora.',
    changefreq: 'daily',
    priority: '0.9',
  },
  {
    path: '/kategorije',
    title: 'Kategorije | NK Veli Vrh',
    description:
      'Ljestvica, utakmice i igrači svih kategorija NK Veli Vrh — od škole nogometa do veterana.',
    changefreq: 'weekly',
    priority: '0.9',
  },
  {
    path: '/momcad',
    title: 'Momčad | NK Veli Vrh',
    description:
      'Seniorska momčad NK Veli Vrh — igrači, statistike i stručni stožer. Podaci s HNS Semafora.',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    path: '/statistika',
    title: 'Statistika | NK Veli Vrh',
    description:
      'Statistika NK Veli Vrh — ligaški strijelci, forma, učinak kod kuće i u gostima. Podaci s HNS Semafora.',
    changefreq: 'weekly',
    priority: '0.7',
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
    path: '/strucni-stozer',
    title: 'Stručni stožer | NK Veli Vrh Pula',
    description: 'Upoznajte stručni stožer i igrače NK Veli Vrh iz Pule, Istra.',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/postani-clan',
    title: 'Postani član | NK Veli Vrh',
    description:
      'Upiši se u školu nogometa NK Veli Vrh ili se priključi seniorima. Treniramo na stadionu Tivoli u Puli.',
    changefreq: 'yearly',
    priority: '0.6',
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
  ...CATEGORY_TABS.map(({ key, label }) => ({
    path: `/kategorije/${key}`,
    title: `${label} | NK Veli Vrh`,
    description: `Ljestvica, utakmice i igrači — ${label} NK Veli Vrh. Podaci s HNS Semafora.`,
    changefreq: 'weekly' as const,
    priority: '0.7',
  })),
]

/** Props za <SEO /> na statičnoj ruti. Baca ako ruta nije u tablici — bolje odmah nego tiho krivi naslov. */
export function seoProps(path: string) {
  const route = ROUTE_SEO.find(r => r.path === path)
  if (!route) throw new Error(`Nema SEO podataka za rutu ${path}`)
  return { title: route.title, description: route.description, canonicalPath: route.path }
}
