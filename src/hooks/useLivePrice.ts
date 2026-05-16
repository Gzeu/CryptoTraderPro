'use client'

// =============================================================================
// useLivePrice — subscribe to real-time Binance WS price for a single symbol
// useLivePrices — subscribe to multiple symbols simultaneously
// =============================================================================

import { useEffect, useState, useRef } from 'react'
import { priceFeed, type TickerPayload } from '@/lib/ws/priceFeed'

/**
 * Returns live price data for a single symbol (e.g. 'BTCUSDT').
 * Falls back to null until first WS message arrives.
 *
 * @example
 * const { price, priceChangePercent, isLive } = useLivePrice('BTCUSDT')
 */
export function useLivePrice(symbol: string | null | undefined, enabled = true) {
  const upper = symbol?.toUpperCase() ?? null
  const [data, setData]     = useState<TickerPayload | null>(() => upper ? priceFeed.getCached(upper) : null)
  const [isLive, setIsLive] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!upper || !enabled) {
      setData(null)
      setIsLive(false)
      return
    }

    const unsub = priceFeed.subscribe(upper, (payload) => {
      if (!mountedRef.current) return
      setData(payload)
      setIsLive(true)
    })

    return () => {
      unsub()
      if (mountedRef.current) setIsLive(false)
    }
  }, [upper, enabled])

  return {
    price:              data?.price              ?? null,
    priceChange:        data?.priceChange        ?? null,
    priceChangePercent: data?.priceChangePercent ?? null,
    high:               data?.high               ?? null,
    low:                data?.low                ?? null,
    volume:             data?.volume             ?? null,
    quoteVolume:        data?.quoteVolume        ?? null,
    lastUpdated:        data?.lastUpdated        ?? null,
    isLive,
    raw: data,
  }
}

/**
 * Subscribe to multiple symbols at once.
 * Returns a Map<SYMBOL, TickerPayload> that updates on each message.
 *
 * @example
 * const { priceMap, isLive } = useLivePrices(['BTCUSDT', 'ETHUSDT', 'EGLDUSDT'])
 * const btcPrice = priceMap.get('BTCUSDT')?.price
 */
export function useLivePrices(symbols: string[], enabled = true) {
  const [priceMap, setPriceMap] = useState<Map<string, TickerPayload>>(() => {
    const m = new Map<string, TickerPayload>()
    symbols.forEach(s => {
      const cached = priceFeed.getCached(s.toUpperCase())
      if (cached) m.set(s.toUpperCase(), cached)
    })
    return m
  })
  const [isLive, setIsLive] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!enabled || symbols.length === 0) return

    const uppers = symbols.map(s => s.toUpperCase())
    const unsubs = uppers.map(sym =>
      priceFeed.subscribe(sym, (payload) => {
        if (!mountedRef.current) return
        setPriceMap(prev => new Map(prev).set(sym, payload))
        setIsLive(true)
      })
    )

    return () => {
      unsubs.forEach(u => u())
      if (mountedRef.current) setIsLive(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(','), enabled])

  return { priceMap, isLive }
}
