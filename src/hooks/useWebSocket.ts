'use client'

// =============================================================================
// WebSocket Hook - Real-time price updates
// =============================================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import type { PriceUpdate, BinanceWebSocketTicker } from '@/types/crypto'

interface UseWebSocketOptions {
  url?: string
  symbols?: string[]
  reconnectAttempts?: number
  reconnectDelay?: number
}

interface UseWebSocketReturn {
  connected: boolean
  prices: Map<string, PriceUpdate>
  subscribe: (symbol: string) => void
  unsubscribe: (symbol: string) => void
  error: string | null
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = process.env.NEXT_PUBLIC_BINANCE_WS_URL || 'wss://stream.binance.com:9443/ws',
    symbols = [],
    reconnectAttempts = 3,
    reconnectDelay = 5000,
  } = options

  const [connected, setConnected] = useState(false)
  const [prices, setPrices] = useState<Map<string, PriceUpdate>>(new Map())
  const [error, setError] = useState<string | null>(null)
  const [subscribedSymbols, setSubscribedSymbols] = useState<Set<string>>(new Set(symbols))
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      // Create stream URLs for subscribed symbols
      const streams = Array.from(subscribedSymbols).map(symbol => 
        `${symbol.toLowerCase()}@ticker`
      ).join('/')
      
      const wsUrl = streams ? `${url}/${streams}` : url
      
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
        setConnected(true)
        setError(null)
        reconnectCountRef.current = 0
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data: BinanceWebSocketTicker = JSON.parse(event.data)
          
          if (data.e === '24hrTicker') {
            const priceUpdate: PriceUpdate = {
              symbol: data.s,
              price: parseFloat(data.c),
              change24h: parseFloat(data.p),
              changePercent24h: parseFloat(data.P),
              timestamp: data.E,
            }
            
            setPrices(prev => new Map(prev.set(data.s, priceUpdate)))
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected')
        setConnected(false)
        
        // Attempt to reconnect
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... (${reconnectCountRef.current}/${reconnectAttempts})`)
            connect()
          }, reconnectDelay)
        } else {
          setError('WebSocket connection failed after maximum retry attempts')
        }
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('WebSocket connection error')
      }
    } catch (err) {
      console.error('Error creating WebSocket connection:', err)
      setError('Failed to create WebSocket connection')
    }
  }, [url, subscribedSymbols, reconnectAttempts, reconnectDelay])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setConnected(false)
  }, [])

  const subscribe = useCallback((symbol: string) => {
    setSubscribedSymbols(prev => new Set(prev.add(symbol.toUpperCase())))
  }, [])

  const unsubscribe = useCallback((symbol: string) => {
    setSubscribedSymbols(prev => {
      const newSet = new Set(prev)
      newSet.delete(symbol.toUpperCase())
      return newSet
    })
  }, [])

  // Connect when component mounts or symbols change
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return {
    connected,
    prices,
    subscribe,
    unsubscribe,
    error,
  }
}