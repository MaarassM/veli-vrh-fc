import { describe, it, expect } from 'vitest'
import { newlyPlayed, recipientsFor, todayInZagreb, type PushMatchState, type SubscriberPrefs } from '../../lib/push-detect'

const before: PushMatchState[] = [
  { id: 'seniori-1', status: 'played' },
  { id: 'seniori-2', status: 'upcoming' },
  { id: 'seniori-3', status: 'upcoming' },
]

const after = [
  { id: 'seniori-1', status: 'played', isVeliVrh: true }, // već bila odigrana — ne
  { id: 'seniori-2', status: 'played', isVeliVrh: true }, // NOVO odigrana — da
  { id: 'seniori-3', status: 'upcoming', isVeliVrh: true }, // još nije — ne
  { id: 'seniori-4', status: 'played', isVeliVrh: false }, // tuđa utakmica — ne
  { id: 'seniori-5', status: 'played', isVeliVrh: true }, // nova u bazi i odigrana — da
] as const

describe('newlyPlayed', () => {
  it('returns only Veli Vrh matches that transitioned to played', () => {
    const result = newlyPlayed(before, [...after])
    expect(result.map(m => m.id)).toEqual(['seniori-2', 'seniori-5'])
  })

  it('empty before treats all played Veli Vrh matches as new', () => {
    const result = newlyPlayed([], [...after])
    expect(result.map(m => m.id)).toEqual(['seniori-1', 'seniori-2', 'seniori-5'])
  })
})

describe('recipientsFor', () => {
  const subs: SubscriberPrefs[] = [
    { endpoint: 'a', categories: ['seniori'], notifyResults: true, notifyReminders: false },
    { endpoint: 'b', categories: ['seniori', 'juniori'], notifyResults: true, notifyReminders: true },
    { endpoint: 'c', categories: ['juniori'], notifyResults: false, notifyReminders: true },
  ]

  it('filters by category and result preference', () => {
    expect(recipientsFor(subs, 'seniori', 'result').map(s => s.endpoint)).toEqual(['a', 'b'])
    expect(recipientsFor(subs, 'juniori', 'result').map(s => s.endpoint)).toEqual(['b'])
  })

  it('filters by reminder preference', () => {
    expect(recipientsFor(subs, 'juniori', 'reminder').map(s => s.endpoint)).toEqual(['b', 'c'])
    expect(recipientsFor(subs, 'veterani', 'reminder')).toEqual([])
  })
})

describe('todayInZagreb', () => {
  it('formats date in Europe/Zagreb timezone as YYYY-MM-DD', () => {
    // 2026-08-03 23:30 UTC = 2026-08-04 01:30 u Zagrebu (CEST)
    expect(todayInZagreb(new Date('2026-08-03T23:30:00Z'))).toBe('2026-08-04')
    expect(todayInZagreb(new Date('2026-08-03T10:00:00Z'))).toBe('2026-08-03')
  })
})
