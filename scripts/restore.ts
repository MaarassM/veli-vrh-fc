// Vraćanje podataka iz sigurnosne kopije (scripts/backup.ts).
// Pokretanje: npx tsx scripts/restore.ts <tablica|sve> [direktorij]
// Traži potvrdu jer briše postojeće redove prije upisa.
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline/promises'

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

const CHUNK = 500

async function restoreTable(baseUrl: string, key: string, table: string, dir: string) {
  const file = join(dir, `${table}.json`)
  if (!existsSync(file)) {
    console.log(`  ${table}: preskočeno (nema datoteke)`)
    return
  }
  const rows = JSON.parse(readFileSync(file, 'utf-8')) as Record<string, unknown>[]
  if (rows.length === 0) {
    console.log(`  ${table}: prazno u kopiji, ništa se ne mijenja`)
    return
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates',
  }

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const res = await fetch(`${baseUrl}/rest/v1/${table}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(chunk),
    })
    if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`)
  }
  console.log(`  ${table}: vraćeno ${rows.length} redova`)
}

async function main() {
  const baseUrl = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!baseUrl || !key) throw new Error('Nedostaje SUPABASE_URL ili SUPABASE_SERVICE_KEY')

  const target = process.argv[2]
  const dir = process.argv[3] ?? 'backups/data'
  if (!target) throw new Error('Reci što vraćam: npx tsx scripts/restore.ts <tablica|sve>')

  const tables = target === 'sve' ? [...TABLES] : [target]
  const unknown = tables.filter(t => !TABLES.includes(t as (typeof TABLES)[number]))
  if (unknown.length > 0) throw new Error(`Nepoznata tablica: ${unknown.join(', ')}`)

  const meta = join(dir, '_meta.json')
  if (existsSync(meta)) {
    const { createdAt } = JSON.parse(readFileSync(meta, 'utf-8')) as { createdAt: string }
    console.log(`Kopija napravljena: ${createdAt}`)
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(
    `Vraćam ${tables.join(', ')} iz "${dir}" i prepisujem postojeće redove. Nastaviti? (da/ne) `,
  )
  rl.close()
  if (answer.trim().toLowerCase() !== 'da') {
    console.log('Prekinuto.')
    return
  }

  for (const table of tables) await restoreTable(baseUrl, key, table, dir)
  console.log('Gotovo.')
}

main().catch(err => {
  console.error('Vraćanje nije uspjelo:', err instanceof Error ? err.message : err)
  process.exit(1)
})
