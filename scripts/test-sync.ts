// Test skripta za provjeru sync logike
// Pokretanje: npx tsx scripts/test-sync.ts

import * as dotenv from 'dotenv'
dotenv.config()

import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
const VELI_VRH_ID = '1546'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testScrape() {
  console.log('\n1. Scraping HNS...')
  const response = await fetch('https://semafor.hns.family/klubovi/1546/nk-veli-vrh/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NK-Veli-Vrh-Bot/1.0)' }
  })
  const html = await response.text()
  const $ = cheerio.load(html)

  // Players
  const players: any[] = []
  $('div.playerslist.withStats li.row').each((_, row) => {
    const $row = $(row)
    const number = parseInt($row.find('.shirtNumber').text().trim()) || 0
    const fullName = $row.find('.playerName h3 a').text().trim()
    const nameParts = fullName.split(' ')
    const playerNameEl = $row.find('.playerName').clone()
    playerNameEl.find('h3').remove()
    const position = playerNameEl.text().trim()
    const appearances = parseInt($row.find('.apps').text().trim()) || 0
    const $goalsSpan = $row.find('.goals span')
    const goals = $goalsSpan.hasClass('conceded') ? 0 : parseInt($goalsSpan.text().trim()) || 0
    const cardsText = $row.find('.cards').text().trim()
    const cardsParts = cardsText.split('/')
    const yellow_cards = parseInt(cardsParts[0]?.trim()) || 0
    const red_cards = parseInt(cardsParts[1]?.trim()) || 0
    const image_url = $row.find('.playerPhoto img').attr('data-url') || ''
    if (fullName && number > 0) {
      players.push({ first_name: nameParts[0], last_name: nameParts.slice(1).join(' '), number, position, goals, assists: 0, appearances, yellow_cards, red_cards, image_url })
    }
  })

  // Standings
  const standings: any[] = []
  $('div.competition_table.type1 li.row[data-clubid]').each((_, row) => {
    const $row = $(row)
    const position = parseInt($row.find('.position').text().trim()) || 0
    const $clubEl = $row.find('.club a').clone()
    $clubEl.find('div').remove()
    const team = $clubEl.text().trim()
    const played = parseInt($row.find('.played').text().trim()) || 0
    const wins = parseInt($row.find('.wins').text().trim()) || 0
    const draws = parseInt($row.find('.draws').text().trim()) || 0
    const losses = parseInt($row.find('.losses').text().trim()) || 0
    const goals_for = parseInt($row.find('.gplus').text().trim()) || 0
    const goals_against = parseInt($row.find('.gminus').text().trim()) || 0
    const goal_difference = parseInt($row.find('.gdiff').text().trim()) || (goals_for - goals_against)
    const points = parseInt($row.find('.points').text().trim()) || 0
    if (team && position > 0) standings.push({ position, team, played, wins, draws, losses, goals_for, goals_against, goal_difference, points })
  })

  // Matches
  const matches: any[] = []
  $('div.matchlist li.row[data-match]').each((_, row) => {
    const $row = $(row)
    const matchId = $row.attr('data-match') || ''
    const dateText = $row.find('.date').text().trim()
    let date = dateText
    try {
      const datePart = dateText.split(' ')[0].replace(/\.$/, '')
      const parts = datePart.split('.')
      if (parts.length === 3) date = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
    } catch (_) {}
    const club1Id = $row.find('.club1').attr('data-id') || ''
    const $club1 = $row.find('.club1 a').clone(); $club1.find('div').remove()
    const $club2 = $row.find('.club2 a').clone(); $club2.find('div').remove()
    const home_team = $club1.text().trim()
    const away_team = $club2.text().trim()
    const isVeliVrhHome = club1Id === VELI_VRH_ID
    const opponent = isVeliVrhHome ? away_team : home_team
    const venue = isVeliVrhHome ? 'home' : 'away'
    const res1 = $row.find('.res1').text().trim()
    const res2 = $row.find('.res2').text().trim()
    const isPlayed = res1 !== '-' && res2 !== '-'
    const home_score = isPlayed ? (parseInt(res1) || 0) : null
    const away_score = isPlayed ? (parseInt(res2) || 0) : null
    const status = isPlayed ? 'played' : 'upcoming'
    const competition = $row.find('.competitionround').text().split(',')[0].trim() || 'ELITNA LIGA NSŽI'
    if (matchId) matches.push({ id: matchId, date, opponent, home_team, away_team, home_score, away_score, competition, status, venue })
  })

  console.log(`\n   Igraci (${players.length}):`)
  players.slice(0, 3).forEach(p => console.log(`     ${p.number}. ${p.first_name} ${p.last_name} (${p.position}) — ${p.goals} gol, ${p.appearances} nastupa`))

  console.log(`\n   Ljestvica (${standings.length}):`)
  standings.slice(0, 3).forEach(s => console.log(`     ${s.position}. ${s.team} — ${s.points} bod (${s.wins}/${s.draws}/${s.losses})`))

  console.log(`\n   Utakmice (${matches.length}):`)
  matches.slice(0, 3).forEach(m => console.log(`     ${m.date}: ${m.home_team} vs ${m.away_team} ${m.home_score !== null ? `${m.home_score}:${m.away_score}` : '-'} [${m.status}]`))

  return { players, standings, matches }
}

async function testFullSync(players: any[], standings: any[], matches: any[]) {
  console.log('\n2. Upis u Supabase...')

  // Brisanje i ubacivanje
  await supabaseAdmin.from('players').delete().neq('id', 0)
  await supabaseAdmin.from('standings').delete().neq('id', 0)
  await supabaseAdmin.from('matches').delete().neq('id', '')

  if (players.length > 0) {
    const { error } = await supabaseAdmin.from('players').insert(players)
    if (error) { console.error('   ❌ Players insert error:', error.message); return }
  }
  if (standings.length > 0) {
    const { error } = await supabaseAdmin.from('standings').insert(standings)
    if (error) { console.error('   ❌ Standings insert error:', error.message); return }
  }
  if (matches.length > 0) {
    const { error } = await supabaseAdmin.from('matches').insert(matches)
    if (error) { console.error('   ❌ Matches insert error:', error.message); return }
  }

  console.log(`   ✅ Upisano: ${players.length} igraca, ${standings.length} timova, ${matches.length} utakmica`)

  // Provjera citanja
  const { data: pData } = await supabaseAdmin.from('players').select('count').single()
  const { data: sData } = await supabaseAdmin.from('standings').select('count').single()
  const { data: mData } = await supabaseAdmin.from('matches').select('count').single()
  console.log(`   ✅ Baza sadrzi: ${(pData as any)?.count} igraca, ${(sData as any)?.count} timova, ${(mData as any)?.count} utakmica`)
}

async function main() {
  console.log('=== NK Veli Vrh - Full Sync Test ===')
  try {
    const { players, standings, matches } = await testScrape()
    await testFullSync(players, standings, matches)
    console.log('\n✅ Sve OK! Baza je popunjena s podacima s HNS-a.')
  } catch (e) {
    console.error('\n❌ Greška:', e)
  }
}

main()
