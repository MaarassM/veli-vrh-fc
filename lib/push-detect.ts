// Detekcija novoodigranih utakmica Velog Vrha — čisto, testabilno
export interface PushMatchState {
  id: string
  status: string
}

export interface PushCandidate extends PushMatchState {
  isVeliVrh: boolean
}

export function newlyPlayed<T extends PushCandidate>(
  before: PushMatchState[],
  after: T[],
): T[] {
  const previousStatus = new Map(before.map(m => [m.id, m.status]))
  return after.filter(
    m => m.isVeliVrh && m.status === 'played' && previousStatus.get(m.id) !== 'played',
  )
}
