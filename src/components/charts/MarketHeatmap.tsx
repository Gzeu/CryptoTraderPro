// =============================================================================
// Market Heatmap - Visual representation of market performance
// =============================================================================

'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MarketData {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
}

interface MarketHeatmapProps {
  data: MarketData[]
  metric?: 'change24h' | 'volume24h' | 'marketCap'
  minSize?: number
  maxSize?: number
}

export function MarketHeatmap({
  data,
  metric = 'change24h',
  minSize = 80,
  maxSize = 200
}: MarketHeatmapProps) {
  const heatmapData = useMemo(() => {
    if (data.length === 0) return []

    // Calculate sizes based on market cap
    const marketCaps = data.map(d => d.marketCap)
    const minMarketCap = Math.min(...marketCaps)
    const maxMarketCap = Math.max(...marketCaps)

    return data.map(item => {
      // Normalize size based on market cap
      const normalizedSize = minSize + 
        ((item.marketCap - minMarketCap) / (maxMarketCap - minMarketCap)) * 
        (maxSize - minSize)

      // Get color based on 24h change
      const getColor = (change: number) => {
        if (change > 10) return 'bg-green-600'
        if (change > 5) return 'bg-green-500'
        if (change > 0) return 'bg-green-400'
        if (change > -5) return 'bg-red-400'
        if (change > -10) return 'bg-red-500'
        return 'bg-red-600'
      }

      // Get opacity based on volume
      const volumes = data.map(d => d.volume24h)
      const minVolume = Math.min(...volumes)
      const maxVolume = Math.max(...volumes)
      const normalizedVolume = 
        (item.volume24h - minVolume) / (maxVolume - minVolume)
      const opacity = 0.5 + (normalizedVolume * 0.5)

      return {
        ...item,
        size: normalizedSize,
        color: getColor(item.change24h),
        opacity
      }
    }).sort((a, b) => b.marketCap - a.marketCap)
  }, [data, minSize, maxSize])

  const formatNumber = (num: number, type: 'price' | 'percent' | 'large') => {
    if (type === 'price') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num)
    }
    if (type === 'percent') {
      return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
    }
    // Large numbers (market cap, volume)
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  if (heatmapData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8">
        <p className="text-sm text-muted-foreground">
          No market data available
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Market Heatmap</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500" />
            <span>Gainers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500" />
            <span>Losers</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap gap-2">
          {heatmapData.map((item) => (
            <div
              key={item.id}
              className={`group relative flex flex-col justify-between rounded-lg p-3 transition-all hover:scale-105 hover:shadow-lg ${item.color}`}
              style={{
                width: `${item.size}px`,
                height: `${item.size}px`,
                opacity: item.opacity
              }}
            >
              {/* Symbol */}
              <div className="flex items-start justify-between">
                <span className="text-sm font-bold text-white">
                  {item.symbol}
                </span>
                {item.change24h >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-white" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-white" />
                )}
              </div>

              {/* Change */}
              <div className="text-xs font-semibold text-white">
                {formatNumber(item.change24h, 'percent')}
              </div>

              {/* Tooltip */}
              <div className="invisible absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-lg border border-border bg-card p-3 text-foreground shadow-xl group-hover:visible">
                <p className="font-semibold">{item.name}</p>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">
                      {formatNumber(item.price, 'price')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h:</span>
                    <span className={`font-medium ${
                      item.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatNumber(item.change24h, 'percent')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Cap:</span>
                    <span className="font-medium">
                      {formatNumber(item.marketCap, 'large')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume:</span>
                    <span className="font-medium">
                      {formatNumber(item.volume24h, 'large')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-lg bg-muted/50 p-3 text-xs">
        <p className="font-medium text-muted-foreground">
          💡 Tip: Size represents market cap, color represents 24h change, opacity represents volume
        </p>
      </div>
    </div>
  )
}
