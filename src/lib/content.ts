export interface Stat {
  value: string
  label: string
  description: string
}

export interface SiteContent {
  home_intro: { text: string }
  club_values: { items: { title: string; body: string }[] }
  about_overview: { subtitle: string; paragraphs: string[]; stats: Stat[] }
  stadium: { features: Stat[]; facilities: string[] }
}

export type ContentKey = keyof SiteContent

export const defaultContent: SiteContent = {
  home_intro: {
    text: 'NK Veli Vrh je nogometni klub iz istoimenog pulskog naselja, osnovan s ciljem okupljanja lokalne zajednice kroz ljubav prema najljepšoj igri. Kroz desetljeća postojanja, klub je izrastao u simbol upornosti, zajedništva i istarske nogometne tradicije.',
  },
  club_values: {
    items: [
      {
        title: 'Tradicija',
        body: 'Klub ukorijenjen u pulskoj četvrti Veli Vrh, čuvar lokalne nogometne kulture kroz desetljeća.',
      },
      {
        title: 'Zajednica',
        body: 'Više od kluba — mjesto gdje se susreću generacije, obitelji i susjedi oko zajedničke strasti.',
      },
      {
        title: 'Mladi naraštaji',
        body: 'Ulaganje u razvoj mladih igrača, jer budućnost kluba počinje na omladinskim treninzima.',
      },
    ],
  },
  about_overview: {
    subtitle: 'Nogometni klub s dugom tradicijom i velikom strašću',
    paragraphs: [
      '**NK Veli Vrh** osnovan je 21. ožujka 1975. u istoimenom pulskom naselju. Do tada na Velom Vrhu nije bilo pravog sportskog terena — igralo se na improviziranom igralištu na Monte Lešu i betonskoj ploči u Valamarinu, a klub je svoje igralište podigao na mjestu bivšeg kamenoloma.',
      'Prvu utakmicu odigrali smo 14. rujna 1975. i pobijedili NK Šišan 1:0. Kroz pola stoljeća prošli smo put od međuopćinske lige do saveznog ranga, a najveći uspjeh ostvarili smo sezone 2022./23. trećim mjestom u 4. NL NS Rijeka.',
      'Danas se natječemo u **Elitnoj ligi NSŽI**, najvišem rangu županijskog nogometa, s momčadima u svim uzrastima — od škole nogometa do veterana. Igralište Tivoli u obnovi je vrijednoj 830.000 eura.',
    ],
    stats: [
      { value: '150+', label: 'Članova', description: 'Aktivnih članova kluba' },
      { value: '50+', label: 'Godina', description: 'Od 1975. do danas' },
    ],
  },
  stadium: {
    features: [
      { value: 'Stadion Tivoli', label: 'Lokacija', description: 'Veli Vrh, Pula — na mjestu bivšeg kamenoloma' },
      { value: '100m × 64m', label: 'Dimenzije', description: 'Glavni teren' },
      { value: '200 gledatelja', label: 'Kapacitet', description: 'Sjedeća mjesta' },
    ],
    facilities: [
      'Glavni teren — u obnovi, nova umjetna trava i navodnjavanje',
      'Nove tribine pristupačne osobama s invaliditetom',
      'Dva pomoćna terena 40×20 m s umjetnom travom',
      'Svlačionice za domaće i gostujuće ekipe',
      'Prostor za suce i delegata',
    ],
  },
}

export interface TextPart {
  text: string
  bold: boolean
}

// "a **b** c" → [{a}, {b, bold}, {c}]; nezatvoreni ** ostaje običan tekst
export function splitBold(text: string): TextPart[] {
  const parts: TextPart[] = []
  const re = /\*\*(.+?)\*\*/g
  let last = 0
  for (const match of text.matchAll(re)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), bold: false })
    parts.push({ text: match[1], bold: true })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last), bold: false })
  return parts
}

// Odlučuje smije li se vrijednost iz baze prikazati umjesto zadanog sadržaja.
// remote dolazi iz jsonb stupca pa može biti bilo što (null, stari oblik, ručno uređen JSON).
export function resolveContent<K extends ContentKey>(
  key: K,
  remote: unknown,
  fallback: SiteContent[K] = defaultContent[key],
): SiteContent[K] {
  if (typeof remote !== 'object' || remote === null || Array.isArray(remote)) return fallback
  const source = remote as Record<string, unknown>
  const result = { ...fallback } as Record<string, unknown>
  for (const [field, fallbackValue] of Object.entries(fallback)) {
    const value = source[field]
    const sameType = Array.isArray(fallbackValue) ? Array.isArray(value) : typeof value === typeof fallbackValue
    if (sameType) result[field] = value
  }
  return result as SiteContent[K]
}
