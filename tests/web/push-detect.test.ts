import { describe, it, expect } from 'vitest'
import { newlyPlayed, type PushMatchState } from '../../lib/push-detect'

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
