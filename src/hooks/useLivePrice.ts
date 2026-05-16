'use client'

// =============================================================================
// useLivePrice   — single symbol live price
// useLivePrices  — multiple symbols, batched on one WS connection
// useLivePriceBatch — same as useLivePrices but accepts a stable ref
//
// All hooks read from priceFeed singleton; subscriptions are debounce-batched
// in priceFeed itself so mounting 10+ components = 1 reconnect, not 10.
// =============================================================================

import { useEffect, useState, useRef, useMemo } from 'react'
import { priceFeed, type TickerPayload } from '@/lib/ws/priceFeed'

// ---------------------------------------------------------------------------
// useLivePrice — single symbol
// ---------------------------------------------------------------------------

/**
 * Subscribe to a single Binance ticker symbol.
 *
 * @example
 * const { price, priceChangePercent, isLive } = useLivePrice('BTCUSDT')
 */
export function useLivePrice(symbol: string | null | undefined, enabled = true) {
  const upper = symbol?.toUpperCase() ?? null

  const [data, setData]     = useState<TickerPayload | null>(() =>
    upper ? priceFeed.getCached(upper) : null
  )
  const [isLive, setIsLive] = useState(false)
  const mounted             = useRef(true)

  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  useEffect(() => {
    if (!upper || !enabled) { setData(null); setIsLive(false); return }

    const unsub = priceFeed.subscribe(upper, (payload) => {
      if (!mounted.current) return
      setData(payload)
      setIsLive(true)
    })
    return () => { unsub(); if (mounted.current) setIsLive(false) }
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

// ---------------------------------------------------------------------------
// useLivePrices — N symbols, single batch
// ---------------------------------------------------------------------------

/**
 * Subscribe to multiple ticker symbols simultaneously.
 * Internally all symbols share a single (or chunked) Binance WS connection.
 * Mounting 10 portfolio rows = 1 network connection, not 10.
 *
 * @example
 * const { priceMap, isLive } = useLivePrices(['BTCUSDT', 'ETHUSDT', 'EGLDUSDT'])
 * const btc = priceMap.get('BTCUSDT')?.price
 */
export function useLivePrices(symbols: string[], enabled = true) {
  // Stable join key so the effect only fires when symbols actually change
  const key = useMemo(() => [...symbols].sort().join(','), [symbols])

  const [priceMap, setPriceMap] = useState<Map<string, TickerPayload>>(() => {
    const m = new Map<string, TickerPayload>()
    symbols.forEach(s => {
      const c = priceFeed.getCached(s.toUpperCase())
      if (c) m.set(s.toUpperCase(), c)
    })
    return m
  })
  const [isLive, setIsLive] = useState(false)
  const mounted             = useRef(true)

  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  useEffect(() => {
    if (!enabled || symbols.length === 0) return

    const uppers = symbols.map(s => s.toUpperCase())

    // All subscriptions register within the same sync microtask tick;
    // priceFeed debounces them into ONE reconnect after 40 ms.
    const unsubs = uppers.map(sym =>
      priceFeed.subscribe(sym, (payload) => {
        if (!mounted.current) return
        // Functional update: copy-on-write so React batches renders
        setPriceMap(prev => {
          const next = new Map(prev)
          next.set(sym, payload)
          return next
        })
        setIsLive(true)
      })
    )

    return () => {
      unsubs.forEach(u => u())
      if (mounted.current) setIsLive(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  return { priceMap, isLive }
}

// ---------------------------------------------------------------------------
// Helper: derive a simple price lookup from useLivePrices
// ---------------------------------------------------------------------------

/**
 * Convenience wrapper — returns a getter function instead of a Map.
 *
 * @example
 * const getPrice = usePriceGetter(['BTCUSDT','ETHUSDT'])
 * const btc = getPrice('BTCUSDT')   // number | null
 */
export function usePriceGetter(symbols: string[], enabled = true) {
  const { priceMap, isLive } = useLivePrices(symbols, enabled)
  const getPrice = (sym: string) => priceMap.get(sym.toUpperCase())?.price ?? null
  const getPct   = (sym: string) => priceMap.get(sym.toUpperCase())?.priceChangePercent ?? null
  return { getPrice, getPct, isLive, priceMap }
}
