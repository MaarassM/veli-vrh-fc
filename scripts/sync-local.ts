// Lokalno pokretanje HNS synca protiv Supabase-a: npm run sync:local
import 'dotenv/config'
import { runSync } from '../lib/hns/sync-core.js'

runSync()
  .then(r => {
    console.log(JSON.stringify(r, null, 2))
    process.exit(r.errors.length ? 1 : 0)
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
