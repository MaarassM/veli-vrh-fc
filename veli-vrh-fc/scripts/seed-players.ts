import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

interface PlayerData {
  hnsId: string
  firstName: string
  lastName: string
  fullName: string
  number: number
  position: string
  nationality?: string
  dateOfBirth?: string
  placeOfBirth?: string
  height?: number
  weight?: number
  preferredFoot?: string
  isCaptain?: boolean
  goals?: number
  assists?: number
  appearances?: number
  minutesPlayed?: number
  yellowCards?: number
  redCards?: number
  imageUrl?: string
  profileUrl: string
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Open database connection
  const dbPath = path.join(projectRoot, 'dev.db')
  const db = new Database(dbPath)

  // Read player data from JSON file
  const playersFilePath = path.join(__dirname, 'players-data.json')
  const playersJson = fs.readFileSync(playersFilePath, 'utf-8')
  const playersData: PlayerData[] = JSON.parse(playersJson)

  console.log(`📋 Found ${playersData.length} players in JSON file`)

  // Clear existing players
  console.log('🗑️  Clearing existing players...')
  db.prepare('DELETE FROM players').run()

  // Prepare insert statement
  const insertStmt = db.prepare(`
    INSERT INTO players (
      id, hnsId, firstName, lastName, fullName, number, position,
      nationality, dateOfBirth, placeOfBirth, height, weight, preferredFoot,
      isCaptain, goals, assists, appearances, minutesPlayed, yellowCards, redCards,
      imageUrl, imageLocal, profileUrl, createdAt, updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
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
        playerData.hnsId,
        playerData.firstName,
        playerData.lastName,
        playerData.fullName,
        playerData.number,
        playerData.position,
        playerData.nationality || 'Croatian',
        playerData.dateOfBirth || null,
        playerData.placeOfBirth || null,
        playerData.height || null,
        playerData.weight || null,
        playerData.preferredFoot || null,
        playerData.isCaptain ? 1 : 0,
        playerData.goals || 0,
        playerData.assists || 0,
        playerData.appearances || 0,
        playerData.minutesPlayed || 0,
        playerData.yellowCards || 0,
        playerData.redCards || 0,
        playerData.imageUrl || null,
        null, // imageLocal
        playerData.profileUrl,
        now,
        now
      )
      successCount++
      console.log(`  ✓ ${playerData.fullName} (${playerData.position})`)
    } catch (error) {
      errorCount++
      console.error(`  ✗ Failed to insert ${playerData.fullName}:`, error)
    }
  }

  db.close()

  console.log('\n✅ Seed completed!')
  console.log(`  Success: ${successCount}`)
  console.log(`  Errors: ${errorCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
