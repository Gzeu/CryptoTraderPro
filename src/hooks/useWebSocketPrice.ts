'use client'

// =============================================================================
// useWebSocketPrice - Binance WebSocket live price hook
// =============================================================================

import { useEffect, useRef, useState, useCallback } from 'react'

export interface PriceData {
  price: number
  priceChange: number
  priceChangePercent: number
  high24h: number
  low24h: number
  volume24h: number
  lastUpdated: number
}

interface WebSocketTickerMessage {
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

interface UseWebSocketPriceReturn {
  data: PriceData | null
  isConnected: boolean
  error: string | null
  reconnect: () => void
}

const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws'
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY_MS = 2000

export function useWebSocketPrice(symbol: string): UseWebSocketPriceReturn {
  const [data, setData] = useState<PriceData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMounted = useRef(true)
  const symbolRef = useRef(symbol.toLowerCase())

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!isMounted.current) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const url = `${BINANCE_WS_BASE}/${symbolRef.current}@ticker`
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
        const msg = JSON.parse(event.data as string) as WebSocketTickerMessage
        setData({
          price: parseFloat(msg.c),
          priceChange: parseFloat(msg.p),
          priceChangePercent: parseFloat(msg.P),
          high24h: parseFloat(msg.h),
          low24h: parseFloat(msg.l),
          volume24h: parseFloat(msg.v),
          lastUpdated: msg.E,
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
    symbolRef.current = symbol.toLowerCase()
    connect()

    return () => {
      isMounted.current = false
      clearReconnectTimer()
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [symbol, connect, clearReconnectTimer])

  return { data, isConnected, error, reconnect }
}

export default useWebSocketPrice
