import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

interface PlayerData {
  ime: string
  prezime: string
  broj_dresa: number
  pozicija: string
}

async function main() {
  console.log('🌱 Starting simple database seed...')

  // Open database connection
  const dbPath = path.join(projectRoot, 'dev.db')
  const db = new Database(dbPath)

  // Read player data from JSON file
  const playersFilePath = path.join(__dirname, 'players-simple.json')
  const playersJson = fs.readFileSync(playersFilePath, 'utf-8')
  const data = JSON.parse(playersJson)
  const playersData: PlayerData[] = data.igraci

  console.log(`📋 Found ${playersData.length} players for ${data.klub}`)

  // Clear existing players
  console.log('🗑️  Clearing existing players...')
  db.prepare('DELETE FROM players').run()

  // Prepare insert statement
  const insertStmt = db.prepare(`
    INSERT INTO players (
      id, firstName, lastName, number, position,
      isActive, createdAt, updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `)

  // Insert players
  console.log('➕ Inserting players...')
  let successCount = 0
  let errorCount = 0

  for (const playerData of playersData) {
    try {
      const now = new Date().toISOString()
      insertStmt.run(
        crypto.randomUUID(),
        playerData.ime,
        playerData.prezime,
        playerData.broj_dresa,
        playerData.pozicija,
        1, // isActive
        now,
        now
      )
      successCount++
      console.log(`  ✓ ${playerData.ime} ${playerData.prezime} (#${playerData.broj_dresa} - ${playerData.pozicija})`)
    } catch (error) {
      errorCount++
      console.error(`  ✗ Failed to insert ${playerData.ime} ${playerData.prezime}:`, error)
    }
  }

  db.close()

  console.log('\n✅ Seed completed!')
  console.log(`  Success: ${successCount}`)
  console.log(`  Errors: ${errorCount}`)
  console.log('\n📊 Statistike, ljestvica i utakmice se dohvaćaju uživo s HNS Semafora!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
