'use client'

// =============================================================================
// EGLD Price Card — live WebSocket price with sparkline
// =============================================================================

import React, { useEffect, useRef } from 'react'
import { TrendingUpIcon, TrendingDownIcon, WifiIcon, WifiOffIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrency, formatPercentage } from '@/lib/utils'
import { useWebSocketPrice } from '@/hooks/useWebSocketPrice'
import { useMultiversXStore } from '@/store/multiversxStore'
import { createChart, type IChartApi, type ISeriesApi, type LineSeriesOptions } from 'lightweight-charts'

interface EgldPriceCardProps {
  priceHistory?: Array<{ timestamp: number; price: number }>
}

export function EgldPriceCard({ priceHistory = [] }: EgldPriceCardProps) {
  const { data, isConnected } = useWebSocketPrice('egldusdt')
  const setEgldPrice = useMultiversXStore((s) => s.setEgldPrice)

  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Line', LineSeriesOptions> | null>(null)

  // Sync live price to store
  useEffect(() => {
    if (data?.price) setEgldPrice(data.price)
  }, [data?.price, setEgldPrice])

  // Initialize sparkline
  useEffect(() => {
    if (!chartContainerRef.current || priceHistory.length === 0) return
    if (chartRef.current) return

    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 60,
      layout: { background: { color: 'transparent' }, textColor: 'transparent' },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      handleScroll: false,
      handleScale: false,
    })

    seriesRef.current = chartRef.current.addLineSeries({
      color: data && data.priceChangePercent >= 0 ? '#22c55e' : '#ef4444',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    const chartData = priceHistory.map(({ timestamp, price }) => ({
      time: Math.floor(timestamp / 1000) as unknown as import('lightweight-charts').Time,
      value: price,
    }))
    seriesRef.current.setData(chartData)
    chartRef.current.timeScale().fitContent()

    return () => {
      chartRef.current?.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [priceHistory, data])

  const isPositive = (data?.priceChangePercent ?? 0) >= 0

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span className="font-bold text-base">EGLD / USD</span>
            <span className="text-xs text-muted-foreground">MultiversX</span>
          </span>
          <span className={cn('flex items-center gap-1 text-xs', isConnected ? 'text-bullish' : 'text-muted-foreground')}>
            {isConnected ? <WifiIcon className="h-3 w-3" /> : <WifiOffIcon className="h-3 w-3" />}
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-2xl font-mono font-bold">
              {data ? formatCurrency(data.price) : '—'}
            </p>
            {data && (
              <div className={cn(
                'mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
                isPositive ? 'bg-bullish/10 text-bullish' : 'bg-bearish/10 text-bearish'
              )}>
                {isPositive ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />}
                {formatPercentage(data.priceChangePercent)}
              </div>
            )}
          </div>
          {data && (
            <div className="text-right text-xs text-muted-foreground">
              <div>H: {formatCurrency(data.high24h)}</div>
              <div>L: {formatCurrency(data.low24h)}</div>
            </div>
          )}
        </div>
        {priceHistory.length > 0 && (
          <div ref={chartContainerRef} className="w-full" style={{ height: 60 }} />
        )}
      </CardContent>
    </Card>
  )
}

export default EgldPriceCard
