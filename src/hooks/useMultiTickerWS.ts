/**
 * useMultiTickerWS
 * ─────────────────
 * Subscribes to multiple Binance <symbol>@miniTicker streams in a
 * single Combined Stream WebSocket connection.
 *
 * Returns a Map<symbol, TickerData> that updates in real-time.
 *
 * Usage:
 *   const tickers = useMultiTickerWS(['BTCUSDT', 'ETHUSDT', 'EGLDUSDT'])
 *   const btcPrice = tickers.get('BTCUSDT')?.price
 */

import { useEffect, useRef, useState, useCallback } from 'react'

export interface TickerData {
  symbol: string
  price: number
  priceChangePercent: number
  high: number
  low: number
  volume: number        // base asset volume
  quoteVolume: number   // USDT volume
  openPrice: number
  closeTime: number
}

interface MiniTickerMsg {
  e: '24hrMiniTicker'
  E: number   // event time
  s: string   // symbol
  c: string   // close price
  o: string   // open price
  h: string   // high
  l: string   // low
  v: string   // base volume
  q: string   // quote volume
}

const WS_BASE = 'wss://stream.binance.com:9443/stream'
const MAX_RETRIES = 5
const BASE_DELAY  = 1_500 // ms

function buildUrl(symbols: string[]): string {
  const streams = symbols.map((s) => `${s.toLowerCase()}@miniTicker`).join('/')
  return `${WS_BASE}?streams=${streams}`
}

export function useMultiTickerWS(symbols: string[]): Map<string, TickerData> {
  const [tickers, setTickers] = useState<Map<string, TickerData>>(new Map())
  const wsRef       = useRef<WebSocket | null>(null)
  const retries     = useRef(0)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const symbolsRef  = useRef<string[]>(symbols)
  const mountedRef  = useRef(true)

  // Keep symbolsRef current without triggering reconnect on every render
  useEffect(() => { symbolsRef.current = symbols }, [symbols])

  const connect = useCallback(() => {
    const syms = symbolsRef.current
    if (!syms.length) return

    const ws = new WebSocket(buildUrl(syms))
    wsRef.current = ws

    ws.onopen = () => {
      retries.current = 0
    }

    ws.onmessage = (evt) => {
      if (!mountedRef.current) return
      try {
        const envelope = JSON.parse(evt.data as string) as { data: MiniTickerMsg }
        const d = envelope.data
        if (d.e !== '24hrMiniTicker') return

        const open  = parseFloat(d.o)
        const close = parseFloat(d.c)
        const pct   = open > 0 ? ((close - open) / open) * 100 : 0

        const ticker: TickerData = {
          symbol:             d.s,
          price:              close,
          priceChangePercent: pct,
          high:               parseFloat(d.h),
          low:                parseFloat(d.l),
          volume:             parseFloat(d.v),
          quoteVolume:        parseFloat(d.q),
          openPrice:          open,
          closeTime:          d.E,
        }

        setTickers((prev) => {
          const next = new Map(prev)
          next.set(d.s, ticker)
          return next
        })
      } catch {
        // ignore malformed messages
      }
    }

    ws.onerror = () => {
      ws.close()
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      if (retries.current < MAX_RETRIES) {
        const delay = BASE_DELAY * 2 ** retries.current
        retries.current++
        timerRef.current = setTimeout(connect, delay)
      }
    }
  }, [])

  // (Re)connect whenever the symbol list changes meaningfully
  const keyRef = useRef('')
  useEffect(() => {
    const key = [...symbols].sort().join(',')
    if (key === keyRef.current) return
    keyRef.current = key

    // Close previous connection
    if (wsRef.current) {
      wsRef.current.onclose = null // prevent retry loop
      wsRef.current.close()
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    retries.current = 0

    if (symbols.length > 0) connect()

    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(',')])

  return tickers
}
