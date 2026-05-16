'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export interface WSPrice {
  symbol: string   // e.g. 'BTCUSDT'
  price:  number
  change: number   // 24h % change
}

type SymbolMap = Record<string, string>  // coinId -> binanceSymbol

// CoinGecko id → Binance symbol mapping for top coins
const ID_TO_SYMBOL: SymbolMap = {
  'bitcoin':          'BTCUSDT',
  'ethereum':         'ETHUSDT',
  'binancecoin':      'BNBUSDT',
  'solana':           'SOLUSDT',
  'ripple':           'XRPUSDT',
  'dogecoin':         'DOGEUSDT',
  'cardano':          'ADAUSDT',
  'avalanche-2':      'AVAXUSDT',
  'polkadot':         'DOTUSDT',
  'chainlink':        'LINKUSDT',
  'litecoin':         'LTCUSDT',
  'uniswap':          'UNIUSDT',
  'stellar':          'XLMUSDT',
  'elrond-erd-2':     'EGLDUSDT',
  'shiba-inu':        'SHIBUSDT',
  'near':             'NEARUSDT',
  'tron':             'TRXUSDT',
  'aptos':            'APTUSDT',
  'arbitrum':         'ARBUSDT',
  'optimism':         'OPUSDT',
}

export function coinIdToSymbol(id: string): string | null {
  return ID_TO_SYMBOL[id] ?? null
}

/**
 * Subscribes to Binance WebSocket mini-ticker stream for a list of coin IDs.
 * Returns a map of coinId → { symbol, price, change }.
 * Auto-reconnects on close/error with 2s backoff.
 */
export function useBinanceWS(coinIds: string[]): Record<string, WSPrice> {
  const [prices, setPrices] = useState<Record<string, WSPrice>>({})
  const wsRef      = useRef<WebSocket | null>(null)
  const retryRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeIds  = useRef<string[]>([])

  const symbols = coinIds
    .map(id => ID_TO_SYMBOL[id])
    .filter(Boolean) as string[]

  const connect = useCallback(() => {
    if (!symbols.length) return

    // Binance combined stream: /stream?streams=btcusdt@miniTicker/ethusdt@miniTicker/...
    const streams = symbols.map(s => `${s.toLowerCase()}@miniTicker`).join('/')
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string)
        const d = msg.data  // combined stream wraps in { stream, data }
        if (!d || d.e !== '24hrMiniTicker') return

        const sym  = d.s as string           // e.g. 'BTCUSDT'
        const price = parseFloat(d.c)         // close price
        const open  = parseFloat(d.o)         // open price (24h)
        const change = open > 0 ? ((price - open) / open) * 100 : 0

        // find coinId for this symbol
        const coinId = Object.entries(ID_TO_SYMBOL).find(([, v]) => v === sym)?.[0]
        if (!coinId) return

        setPrices(prev => ({
          ...prev,
          [coinId]: { symbol: sym, price, change },
        }))
      } catch { /* ignore parse errors */ }
    }

    ws.onerror = () => ws.close()
    ws.onclose = () => {
      wsRef.current = null
      // Reconnect after 2s
      retryRef.current = setTimeout(connect, 2000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(',')])

  useEffect(() => {
    const changed = JSON.stringify(coinIds.sort()) !== JSON.stringify(activeIds.current.sort())
    if (!changed) return
    activeIds.current = [...coinIds]

    // Close existing connection
    if (retryRef.current) clearTimeout(retryRef.current)
    wsRef.current?.close()
    setPrices({})

    connect()

    return () => {
      if (retryRef.current) clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [coinIds, connect])

  return prices
}
