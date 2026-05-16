import { z } from 'zod'

// Sparkline
const SparklineSchema = z.object({
  price: z.array(z.number()),
}).optional()

// Single coin from /coins/markets
export const CoinSchema = z.object({
  id:                            z.string(),
  symbol:                        z.string(),
  name:                          z.string(),
  image:                         z.string().url(),
  current_price:                 z.number(),
  market_cap:                    z.number(),
  market_cap_rank:               z.number().nullable(),
  total_volume:                  z.number(),
  price_change_percentage_24h:   z.number().nullable(),
  price_change_percentage_7d_in_currency: z.number().nullable().optional(),
  circulating_supply:            z.number().nullable(),
  ath:                           z.number(),
  ath_change_percentage:         z.number(),
  sparkline_in_7d:               SparklineSchema,
})

export const MarketsResponseSchema = z.array(CoinSchema)

export type CoinSchema = z.infer<typeof CoinSchema>

// OHLC bar  [timestamp, open, high, low, close]
export const OHLCBarSchema = z.tuple([
  z.number(), z.number(), z.number(), z.number(), z.number()
])
export const OHLCResponseSchema = z.array(OHLCBarSchema)

// Global market
export const GlobalSchema = z.object({
  total_market_cap:                     z.record(z.number()),
  total_volume:                         z.record(z.number()),
  market_cap_percentage:                z.record(z.number()),
  market_cap_change_percentage_24h_usd: z.number(),
})

// Safe parse helper—returns data or null, logs on failure
export function safeParse<T>(schema: z.ZodType<T>, data: unknown): T | null {
  const result = schema.safeParse(data)
  if (!result.success) {
    console.warn('[Schema validation]', result.error.flatten())
    return null
  }
  return result.data
}
