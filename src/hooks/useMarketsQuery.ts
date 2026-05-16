import { useQuery } from '@tanstack/react-query'
import { fetchMarkets } from '@/lib/api/coingecko'
import { MarketsResponseSchema, safeParse } from '@/lib/schemas'

export function useMarketsQuery(page = 1, perPage = 100) {
  return useQuery({
    queryKey: ['markets', page, perPage],
    queryFn:  async () => {
      const raw = await fetchMarkets(page, perPage)
      // Validate response shape; fall back to raw if schema mismatch
      return safeParse(MarketsResponseSchema, raw) ?? raw
    },
    staleTime:        60_000,
    refetchInterval:  60_000,
  })
}
