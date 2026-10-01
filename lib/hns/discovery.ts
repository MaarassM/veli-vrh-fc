// Otkrivanje sezone i ID-eva natjecanja preko javnih Semafor JSON handlera —
// nova sezona radi bez ručnog ažuriranja cid-ova.
import { SEMAFOR_BASE, fetchJson } from './fetch.js'
import type { CompetitionInfo } from './types.js'

export const ACAT_TO_CATEGORY: Record<string, string> = {
  'Seniors': 'seniori',
  'Juniors': 'juniori',
  'Pioneers': 'pioniri',
  'Young pioneers': 'mladi-pioniri',
  'Young pioneers (mix)': 'u-11',
  'Pre-beginners': 'u-9',
  'Veterans': 'veterani',
}

// HNS ponekad obje pionirske lige vodi pod acat "Pioneers" (npr. 26/27), pa bi
// mlađi pioniri završili u istoj kategoriji kao pioniri. Naziv natjecanja je točniji.
export function categoryFor(acat: string, name: string): string | null {
  if (/MLA(Đ|DJ|D)I\s+PIONIRI/i.test(name)) return 'mladi-pioniri'
  return ACAT_TO_CATEGORY[acat] ?? null
}

// Sezona počinje u srpnju: 2026-07 → "2026/2027"
export function currentSeason(now: Date): string {
  const y = now.getFullYear()
  return now.getMonth() >= 6 ? `${y}/${y + 1}` : `${y - 1}/${y}`
}

// Ljeti nova sezona na Semaforu još ne postoji — treba korak natrag
export function previousSeason(season: string): string {
  const y = parseInt(season.split('/')[0], 10)
  return `${y - 1}/${y}`
}

export async function discoverCompetitions(
  clubId: number,
  season: string,
  fetchJsonImpl: typeof fetchJson = fetchJson,
): Promise<CompetitionInfo[]> {
  const ts = Date.now()
  const seasonEnc = encodeURIComponent(season)
  const agecats = await fetchJsonImpl<Array<{ id: string }>>(
    `${SEMAFOR_BASE}/handlers/getAgeCategories/?season=${seasonEnc}&t=${ts}&lang=hr&clubID=${clubId}`
  )
  const out: CompetitionInfo[] = []
  for (const { id: acat } of agecats) {
    if (!ACAT_TO_CATEGORY[acat]) continue
    const comps = await fetchJsonImpl<Array<{ id: number; value: string }>>(
      `${SEMAFOR_BASE}/handlers/getCompetitions/?season=${seasonEnc}&acat=${encodeURIComponent(acat)}&t=${ts}&lang=hr&clubID=${clubId}&linkType=club_profile&linkConstructor=/x`
    )
    for (const c of comps) {
      const category = categoryFor(acat, c.value)
      if (!category) continue
      out.push({
        cid: c.id,
        name: c.value,
        season,
        acat,
        category,
        isCup: /\bKUP\b/i.test(c.value),
      })
    }
  }
  return out
}
