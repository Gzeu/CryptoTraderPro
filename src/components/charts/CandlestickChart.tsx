'use client'

import { useEffect, useRef } from 'react'
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  ColorType,
  CandlestickSeries,
} from 'lightweight-charts'
import { type OHLCBar } from '@/lib/api/coingecko'

interface Props {
  data:   OHLCBar[]
  height?: number
  isDark?: boolean
}

export function CandlestickChart({ data, height = 280, isDark = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef     = useRef<IChartApi | null>(null)
  const seriesRef    = useRef<ISeriesApi<'Candlestick'> | null>(null)

  const bg      = isDark ? '#1e293b' : '#ffffff'
  const grid    = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const text    = isDark ? '#94a3b8' : '#64748b'
  const upColor = '#4ade80'
  const dnColor = '#f87171'

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      width:  containerRef.current.clientWidth,
      height,
      layout: { background: { type: ColorType.Solid, color: bg }, textColor: text },
      grid:   { vertLines: { color: grid }, horzLines: { color: grid } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
    })
    chartRef.current = chart

    const series = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor:   dnColor,
      borderVisible: false,
      wickUpColor:   upColor,
      wickDownColor: dnColor,
    })
    seriesRef.current = series

    if (data.length) {
      const formatted = data.map(bar => ({
        time:  Math.floor(bar.time / 1000) as unknown as import('lightweight-charts').Time,
        open:  bar.open,
        high:  bar.high,
        low:   bar.low,
        close: bar.close,
      }))
      series.setData(formatted)
      chart.timeScale().fitContent()
    }

    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width
      if (w) chart.applyOptions({ width: w })
    })
    ro.observe(containerRef.current)

    return () => { ro.disconnect(); chart.remove() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update data & theme without remounting
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return
    chartRef.current.applyOptions({
      layout: { background: { type: ColorType.Solid, color: bg }, textColor: text },
      grid:   { vertLines: { color: grid }, horzLines: { color: grid } },
    })
  }, [isDark, bg, text, grid])

  useEffect(() => {
    if (!seriesRef.current || !data.length) return
    const formatted = data.map(bar => ({
      time:  Math.floor(bar.time / 1000) as unknown as import('lightweight-charts').Time,
      open:  bar.open,
      high:  bar.high,
      low:   bar.low,
      close: bar.close,
    }))
    seriesRef.current.setData(formatted)
    chartRef.current?.timeScale().fitContent()
  }, [data])

  return <div ref={containerRef} style={{ width: '100%', height, borderRadius: '0.5rem', overflow: 'hidden' }} />
}
