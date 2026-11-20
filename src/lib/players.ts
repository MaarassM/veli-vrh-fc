import { PLAYER_POSITIONS, type Player } from '../types/player'

export interface PlayerRow {
  id: string
  first_name: string
  last_name: string
  number: number | null
  position: string | null
}

export function toPlayer(row: PlayerRow): Player {
  const position = PLAYER_POSITIONS.find(p => p === row.position) ?? null
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    number: row.number,
    position,
  }
}

/** Po broju dresa, igrači bez broja na kraj, pa po prezimenu. */
export function comparePlayers(a: Player, b: Player): number {
  if (a.number !== b.number) {
    if (a.number === null) return 1
    if (b.number === null) return -1
    return a.number - b.number
  }
  return a.lastName.localeCompare(b.lastName, 'hr') || a.firstName.localeCompare(b.firstName, 'hr')
}

export interface PlayerGroup {
  title: string
  players: Player[]
}

/** Grupe redom vratari → obrana → vezni red → napad; igrači bez pozicije idu u "Igrači". Prazne grupe se izostavljaju. */
export function groupPlayers(players: Player[]): PlayerGroup[] {
  const titles: Record<string, string> = {
    Vratar: 'Vratari',
    Obrana: 'Obrana',
    'Vezni red': 'Vezni red',
    Napad: 'Napad',
  }
  const groups: PlayerGroup[] = PLAYER_POSITIONS.map(position => ({
    title: titles[position],
    players: players.filter(p => p.position === position).sort(comparePlayers),
  }))
  groups.push({ title: 'Igrači', players: players.filter(p => p.position === null).sort(comparePlayers) })
  return groups.filter(g => g.players.length > 0)
}
