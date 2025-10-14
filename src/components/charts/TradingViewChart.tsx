'use client'

// =============================================================================
// TradingView Lightweight Charts Component
// =============================================================================

import React, { useEffect, useRef, useState } from 'react'
import { 
  createChart, 
  ColorType, 
  CrosshairMode,
  LineStyle,
  PriceScaleMode,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  type UTCTimestamp
} from 'lightweight-charts'
import { cn } from '@/lib/utils'
import type { CandlestickData as CandlestickDataType, ChartConfig } from '@/types/crypto'

interface TradingViewChartProps {
  data: CandlestickDataType[] | Array<{ time: number; value: number }>
  type?: 'candlestick' | 'line' | 'area'
  height?: number
  className?: string
  symbol?: string
  interval?: ChartConfig['interval']
  theme?: 'light' | 'dark'
  onCrosshairMove?: (price: number | null) => void
  autoSize?: boolean
  enableVolume?: boolean
}

export function TradingViewChart({
  data,
  type = 'candlestick',
  height = 400,
  className,
  symbol,
  interval = '1h',
  theme = 'dark',
  onCrosshairMove,
  autoSize = true,
  enableVolume = false,
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const mainSeriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line' | 'Area'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Chart colors based on theme
  const colors = {
    light: {
      backgroundColor: '#ffffff',
      lineColor: '#2962FF',
      textColor: '#191919',
      areaTopColor: '#2962FF',
      areaBottomColor: 'rgba(41, 98, 255, 0.28)',
      gridColor: '#e1e1e1',
      borderColor: '#cccccc',
      upColor: '#26a69a',
      downColor: '#ef5350',
      volumeColor: 'rgba(76, 175, 80, 0.3)',
    },
    dark: {
      backgroundColor: '#0a0a0a',
      lineColor: '#2962FF',
      textColor: '#d1d4dc',
      areaTopColor: '#2962FF',
      areaBottomColor: 'rgba(41, 98, 255, 0.28)',
      gridColor: '#1e1e1e',
      borderColor: '#2a2a2a',
      upColor: '#10B981', // Bullish green
      downColor: '#EF4444', // Bearish red
      volumeColor: 'rgba(34, 197, 94, 0.3)',
    }
  }

  const currentColors = colors[theme]

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: currentColors.backgroundColor },
        textColor: currentColors.textColor,
      },
      grid: {
        vertLines: { color: currentColors.gridColor },
        horzLines: { color: currentColors.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: currentColors.lineColor,
          style: LineStyle.Dashed,
        },
        horzLine: {
          width: 1,
          color: currentColors.lineColor,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: currentColors.borderColor,
        mode: PriceScaleMode.Normal,
      },
      timeScale: {
        borderColor: currentColors.borderColor,
        timeVisible: true,
        secondsVisible: interval === '1m' || interval === '5m',
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    })

    chartRef.current = chart

    // Add crosshair move handler
    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param) => {
        if (param.point && param.time) {
          const price = param.seriesData?.get(mainSeriesRef.current!)
          if (typeof price === 'object' && price && 'close' in price) {
            onCrosshairMove(price.close as number)
          } else if (typeof price === 'object' && price && 'value' in price) {
            onCrosshairMove(price.value as number)
          } else {
            onCrosshairMove(null)
          }
        } else {
          onCrosshairMove(null)
        }
      })
    }

    // Create main series based on type
    let mainSeries: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | ISeriesApi<'Area'>

    if (type === 'candlestick') {
      mainSeries = chart.addCandlestickSeries({
        upColor: currentColors.upColor,
        downColor: currentColors.downColor,
        borderDownColor: currentColors.downColor,
        borderUpColor: currentColors.upColor,
        wickDownColor: currentColors.downColor,
        wickUpColor: currentColors.upColor,
      })
    } else if (type === 'line') {
      mainSeries = chart.addLineSeries({
        color: currentColors.lineColor,
        lineWidth: 2,
      })
    } else {
      mainSeries = chart.addAreaSeries({
        topColor: currentColors.areaTopColor,
        bottomColor: currentColors.areaBottomColor,
        lineColor: currentColors.lineColor,
        lineWidth: 2,
      })
    }

    mainSeriesRef.current = mainSeries

    // Add volume series if enabled
    if (enableVolume && type === 'candlestick') {
      const volumeSeries = chart.addHistogramSeries({
        color: currentColors.volumeColor,
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      })
      volumeSeriesRef.current = volumeSeries
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && autoSize) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    if (autoSize) {
      window.addEventListener('resize', handleResize)
    }

    setIsLoading(false)

    return () => {
      if (autoSize) {
        window.removeEventListener('resize', handleResize)
      }
      chart.remove()
    }
  }, [type, theme, interval, autoSize, enableVolume, onCrosshairMove])

  // Update data when props change
  useEffect(() => {
    if (!mainSeriesRef.current || !data.length) return

    try {
      if (type === 'candlestick') {
        const candlestickData = (data as CandlestickDataType[]).map(item => ({
          time: (item.time / 1000) as UTCTimestamp, // Convert to seconds
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        })) as CandlestickData[]

        ;(mainSeriesRef.current as ISeriesApi<'Candlestick'>).setData(candlestickData)

        // Update volume data if available
        if (enableVolume && volumeSeriesRef.current) {
          const volumeData = (data as CandlestickDataType[]).map(item => ({
            time: (item.time / 1000) as UTCTimestamp,
            value: item.volume || 0,
            color: item.close >= item.open ? currentColors.upColor : currentColors.downColor,
          }))

          ;(volumeSeriesRef.current as ISeriesApi<'Histogram'>).setData(volumeData)
        }
      } else {
        const lineData = data.map(item => ({
          time: (item.time / 1000) as UTCTimestamp,
          value: 'value' in item ? item.value : ('close' in item ? item.close : 0),
        })) as LineData[]

        ;(mainSeriesRef.current as ISeriesApi<'Line' | 'Area'>).setData(lineData)
      }

      // Auto-fit content
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent()
      }
    } catch (error) {
      console.error('Error updating chart data:', error)
    }
  }, [data, type, theme, enableVolume])

  // Update chart size when height changes
  useEffect(() => {
    if (chartRef.current && !autoSize) {
      chartRef.current.applyOptions({ height })
    }
  }, [height, autoSize])

  return (
    <div 
      className={cn(
        'relative w-full rounded-lg border bg-card',
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200',
        className
      )}
      style={{ height: autoSize ? '100%' : height }}
    >
      {/* Chart Header */}
      {symbol && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <div className="rounded-md bg-background/80 px-3 py-1 backdrop-blur-sm">
            <span className="font-semibold text-foreground">{symbol}</span>
            <span className="ml-2 text-sm text-muted-foreground">{interval}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading chart...</span>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div 
        ref={chartContainerRef} 
        className="h-full w-full"
        style={{ minHeight: autoSize ? height : undefined }}
      />

      {/* No Data State */}
      {!isLoading && data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-muted-foreground">
              <svg
                className="mx-auto h-12 w-12 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">No chart data available</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TradingViewChart