import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { SLOTS, colours, contrast, failures, parseScheme } from './contrast'

const dir = new URL('./schemes/', import.meta.url)
const files = readdirSync(dir).filter((f) => f.endsWith('.css'))

describe('contrast', () => {
  it('matches WCAG for black on white and a known grey', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrast('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
  })
  it('reads the colours of a gradient and skips one with transparent parts', () => {
    expect(colours('linear-gradient(#1d2e56, #17274c)')).toEqual(['#1d2e56', '#17274c'])
    expect(colours('linear-gradient(to top, #0b0b0b 0 2px, transparent 2px)')).toEqual([])
  })
})

describe.each(files)('scheme %s', (file) => {
  const vars = parseScheme(readFileSync(new URL(file, dir), 'utf8'))

  it('defines every slot of the contract, in light and dark', () => {
    for (const mode of ['light', 'dark'] as const) {
      expect(SLOTS.filter((s) => !(s in vars[mode])), mode).toEqual([])
    }
  })

  it('reaches 4.5:1 for text and 3:1 for field edges and chart marks', () => {
    expect(failures(vars)).toEqual([])
  })
})
