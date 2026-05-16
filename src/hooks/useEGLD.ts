'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchMarkets } from '@/lib/api/coingecko'

const EGLD_ID = 'elrond-erd-2'

export interface EGLDStats {
  price:      number
  change24h:  number
  change7d:   number
  marketCap:  number
  volume24h:  number
  rank:       number | null
  sparkline:  number[]
}

/**
 * Dedicated hook for EGLD / MultiversX data.
 * Uses the same CoinGecko /coins/markets endpoint — no extra API quota.
 * Refreshes every 60 s alongside the main market feed.
 */
export function useEGLD(): { data: EGLDStats | null; isLoading: boolean } {
  const { data: coins = [], isLoading } = useQuery({
    queryKey:  ['markets', 1, 100],   // reuses the cached markets response
    queryFn:   () => fetchMarkets(1, 100),
    staleTime: 60_000,
  })

  const coin = coins.find((c: { id: string }) => c.id === EGLD_ID)

  if (!coin) return { data: null, isLoading }

  return {
    isLoading,
    data: {
      price:     coin.current_price,
      change24h: coin.price_change_percentage_24h ?? 0,
      change7d:  coin.price_change_percentage_7d_in_currency ?? 0,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      rank:      coin.market_cap_rank,
      sparkline: coin.sparkline_in_7d?.price ?? [],
    },
  }
}
