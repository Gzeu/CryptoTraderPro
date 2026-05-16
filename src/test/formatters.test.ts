import { describe, it, expect } from 'vitest'
import { fmtPrice, fmtLarge, fmtPct, fmtRelative } from '@/lib/formatters'

describe('fmtPrice', () => {
  it('formats zero', ()          => expect(fmtPrice(0)).toBe('$0.00'))
  it('formats large price', ()   => expect(fmtPrice(65432.12)).toBe('$65,432.12'))
  it('formats sub-cent', ()      => expect(fmtPrice(0.0001234)).toMatch(/^\$/))
  it('formats tiny price', ()    => expect(fmtPrice(0.000001)).toMatch(/e/))
})

describe('fmtLarge', () => {
  it('formats billions',  () => expect(fmtLarge(1_234_000_000)).toBe('$1.23B'))
  it('formats millions',  () => expect(fmtLarge(4_500_000)).toBe('$4.50M'))
  it('formats trillions', () => expect(fmtLarge(2_100_000_000_000)).toBe('$2.10T'))
})

describe('fmtPct', () => {
  it('shows + for positive', () => expect(fmtPct(3.45)).toBe('+3.45%'))
  it('shows - for negative', () => expect(fmtPct(-1.2)).toBe('-1.20%'))
  it('no sign when disabled', () => expect(fmtPct(3.45, false)).toBe('3.45%'))
})

describe('fmtRelative', () => {
  it('returns just now for <1min', () => {
    expect(fmtRelative(new Date(Date.now() - 30_000))).toBe('just now')
  })
  it('returns minutes', () => {
    expect(fmtRelative(new Date(Date.now() - 5 * 60_000))).toBe('5m ago')
  })
})
