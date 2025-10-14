'use client'

// =============================================================================
// Price Data Hook - Real-time cryptocurrency data management
// =============================================================================

import { useState, useEffect, useCallback } from 'react'
import { getTopCoins, getCoinById, getCoinHistory } from '@/lib/api/coinGecko'
import type { CryptoCoin, CandlestickData } from '@/types/crypto'

interface UsePriceDataOptions {
  refreshInterval?: number
  limit?: number
  currency?: string
}

interface UsePriceDataReturn {
  coins: CryptoCoin[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => Promise<void>
  getCoinData: (coinId: string) => Promise<CryptoCoin | null>
  getChartData: (coinId: string, days?: number) => Promise<CandlestickData[]>
}

export function usePriceData(options: UsePriceDataOptions = {}): UsePriceDataReturn {
  const { refreshInterval = 30000, limit = 100, currency = 'usd' } = options
  
  const [coins, setCoins] = useState<CryptoCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchCoins = useCallback(async () => {
    try {
      setError(null)
      const data = await getTopCoins({ limit, currency })
      setCoins(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching coins:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch coin data')
    } finally {
      setLoading(false)
    }
  }, [limit, currency])

  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchCoins()
  }, [fetchCoins])

  const getCoinData = useCallback(async (coinId: string): Promise<CryptoCoin | null> => {
    try {
      return await getCoinById(coinId, currency)
    } catch (err) {
      console.error(`Error fetching coin ${coinId}:`, err)
      return null
    }
  }, [currency])

  const getChartData = useCallback(async (coinId: string, days: number = 30): Promise<CandlestickData[]> => {
    try {
      const ohlcData = await getCoinHistory(coinId, days, currency)
      return ohlcData.map(([timestamp, open, high, low, close]) => ({
        time: timestamp,
        open,
        high,
        low,
        close,
        volume: 0, // CoinGecko OHLC doesn't include volume
      }))
    } catch (err) {
      console.error(`Error fetching chart data for ${coinId}:`, err)
      return []
    }
  }, [currency])

  // Initial fetch
  useEffect(() => {
    fetchCoins()
  }, [fetchCoins])

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return

    const interval = setInterval(fetchCoins, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchCoins, refreshInterval])

  return {
    coins,
    loading,
    error,
    lastUpdated,
    refresh,
    getCoinData,
    getChartData,
  }
}