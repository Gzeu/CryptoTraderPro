'use client'

// =============================================================================
// useMultipleWebSocketPrices - Combined Binance streams for multiple symbols
// =============================================================================

import { useEffect, useRef, useState, useCallback } from 'react'
import type { PriceData } from './useWebSocketPrice'

interface CombinedStreamMessage {
  stream: string
  data: {
    e: string
    E: number
    s: string
    p: string
    P: string
    h: string
    l: string
    v: string
    c: string
  }
}

interface UseMultipleWebSocketPricesReturn {
  prices: Map<string, PriceData>
  isConnected: boolean
  error: string | null
  reconnect: () => void
}

const BINANCE_COMBINED_BASE = 'wss://stream.binance.com:9443/stream?streams='
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY_MS = 2000

export function useMultipleWebSocketPrices(
  symbols: string[]
): UseMultipleWebSocketPricesReturn {
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMounted = useRef(true)
  const symbolsRef = useRef(symbols)

  useEffect(() => {
    symbolsRef.current = symbols
  }, [symbols])

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!isMounted.current) return
    if (symbolsRef.current.length === 0) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const streams = symbolsRef.current
      .map((s) => `${s.toLowerCase()}@ticker`)
      .join('/')
    const url = `${BINANCE_COMBINED_BASE}${streams}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (!isMounted.current) return
      setIsConnected(true)
      setError(null)
      reconnectAttempts.current = 0
    }

    ws.onmessage = (event: MessageEvent) => {
      if (!isMounted.current) return
      try {
        const msg = JSON.parse(event.data as string) as CombinedStreamMessage
        const d = msg.data
        const symbol = d.s.toLowerCase()
        const priceData: PriceData = {
          price: parseFloat(d.c),
          priceChange: parseFloat(d.p),
          priceChangePercent: parseFloat(d.P),
          high24h: parseFloat(d.h),
          low24h: parseFloat(d.l),
          volume24h: parseFloat(d.v),
          lastUpdated: d.E,
        }
        setPrices((prev) => {
          const next = new Map(prev)
          next.set(symbol, priceData)
          return next
        })
      } catch {
        // silently ignore parse errors
      }
    }

    ws.onerror = () => {
      if (!isMounted.current) return
      setError('WebSocket connection error')
      setIsConnected(false)
    }

    ws.onclose = () => {
      if (!isMounted.current) return
      setIsConnected(false)
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current += 1
        const delay = RECONNECT_DELAY_MS * reconnectAttempts.current
        reconnectTimer.current = setTimeout(connect, delay)
      } else {
        setError(`Connection lost after ${MAX_RECONNECT_ATTEMPTS} attempts`)
      }
    }
  }, [])

  const reconnect = useCallback(() => {
    clearReconnectTimer()
    reconnectAttempts.current = 0
    wsRef.current?.close()
    connect()
  }, [connect, clearReconnectTimer])

  useEffect(() => {
    isMounted.current = true
    connect()
    return () => {
      isMounted.current = false
      clearReconnectTimer()
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [connect, clearReconnectTimer])

  return { prices, isConnected, error, reconnect }
}

export default useMultipleWebSocketPrices
