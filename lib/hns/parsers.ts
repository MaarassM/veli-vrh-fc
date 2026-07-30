// Čisti parseri za HNS Semafor HTML — bez IO-a, testirani na stvarnim fixture-ima
import * as cheerio from 'cheerio'
import type {
  ParsedCompetitionPage,
  ParsedStanding,
  ParsedMatch,
  ParsedScorer,
  ParsedMatchDetail,
  ParsedLineupPlayer,
  ParsedMatchEvent,
  ParsedRosterPlayer,
} from './types.js'

export function parseCompetitionPage(html: string): ParsedCompetitionPage {
  const $ = cheerio.load(html)
  // Tablice dijelova lige su IZVAN ovog bloka; utakmice i strijelci su UNUTAR njega.
  const $scope = $('div.competition_results_scorers_cards').first()

  // Oznaka dijela lige: tab pane (div[id^="tabContent"]) ↔ .tabs li[data-content] > span
  const partLabel = (el: ReturnType<typeof $>): string => {
    const pane = el.closest('div[id^="tabContent"]')
    if (!pane.length) return ''
    const paneId = pane.attr('id')!
    return $(`.tabs li[data-content="${paneId}"] span`).first().text().trim()
  }

  const standingsParts: ParsedStanding[] = []
  $('div.competition_table.type1').each((_, tableEl) => {
    const $table = $(tableEl)
    const part = partLabel($table)
    $table.find('li.row[data-clubid]').each((_, rowEl) => {
      const $row = $(rowEl)
      const href = $row.find('.club a').attr('href') || ''
      const idMatch = href.match(/\/klubovi\/(\d+)\//)
      const $club = $row.find('.club a').clone()
      $club.find('div').remove()
      const form = $row
        .find('.form div')
        .toArray()
        .map(d => ($(d).attr('class') || '').replace('form', ''))
        .filter(c => c === 'W' || c === 'D' || c === 'L')
        .join('')
      standingsParts.push({
        part,
        position: parseInt($row.find('.position').text().trim()) || 0,
        clubId: idMatch ? parseInt(idMatch[1]) : null,
        team: $club.text().trim(),
        logoUrl: $row.find('.club img').attr('src') || '',
        played: parseInt($row.find('.played').text().trim()) || 0,
        wins: parseInt($row.find('.wins').text().trim()) || 0,
        draws: parseInt($row.find('.draws').text().trim()) || 0,
        losses: parseInt($row.find('.losses').text().trim()) || 0,
        goalsFor: parseInt($row.find('.gplus').text().trim()) || 0,
        goalsAgainst: parseInt($row.find('.gminus').text().trim()) || 0,
        // gdiff može biti negativan ("-8") — parseInt razumije minus, skidamo samo "+"
        goalDifference: parseInt($row.find('.gdiff').text().trim().replace('+', '')) || 0,
        points: parseInt($row.find('.points').text().trim()) || 0,
        form,
      })
    })
  })

  // Utakmice: svaki tab pane unutar scope-a ima current_results s matchlistom
  const matches: ParsedMatch[] = []
  const seenMatchIds = new Set<number>()
  $scope.find('div.current_results').each((_, resEl) => {
    const $res = $(resEl)
    const part = partLabel($res)
    $res.find('div.matchlist li.row[data-match]').each((_, rowEl) => {
      const $row = $(rowEl)
      const matchId = parseInt($row.attr('data-match') || '') || 0
      const round = parseInt($row.attr('data-round') || '0') || 0
      // datum: "06.09.2025. 17:30"
      const dateText = $row.find('.date').first().text().trim()
      const dm = dateText.match(/(\d{2})\.(\d{2})\.(\d{4})\.?(?:\s+(\d{2}:\d{2}))?/)
      const date = dm ? `${dm[3]}-${dm[2]}-${dm[1]}` : null
      const time = dm?.[4] ?? null
      const club = (sel: string) => {
        const $c = $row.find(sel)
        const id = parseInt($c.attr('data-id') || '') || null
        const $a = $c.find('a').first().clone()
        $a.find('div').remove()
        return { id, name: $a.text().trim(), logo: $c.find('img').attr('src') || '' }
      }
      const c1 = club('.club1')
      const c2 = club('.club2')
      const r1 = $row.find('.res1').first().text().trim()
      const r2 = $row.find('.res2').first().text().trim()
      const played = /^\d+$/.test(r1) && /^\d+$/.test(r2)
      if (!matchId || (!c1.name && !c2.name) || seenMatchIds.has(matchId)) return
      seenMatchIds.add(matchId)
      matches.push({
        matchId,
        round,
        part,
        date,
        time,
        homeClubId: c1.id,
        homeTeam: c1.name,
        homeLogoUrl: c1.logo,
        awayClubId: c2.id,
        awayTeam: c2.name,
        awayLogoUrl: c2.logo,
        homeScore: played ? parseInt(r1) : null,
        awayScore: played ? parseInt(r2) : null,
        status: played ? 'played' : 'upcoming',
      })
    })
  })

  // Strijelci: PRVA playerslist unutar scope-a = ligaški "Strijelci" top-5 tab.
  // (Druga/treća su Kartoni i Nastupi/minute; liste po klubovima su izvan scope-a.)
  const scorers: ParsedScorer[] = []
  $scope.find('div.playerslist').first().find('li.row[data-personid]').each((_, rowEl) => {
    const $row = $(rowEl)
    const goals = parseInt($row.find('.goals').first().text().trim())
    if (Number.isNaN(goals)) return
    const $name = $row.find('.playerName')
    const name = $name.find('h3 a').first().text().trim()
    const playerUrl = $name.find('h3 a').first().attr('href') || ''
    const $clone = $name.clone()
    $clone.find('h3').remove()
    scorers.push({
      personId: parseInt($row.attr('data-personid') || '') || 0,
      position: parseInt($row.find('.position').first().text().trim()) || 0,
      name,
      club: $clone.text().trim(),
      goals,
      photoUrl: $row.find('.playerPhoto img').attr('src') || '',
      playerUrl,
    })
  })
  scorers.sort((a, b) => b.goals - a.goals)

  return { standingsParts, matches, scorers }
}

// Roster s klupske stranice (/klubovi/{id}/{slug}/?cid={cid}) — lista igrača sa statistikama
export function parseClubRoster(html: string): ParsedRosterPlayer[] {
  const $ = cheerio.load(html)
  const roster: ParsedRosterPlayer[] = []

  $('div.playerslist.withStats li.row').each((_, rowEl) => {
    const $row = $(rowEl)
    const number = parseInt($row.find('.shirtNumber').text().trim()) || 0
    const fullName = $row.find('.playerName h3 a').text().trim()
    const nameParts = fullName.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const $nameEl = $row.find('.playerName').clone()
    $nameEl.find('h3').remove()
    const position = $nameEl.text().trim()

    const appearances = parseInt($row.find('.apps').text().trim()) || 0

    // vratari imaju primljene golove (span.conceded) umjesto zabijenih
    const $goalsSpan = $row.find('.goals span')
    const goals = $goalsSpan.hasClass('conceded')
      ? 0
      : parseInt($goalsSpan.text().trim()) || 0

    const cardsParts = $row.find('.cards').text().trim().split('/')
    const yellowCards = parseInt(cardsParts[0]?.trim()) || 0
    const redCards = parseInt(cardsParts[1]?.trim()) || 0

    const $img = $row.find('.playerPhoto img')
    const imageUrl = $img.attr('data-url') || $img.attr('src') || ''

    if (fullName && number > 0) {
      roster.push({
        firstName,
        lastName,
        number,
        position,
        appearances,
        goals,
        yellowCards,
        redCards,
        imageUrl,
      })
    }
  })

  return roster
}

export function parseMatchDetail(html: string): ParsedMatchDetail {
  const $ = cheerio.load(html)

  const homeTeam = $('.clubs .club1 .title').first().text().trim()
  const awayTeam = $('.clubs .club2 .title').first().text().trim()
  const homeLogoUrl = $('.clubs .club1 img').attr('src') || ''
  const awayLogoUrl = $('.clubs .club2 img').attr('src') || ''
  const r1 = $('.result .res1').first().text().trim()
  const r2 = $('.result .res2').first().text().trim()
  const played = /^\d+$/.test(r1) && /^\d+$/.test(r2)

  // facility: "Fortin, Štinjan, 26.10.2025. 10:30" → mjesto + početak
  const facility = $('.facility').first().text().trim()
  const fm = facility.match(/^(.*?),?\s*(\d{2})\.(\d{2})\.(\d{4})\.?\s+(\d{2}:\d{2})$/)
  const venue = fm ? fm[1].replace(/,\s*$/, '') : facility
  const kickoffAt = fm ? `${fm[4]}-${fm[3]}-${fm[2]}T${fm[5]}` : null

  // "Gledatelja: 24.935" — točka je separator tisućica
  const attText = $('.attendance').first().text()
  const am = attText.match(/([\d.]+)\s*$/)
  const attendance = am ? parseInt(am[1].replace(/\./g, '')) : null

  const lineups: ParsedLineupPlayer[] = []
  const events: ParsedMatchEvent[] = []
  // Dvije playerslist liste sa sastavima: prva = domaći, druga = gosti
  const lineupBlocks = $('div.playerslist').filter(
    (_, el) => $(el).find('li.row.match_lineup').length > 0
  )
  lineupBlocks.each((blockIdx, blockEl) => {
    const team: 'home' | 'away' = blockIdx === 0 ? 'home' : 'away'
    const teamName = $(blockEl).find('li.header.clubName').first().text().trim()
    $(blockEl).find('li.row.match_lineup').each((_, rowEl) => {
      const $row = $(rowEl)
      const personId = parseInt($row.attr('data-personid') || '') || 0
      const $nameEl = $row.find('.playerName')
      const rawName = $nameEl.find('h3').first().text().trim()
      const isCaptain = /\(C\)\s*$/.test(rawName)
      const name = $nameEl.find('h3 a').first().text().trim()
      const $pos = $nameEl.clone()
      $pos.find('h3').remove()
      lineups.push({
        personId,
        team,
        teamName,
        number: parseInt($row.find('.shirtNumber').text().trim()) || 0,
        name,
        isCaptain,
        position: $pos.text().trim(),
        photoUrl: $row.find('.playerPhoto img').attr('src') || '',
      })
      $row.find('.matchEvents ul.events li').each((_, evEl) => {
        const $ev = $(evEl)
        const type = ($ev.attr('class') || '').trim()
        const label = $ev.find('.icon').attr('title') || ''
        const minuteMatch = $ev.text().match(/(\d+)\s*'/)
        events.push({
          personId,
          playerName: name,
          team,
          minute: minuteMatch ? parseInt(minuteMatch[1]) : null,
          type,
          label,
        })
      })
    })
  })

  return {
    homeTeam,
    awayTeam,
    homeLogoUrl,
    awayLogoUrl,
    homeScore: played ? parseInt(r1) : null,
    awayScore: played ? parseInt(r2) : null,
    status: $('.status').first().text().trim(),
    venue,
    kickoffAt,
    attendance,
    referees: $('.referees').first().text().trim(),
    lineups,
    events,
  }
}
