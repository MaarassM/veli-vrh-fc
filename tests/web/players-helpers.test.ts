import { describe, expect, it } from 'vitest'
import { comparePlayers, groupPlayers, toPlayer } from '../../src/lib/players'
import type { Player } from '../../src/types/player'

function player(id: string, lastName: string, number: number | null, position: Player['position']): Player {
  return { id, firstName: 'X', lastName, number, position }
}

describe('toPlayer', () => {
  it('maps a row and drops an unknown position', () => {
    expect(toPlayer({ id: '1', first_name: 'Filip', last_name: 'Vujica', number: 1, position: 'Igrač' })).toEqual({
      id: '1',
      firstName: 'Filip',
      lastName: 'Vujica',
      number: 1,
      position: null,
    })
  })
})

describe('comparePlayers', () => {
  it('sorts by number, puts players without a number last, then by last name', () => {
    const sorted = [
      player('a', 'Žagrić', null, null),
      player('b', 'Belas', 17, null),
      player('c', 'Ćosić', null, null),
      player('d', 'Hrelja', 3, null),
    ].sort(comparePlayers)
    expect(sorted.map(p => p.id)).toEqual(['d', 'b', 'c', 'a'])
  })
})

describe('groupPlayers', () => {
  it('orders groups by position and skips empty ones', () => {
    const groups = groupPlayers([
      player('1', 'A', 9, 'Napad'),
      player('2', 'B', 4, null),
      player('3', 'C', 1, 'Vratar'),
    ])
    expect(groups.map(g => g.title)).toEqual(['Vratari', 'Napad', 'Igrači'])
  })

  it('returns no groups for an empty squad', () => {
    expect(groupPlayers([])).toEqual([])
  })
})
