// Generira seed za supabase/migrations/2026-10-01-admin-content.sql iz trenutnog statičnog sadržaja.
// Pokretanje: npx tsx scripts/gen-content-seed.ts
import { staffMembers } from '../src/data/staff'
import { timelineEvents } from '../src/data/timeline'
import { defaultContent } from '../src/lib/content'

const q = (v: string | number | null) =>
  v === null ? 'NULL' : typeof v === 'number' ? String(v) : `'${v.replace(/'/g, "''")}'`

const lines: string[] = []

lines.push('INSERT INTO staff (first_name, last_name, role, image_url, since, sort_order) VALUES')
lines.push(
  staffMembers
    .map((m, i) => `  (${[m.firstName, m.lastName, m.role, m.image, m.since].map(q).join(', ')}, ${i + 1})`)
    .join(',\n') + ';',
)

lines.push('', 'INSERT INTO timeline_events (year, title, description, category, sort_order) VALUES')
lines.push(
  timelineEvents
    .map((e, i) => `  (${e.year}, ${q(e.title)}, ${q(e.description)}, ${q(e.category)}, ${i + 1})`)
    .join(',\n') + ';',
)

lines.push('', 'INSERT INTO site_content (key, value) VALUES')
lines.push(
  Object.entries(defaultContent)
    .map(([key, value]) => `  (${q(key)}, ${q(JSON.stringify(value))}::jsonb)`)
    .join(',\n') + '\nON CONFLICT (key) DO NOTHING;',
)

console.log(lines.join('\n'))
