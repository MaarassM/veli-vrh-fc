// Čisti parseri za HNS Semafor HTML — bez IO-a, testirani na stvarnim fixture-ima
import * as cheerio from 'cheerio'
import type {
  ParsedCompetitionPage,
  ParsedStanding,
  ParsedMatch,
  ParsedScorer,
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
