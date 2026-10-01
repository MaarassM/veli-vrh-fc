// Dnevna sigurnosna kopija Supabase podataka u JSON datoteke.
// Supabase free nema backup — git povijest grane "backups" je naša vremenska mašina.
// Pokretanje: npx tsx scripts/backup.ts [izlazni-direktorij]
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const TABLES = [
  'competitions',
  'standings',
  'players',
  'matches',
  'scorers',
  'match_details',
  'match_lineups',
  'match_events',
  'sponsors',
  'albums',
  'gallery_items',
] as const

// sync_log i push_subscriptions namjerno preskačemo: log je samo dijagnostika,
// a pretplate su osobni podaci koji ne trebaju završiti u gitu.

const PAGE_SIZE = 1000

async function fetchTable(baseUrl: string, key: string, table: string): Promise<unknown[]> {
  const rows: unknown[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*&order=id.asc`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Range: `${from}-${from + PAGE_SIZE - 1}`,
      },
    })
    if (!res.ok) {
      // tablice bez stupca "id" (npr. match_lineups) sortiramo bez order klauzule
      const retry = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Range: `${from}-${from + PAGE_SIZE - 1}`,
        },
      })
      if (!retry.ok) throw new Error(`${table}: HTTP ${retry.status} ${await retry.text()}`)
      const page = (await retry.json()) as unknown[]
      rows.push(...page)
      if (page.length < PAGE_SIZE) break
      continue
    }
    const page = (await res.json()) as unknown[]
    rows.push(...page)
    if (page.length < PAGE_SIZE) break
  }
  return rows
}

// Stabilan poredak ključeva i redova → mali, čitljivi git diffovi
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, stable(v)]),
    )
  }
  return value
}

async function main() {
  const baseUrl = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!baseUrl || !key) throw new Error('Nedostaje SUPABASE_URL ili SUPABASE_SERVICE_KEY')

  const outDir = process.argv[2] ?? 'backups/data'
  mkdirSync(outDir, { recursive: true })

  const summary: Record<string, number> = {}
  for (const table of TABLES) {
    const rows = await fetchTable(baseUrl, key, table)
    const sorted = [...rows].sort((a, b) =>
      JSON.stringify(stable(a)).localeCompare(JSON.stringify(stable(b))),
    )
    writeFileSync(join(outDir, `${table}.json`), JSON.stringify(stable(sorted), null, 2) + '\n')
    summary[table] = rows.length
    console.log(`  ${table}: ${rows.length}`)
  }

  writeFileSync(
    join(outDir, '_meta.json'),
    JSON.stringify({ createdAt: new Date().toISOString(), counts: summary }, null, 2) + '\n',
  )
  const total = Object.values(summary).reduce((a, b) => a + b, 0)
  console.log(`Ukupno ${total} redova u ${TABLES.length} tablica.`)
}

main().catch(err => {
  console.error('Backup nije uspio:', err instanceof Error ? err.message : err)
  process.exit(1)
})
