import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchMarkets, type Coin } from '@/lib/api/coingecko'

interface UseMarketsOptions {
  page?: number
  perPage?: number
  refreshInterval?: number  // ms, 0 = no auto-refresh
}

interface UseMarketsResult {
  coins: Coin[]
  loading: boolean
  error: string | null
  lastUpdate: Date | null
  refresh: () => void
}

export function useMarkets({
  page = 1,
  perPage = 100,
  refreshInterval = 60_000,
}: UseMarketsOptions = {}): UseMarketsResult {
  const [coins, setCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetch_ = useCallback(async () => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    try {
      setError(null)
      const data = await fetchMarkets(page, perPage)
      setCoins(data)
      setLastUpdate(new Date())
    } catch (e: unknown) {
      if ((e as Error).name !== 'AbortError') {
        setError((e as Error).message ?? 'Failed to fetch market data')
      }
    } finally {
      setLoading(false)
    }
  }, [page, perPage])

  useEffect(() => {
    fetch_()
    if (!refreshInterval) return
    const id = setInterval(fetch_, refreshInterval)
    return () => { clearInterval(id); abortRef.current?.abort() }
  }, [fetch_, refreshInterval])

  return { coins, loading, error, lastUpdate, refresh: fetch_ }
}
