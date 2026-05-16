'use client'

import { useEffect, useRef, useState } from 'react'
import { klineFeed, type KlineCandle, type KlineInterval } from '@/lib/ws/klineFeed'
import type { OHLCData } from '@/types/crypto'

export type { KlineInterval }

export function useKlineStream(
  base:     OHLCData[],
  symbol:   string | null | undefined,
  interval: KlineInterval = '1d',
  enabled   = true,
) {
  const [liveCandle, setLiveCandle] = useState<KlineCandle | null>(null)
  const [isLive,     setIsLive]     = useState(false)
  const mounted = useRef(true)

  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  useEffect(() => {
    if (!symbol || !enabled) { setLiveCandle(null); setIsLive(false); return }

    const unsub = klineFeed.subscribe(symbol.toUpperCase(), interval, (candle) => {
      if (!mounted.current) return
      setLiveCandle(candle)
      setIsLive(true)
    })
    return () => { unsub(); if (mounted.current) setIsLive(false) }
  }, [symbol, interval, enabled])

  const merged: OHLCData[] = (() => {
    if (!liveCandle) return base
    const live: OHLCData = [
      liveCandle.openTime,
      liveCandle.open,
      liveCandle.high,
      liveCandle.low,
      liveCandle.close,
    ]
    if (base.length === 0) return [live]
    const last = base[base.length - 1]
    if (liveCandle.openTime >= last[0]) {
      return [...base.slice(0, -1), live]
    }
    return [...base, live]
  })()

  return { candles: merged, liveCandle, isLive }
}
