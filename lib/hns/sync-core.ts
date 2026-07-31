// Orkestracija HNS synca: discovery → stranice natjecanja → roster → detalji utakmica.
// Pisanje u Supabase je "guarded": briše se samo kad postoje novi redovi za zamjenu.
import { supabaseAdmin } from '../supabase.js'
import { SEMAFOR_BASE, fetchHtml, sleep } from './fetch.js'
import { currentSeason, previousSeason, discoverCompetitions } from './discovery.js'
import { parseCompetitionPage, parseClubRoster, parseMatchDetail } from './parsers.js'
import type { CompetitionInfo } from './types.js'

const CLUB_ID = 1546
const CLUB_SLUG = 'nk-veli-vrh'
const REQUEST_DELAY_MS = 300
const MAX_MATCH_DETAILS_PER_RUN = 5

export interface SyncResult {
  season: string
  counts: {
    competitions: number
    standings: number
    matches: number
    scorers: number
    players: number
    matchDetails: number
  }
  errors: string[]
}

async function getCompetitions(season: string, errors: string[]): Promise<CompetitionInfo[]> {
  try {
    const discovered = await discoverCompetitions(CLUB_ID, season)
    if (discovered.length > 0) return discovered
    errors.push('discovery: empty result, falling back to stored competitions')
  } catch (err) {
    errors.push(`discovery: ${err instanceof Error ? err.message : String(err)}`)
  }
  // Fallback: natjecanja spremljena u prošlom uspješnom syncu
  const { data } = await supabaseAdmin
    .from('competitions')
    .select('*')
    .eq('season', season)
  return (data ?? []).map(c => ({
    cid: c.id,
    name: c.name,
    season: c.season,
    acat: c.acat,
    category: c.category,
    isCup: c.is_cup,
  }))
}

async function syncCompetition(
  comp: CompetitionInfo,
  counts: SyncResult['counts'],
): Promise<void> {
  const html = await fetchHtml(`${SEMAFOR_BASE}/natjecanja/${comp.cid}/x/`)
  const { standingsParts, matches, scorers } = parseCompetitionPage(html)

  if (standingsParts.length > 0) {
    await supabaseAdmin
      .from('standings')
      .delete()
      .eq('competition_id', comp.cid)
      .eq('season', comp.season)
    // Stari redovi bez competition_id (iz prijašnjeg synca) za istu kategoriju
    await supabaseAdmin
      .from('standings')
      .delete()
      .eq('category', comp.category)
      .is('competition_id', null)
    const rows = standingsParts.map(s => ({
      position: s.position,
      team: s.team,
      played: s.played,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      goals_for: s.goalsFor,
      goals_against: s.goalsAgainst,
      goal_difference: s.goalDifference,
      points: s.points,
      category: comp.category,
      season: comp.season,
      competition_id: comp.cid,
      part: s.part,
      form: s.form,
      club_id: s.clubId,
      logo_url: s.logoUrl,
    }))
    const { error } = await supabaseAdmin.from('standings').insert(rows)
    if (error) throw new Error(`standings insert: ${error.message}`)
    counts.standings += rows.length
  }

  if (matches.length > 0) {
    const rows = matches.map(m => {
      const isVeliVrh = m.homeClubId === CLUB_ID || m.awayClubId === CLUB_ID
      const isHome = m.homeClubId === CLUB_ID
      return {
        id: String(m.matchId),
        date: m.date,
        opponent: isVeliVrh ? (isHome ? m.awayTeam : m.homeTeam) : '',
        home_team: m.homeTeam,
        away_team: m.awayTeam,
        home_score: m.homeScore,
        away_score: m.awayScore,
        competition: comp.name,
        status: m.status,
        venue: isVeliVrh ? (isHome ? 'home' : 'away') : null,
        category: comp.category,
        season: comp.season,
        competition_id: comp.cid,
        round: m.round,
        time: m.time,
        part: m.part,
        is_veli_vrh: isVeliVrh,
        home_club_id: m.homeClubId,
        away_club_id: m.awayClubId,
        home_logo_url: m.homeLogoUrl,
        away_logo_url: m.awayLogoUrl,
      }
    })
    const { error } = await supabaseAdmin.from('matches').upsert(rows, { onConflict: 'id' })
    if (error) throw new Error(`matches upsert: ${error.message}`)
    counts.matches += rows.length
  }

  if (scorers.length > 0) {
    await supabaseAdmin
      .from('scorers')
      .delete()
      .eq('competition_id', comp.cid)
      .eq('season', comp.season)
    const rows = scorers.map(s => ({
      competition_id: comp.cid,
      season: comp.season,
      person_id: s.personId,
      position: s.position,
      name: s.name,
      club: s.club,
      goals: s.goals,
      photo_url: s.photoUrl,
      player_url: s.playerUrl,
    }))
    const { error } = await supabaseAdmin.from('scorers').insert(rows)
    if (error) throw new Error(`scorers insert: ${error.message}`)
    counts.scorers += rows.length
  }
}

async function syncRoster(
  comp: CompetitionInfo,
  counts: SyncResult['counts'],
): Promise<void> {
  const html = await fetchHtml(
    `${SEMAFOR_BASE}/klubovi/${CLUB_ID}/${CLUB_SLUG}/?cid=${comp.cid}`
  )
  const roster = parseClubRoster(html)
  if (roster.length === 0) return

  await supabaseAdmin
    .from('players')
    .delete()
    .eq('category', comp.category)
    .eq('season', comp.season)
  const rows = roster.map(p => ({
    first_name: p.firstName,
    last_name: p.lastName,
    number: p.number,
    position: p.position,
    goals: p.goals,
    assists: 0,
    appearances: p.appearances,
    yellow_cards: p.yellowCards,
    red_cards: p.redCards,
    image_url: p.imageUrl,
    category: comp.category,
    season: comp.season,
  }))
  const { error } = await supabaseAdmin.from('players').insert(rows)
  if (error) throw new Error(`players insert: ${error.message}`)
  counts.players += rows.length
}

async function syncMatchDetails(
  season: string,
  counts: SyncResult['counts'],
  errors: string[],
): Promise<void> {
  const { data: played } = await supabaseAdmin
    .from('matches')
    .select('id')
    .eq('is_veli_vrh', true)
    .eq('status', 'played')
    .eq('season', season)
    .order('date', { ascending: false })
    .limit(50)
  const playedIds = (played ?? []).map(m => Number(m.id)).filter(Number.isFinite)
  if (playedIds.length === 0) return

  const { data: existing } = await supabaseAdmin
    .from('match_details')
    .select('match_id')
    .in('match_id', playedIds)
  const have = new Set((existing ?? []).map(d => d.match_id))
  const missing = playedIds.filter(id => !have.has(id)).slice(0, MAX_MATCH_DETAILS_PER_RUN)

  for (const matchId of missing) {
    try {
      await sleep(REQUEST_DELAY_MS)
      const html = await fetchHtml(`${SEMAFOR_BASE}/utakmice/${matchId}/x/`)
      const d = parseMatchDetail(html)

      const { error: dErr } = await supabaseAdmin.from('match_details').upsert(
        {
          match_id: matchId,
          home_team: d.homeTeam,
          away_team: d.awayTeam,
          home_score: d.homeScore,
          away_score: d.awayScore,
          status: d.status,
          venue: d.venue,
          kickoff_at: d.kickoffAt,
          attendance: d.attendance,
          referees: d.referees,
          scraped_at: new Date().toISOString(),
        },
        { onConflict: 'match_id' }
      )
      if (dErr) throw new Error(`match_details upsert: ${dErr.message}`)

      if (d.lineups.length > 0) {
        await supabaseAdmin.from('match_lineups').delete().eq('match_id', matchId)
        const { error } = await supabaseAdmin.from('match_lineups').insert(
          d.lineups.map(l => ({
            match_id: matchId,
            person_id: l.personId,
            team: l.team,
            team_name: l.teamName,
            number: l.number,
            name: l.name,
            is_captain: l.isCaptain,
            position: l.position,
            photo_url: l.photoUrl,
          }))
        )
        if (error) throw new Error(`match_lineups insert: ${error.message}`)
      }

      if (d.events.length > 0) {
        await supabaseAdmin.from('match_events').delete().eq('match_id', matchId)
        const { error } = await supabaseAdmin.from('match_events').insert(
          d.events.map(e => ({
            match_id: matchId,
            person_id: e.personId,
            player_name: e.playerName,
            team: e.team,
            minute: e.minute,
            type: e.type,
            label: e.label,
          }))
        )
        if (error) throw new Error(`match_events insert: ${error.message}`)
      }

      counts.matchDetails += 1
    } catch (err) {
      errors.push(`match ${matchId}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}

export async function runSync(): Promise<SyncResult> {
  let season = currentSeason(new Date())
  const counts: SyncResult['counts'] = {
    competitions: 0,
    standings: 0,
    matches: 0,
    scorers: 0,
    players: 0,
    matchDetails: 0,
  }
  const errors: string[] = []

  // Nova sezona ljeti još nema natjecanja na Semaforu — tada nastavljamo prošlu.
  // Greške prvog pokušaja gutamo samo ako fallback uspije.
  const firstAttemptErrors: string[] = []
  let competitions = await getCompetitions(season, firstAttemptErrors)
  if (competitions.length === 0) {
    season = previousSeason(season)
    console.log(`[sync] no competitions for new season, falling back to ${season}`)
    competitions = await getCompetitions(season, errors)
  } else {
    errors.push(...firstAttemptErrors)
  }
  if (competitions.length === 0) {
    throw new Error('No competitions available (discovery failed and no stored fallback)')
  }

  const { error: compErr } = await supabaseAdmin.from('competitions').upsert(
    competitions.map(c => ({
      id: c.cid,
      name: c.name,
      season: c.season,
      acat: c.acat,
      category: c.category,
      is_cup: c.isCup,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: 'id' }
  )
  if (compErr) errors.push(`competitions upsert: ${compErr.message}`)
  counts.competitions = competitions.length

  for (const comp of competitions) {
    try {
      await sleep(REQUEST_DELAY_MS)
      console.log(`[sync] competition ${comp.cid} (${comp.name})`)
      await syncCompetition(comp, counts)
    } catch (err) {
      errors.push(`${comp.name}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // Roster po kategoriji — kup preskačemo (ista klupska stranica kao liga)
  for (const comp of competitions.filter(c => !c.isCup)) {
    try {
      await sleep(REQUEST_DELAY_MS)
      console.log(`[sync] roster ${comp.category}`)
      await syncRoster(comp, counts)
    } catch (err) {
      errors.push(`roster ${comp.category}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  await syncMatchDetails(season, counts, errors)

  await supabaseAdmin.from('sync_log').insert({
    players_count: counts.players,
    standings_count: counts.standings,
    matches_count: counts.matches,
    success: errors.length === 0,
    error_message: errors.length > 0 ? errors.join(' | ') : null,
  })

  return { season, counts, errors }
}
