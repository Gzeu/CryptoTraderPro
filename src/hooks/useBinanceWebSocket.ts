// =============================================================================
// Binance WebSocket Hook - Real-time market data streaming
// =============================================================================

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  subscribeToPriceUpdates,
  subscribeToKlineUpdates,
  unsubscribeFromPriceUpdates,
  unsubscribeFromKlineUpdates,
} from '@/lib/api/binance'
import type { CandlestickData } from '@/types/crypto'

interface PriceData {
  symbol: string
  price: number
  priceChange: number
  priceChangePercent: number
  high: number
  low: number
  volume: number
  quoteVolume: number
}

/**
 * Hook for real-time price updates via WebSocket
 */
export const useBinancePriceStream = (symbol: string, enabled: boolean = true) => {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  
  useEffect(() => {
    if (!enabled || !symbol) {
      return
    }
    
    setIsConnected(true)
    setError(null)
    
    try {
      const unsubscribe = subscribeToPriceUpdates(symbol, (data) => {
        setPriceData({
          symbol: data.symbol,
          price: data.price,
          priceChange: data.priceChange,
          priceChangePercent: data.priceChangePercent,
          high: data.high,
          low: data.low,
          volume: data.volume,
          quoteVolume: data.quoteVolume,
        })
      })
      
      unsubscribeRef.current = unsubscribe
    } catch (err) {
      setError('Failed to connect to price stream')
      setIsConnected(false)
      console.error(err)
    }
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setIsConnected(false)
    }
  }, [symbol, enabled])
  
  return {
    priceData,
    isConnected,
    error,
  }
}

/**
 * Hook for real-time candlestick/kline updates via WebSocket
 */
export const useBinanceKlineStream = (
  symbol: string,
  interval: string,
  enabled: boolean = true
) => {
  const [klineData, setKlineData] = useState<CandlestickData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFinal, setIsFinal] = useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  
  useEffect(() => {
    if (!enabled || !symbol || !interval) {
      return
    }
    
    setIsConnected(true)
    setError(null)
    
    try {
      const unsubscribe = subscribeToKlineUpdates(symbol, interval, (data) => {
        setKlineData({
          time: data.time,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: data.volume,
        })
        setIsFinal(data.isFinal)
      })
      
      unsubscribeRef.current = unsubscribe
    } catch (err) {
      setError('Failed to connect to kline stream')
      setIsConnected(false)
      console.error(err)
    }
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setIsConnected(false)
    }
  }, [symbol, interval, enabled])
  
  return {
    klineData,
    isFinal,
    isConnected,
    error,
  }
}

/**
 * Hook for managing multiple price streams
 */
export const useMultiplePriceStreams = (symbols: string[], enabled: boolean = true) => {
  const [priceMap, setPriceMap] = useState<Map<string, PriceData>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const unsubscribersRef = useRef<Map<string, () => void>>(new Map())
  
  useEffect(() => {
    if (!enabled || symbols.length === 0) {
      return
    }
    
    setIsConnected(true)
    
    // Subscribe to all symbols
    symbols.forEach(symbol => {
      if (!unsubscribersRef.current.has(symbol)) {
        const unsubscribe = subscribeToPriceUpdates(symbol, (data) => {
          setPriceMap(prev => new Map(prev).set(symbol, {
            symbol: data.symbol,
            price: data.price,
            priceChange: data.priceChange,
            priceChangePercent: data.priceChangePercent,
            high: data.high,
            low: data.low,
            volume: data.volume,
            quoteVolume: data.quoteVolume,
          }))
        })
        
        unsubscribersRef.current.set(symbol, unsubscribe)
      }
    })
    
    // Cleanup removed symbols
    unsubscribersRef.current.forEach((unsubscribe, symbol) => {
      if (!symbols.includes(symbol)) {
        unsubscribe()
        unsubscribersRef.current.delete(symbol)
        setPriceMap(prev => {
          const newMap = new Map(prev)
          newMap.delete(symbol)
          return newMap
        })
      }
    })
    
    return () => {
      unsubscribersRef.current.forEach(unsubscribe => unsubscribe())
      unsubscribersRef.current.clear()
      setIsConnected(false)
      setPriceMap(new Map())
    }
  }, [symbols, enabled])
  
  const getPriceData = useCallback((symbol: string) => {
    return priceMap.get(symbol) || null
  }, [priceMap])
  
  return {
    priceMap,
    getPriceData,
    isConnected,
  }
}

/**
 * Hook for order book depth updates (polling-based for now)
 */
export const useOrderBook = (
  symbol: string,
  limit: number = 20,
  updateInterval: number = 1000,
  enabled: boolean = true
) => {
  const [orderBook, setOrderBook] = useState<{
    bids: Array<{ price: number; quantity: number }>
    asks: Array<{ price: number; quantity: number }>
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!enabled || !symbol) {
      return
    }
    
    const fetchOrderBook = async () => {
      try {
        setIsLoading(true)
        const { getOrderBook } = await import('@/lib/api/binance')
        const data = await getOrderBook(symbol, limit)
        
        setOrderBook({
          bids: data.bids.slice(0, limit),
          asks: data.asks.slice(0, limit),
        })
        setError(null)
      } catch (err) {
        setError('Failed to fetch order book')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Initial fetch
    fetchOrderBook()
    
    // Set up interval
    const interval = setInterval(fetchOrderBook, updateInterval)
    
    return () => clearInterval(interval)
  }, [symbol, limit, updateInterval, enabled])
  
  return {
    orderBook,
    isLoading,
    error,
  }
}

/**
 * Hook for recent trades stream (polling-based)
 */
export const useRecentTrades = (
  symbol: string,
  limit: number = 50,
  updateInterval: number = 2000,
  enabled: boolean = true
) => {
  const [trades, setTrades] = useState<Array<{
    id: number
    price: number
    quantity: number
    time: number
    isBuyerMaker: boolean
  }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!enabled || !symbol) {
      return
    }
    
    const fetchTrades = async () => {
      try {
        setIsLoading(true)
        const { getRecentTrades } = await import('@/lib/api/binance')
        const data = await getRecentTrades(symbol, limit)
        
        setTrades(data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch recent trades')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Initial fetch
    fetchTrades()
    
    // Set up interval
    const interval = setInterval(fetchTrades, updateInterval)
    
    return () => clearInterval(interval)
  }, [symbol, limit, updateInterval, enabled])
  
  return {
    trades,
    isLoading,
    error,
  }
}