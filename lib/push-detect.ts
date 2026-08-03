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

export interface SubscriberPrefs {
  endpoint: string
  categories: string[]
  notifyResults: boolean
  notifyReminders: boolean
}

export type NotificationKind = 'result' | 'reminder'

export function recipientsFor<T extends SubscriberPrefs>(
  subs: T[],
  category: string,
  kind: NotificationKind,
): T[] {
  return subs.filter(
    sub =>
      sub.categories.includes(category) &&
      (kind === 'result' ? sub.notifyResults : sub.notifyReminders),
  )
}

export function todayInZagreb(now: Date): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'Europe/Zagreb' })
}
