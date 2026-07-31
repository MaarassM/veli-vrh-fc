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

// Sezona počinje u srpnju: 2026-07 → "2026/2027"
export function currentSeason(now: Date): string {
  const y = now.getFullYear()
  return now.getMonth() >= 6 ? `${y}/${y + 1}` : `${y - 1}/${y}`
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
    const category = ACAT_TO_CATEGORY[acat]
    if (!category) continue
    const comps = await fetchJsonImpl<Array<{ id: number; value: string }>>(
      `${SEMAFOR_BASE}/handlers/getCompetitions/?season=${seasonEnc}&acat=${encodeURIComponent(acat)}&t=${ts}&lang=hr&clubID=${clubId}&linkType=club_profile&linkConstructor=/x`
    )
    for (const c of comps) {
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
