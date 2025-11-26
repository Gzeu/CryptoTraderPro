// Live Price Chart Component with TradingView
'use client'
import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi } from 'lightweight-charts'
import { useBinanceKlineStream } from '@/hooks/useBinanceWebSocket'
import { getKlines } from '@/lib/api/binance'

interface Props {
  symbol: string
  interval?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  height?: number
}

export function LivePriceChart({ symbol, interval = '1h', height = 400 }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<IChartApi | null>(null)
  const [loading, setLoading] = useState(true)
  const { klineData, isConnected } = useBinanceKlineStream(symbol, interval, true)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height,
      layout: { background: { color: '#0a0a0a' }, textColor: '#d1d5db' },
      grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
    })

    const series = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    })

    chartInstanceRef.current = chart

    getKlines(symbol, interval, 100)
      .then(data => {
        series.setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    if (klineData) {
      series.update(klineData)
    }

    return () => chart.remove()
  }, [symbol, interval, height])

  useEffect(() => {
    if (klineData && chartInstanceRef.current) {
      // Update logic here
    }
  }, [klineData])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{symbol} {interval}</h3>
        {isConnected && <span className="text-xs text-green-500">● Live</span>}
      </div>
      <div ref={chartRef} className="rounded-xl border" />
      {loading && <p className="text-center text-sm">Loading...</p>}
    </div>
  )
}
