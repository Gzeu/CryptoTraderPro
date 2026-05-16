import { describe, it, expect } from 'vitest'
import { CoinSchema, MarketsResponseSchema, safeParse } from '@/lib/schemas'

const validCoin = {
  id: 'bitcoin', symbol: 'btc', name: 'Bitcoin',
  image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  current_price: 65000, market_cap: 1_300_000_000_000,
  market_cap_rank: 1, total_volume: 40_000_000_000,
  price_change_percentage_24h: 2.5, circulating_supply: 19_700_000,
  ath: 73_000, ath_change_percentage: -11,
}

describe('CoinSchema', () => {
  it('parses valid coin', () => {
    expect(CoinSchema.safeParse(validCoin).success).toBe(true)
  })
  it('rejects missing id', () => {
    const { id: _id, ...rest } = validCoin
    expect(CoinSchema.safeParse(rest).success).toBe(false)
  })
  it('rejects invalid image url', () => {
    expect(CoinSchema.safeParse({ ...validCoin, image: 'not-a-url' }).success).toBe(false)
  })
})

describe('safeParse', () => {
  it('returns null on invalid data', () => {
    expect(safeParse(MarketsResponseSchema, 'bad')).toBeNull()
  })
  it('returns data on valid array', () => {
    expect(safeParse(MarketsResponseSchema, [validCoin])).toBeTruthy()
  })
})
