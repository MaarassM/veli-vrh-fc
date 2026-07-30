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

  const matches: ParsedMatch[] = []
  const scorers: ParsedScorer[] = []

  return { standingsParts, matches, scorers }
}
