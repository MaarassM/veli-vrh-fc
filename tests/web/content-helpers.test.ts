import { describe, it, expect } from 'vitest'
import { splitBold, resolveContent, defaultContent } from '../../src/lib/content'

describe('splitBold', () => {
  it('splits bold segments', () => {
    expect(splitBold('a **b** c')).toEqual([
      { text: 'a ', bold: false },
      { text: 'b', bold: true },
      { text: ' c', bold: false },
    ])
  })

  it('leaves unclosed markers as plain text', () => {
    expect(splitBold('a **b')).toEqual([{ text: 'a **b', bold: false }])
  })

  it('handles bold at the start', () => {
    expect(splitBold('**NK** x')[0]).toEqual({ text: 'NK', bold: true })
  })
})

describe('resolveContent', () => {
  it('uses a valid remote value', () => {
    const remote = { text: 'Novi tekst' }
    expect(resolveContent('home_intro', remote)).toEqual(remote)
  })

  it('falls back on null or non-object', () => {
    expect(resolveContent('home_intro', null)).toEqual(defaultContent.home_intro)
    expect(resolveContent('home_intro', 'tekst')).toEqual(defaultContent.home_intro)
  })

  it('falls back on a wrong shape', () => {
    expect(resolveContent('stadium', { features: 'x' })).toEqual(defaultContent.stadium)
  })

  it('fills fields missing from an older saved shape', () => {
    const remote = { paragraphs: ['Samo odlomak'] }
    const result = resolveContent('about_overview', remote)
    expect(result.paragraphs).toEqual(['Samo odlomak'])
    expect(result.subtitle).toBe(defaultContent.about_overview.subtitle)
    expect(result.stats).toEqual(defaultContent.about_overview.stats)
  })
})
