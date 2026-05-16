'use client'

import React, { useState, useEffect, Suspense } from 'react'
import {
  TrendingUpIcon, TrendingDownIcon, DollarSignIcon,
  BarChart3Icon, RefreshCwIcon, AlertCircleIcon, EyeIcon
} from 'lucide-react'
import TradingViewChart from '@/components/charts/TradingViewChart'
import WatchlistTable from '@/components/dashboard/WatchlistTable'
import { SkeletonDashboard } from '@/components/ui/SkeletonDashboard'
import { usePriceData } from '@/hooks/usePriceData'
import { useSettingsStore } from '@/store/settingsStore'
import { getGlobalMarketData, formatNumber } from '@/lib/api/coinGecko'
import { cn, formatTimeAgo } from '@/lib/utils'
import type { MarketOverview, CandlestickData } from '@/types/crypto'

function Stat({ title, value, change, icon: Icon }: { title: string; value: string; change?: number; icon: any }) {
  return (
    <div className="card card-hover card-press glass compact-card">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-xl font-semibold tracking-tight tabular-nums">{value}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {change !== undefined && (
        <div className={cn(
          'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
          change >= 0 ? 'badge badge-green' : 'badge badge-red'
        )}>
          {change >= 0 ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />}
          {`${change >= 0 ? '+' : ''}${Math.abs(change).toFixed(2)}%`}
        </div>
      )}
    </div>
  )
}

function DashboardContent() {
  const { coins, loading, error, lastUpdated, refresh, getChartData } = usePriceData({ refreshInterval: 30000, limit: 100 })
  const { watchlist, addToWatchlist, removeFromWatchlist } = useSettingsStore()

  const [marketData, setMarketData] = useState<MarketOverview | null>(null)
  const [selectedCoin, setSelectedCoin] = useState<any>(null)
  const [chartData, setChartData] = useState<CandlestickData[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    const fetchMarketData = async () => { try { setMarketData(await getGlobalMarketData()) } catch {} }
    fetchMarketData()
    const id = setInterval(fetchMarketData, 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (coins.length > 0 && !selectedCoin) {
      // Default to EGLD if available, otherwise BTC
      setSelectedCoin(
        coins.find(c => c.id === 'elrond-erd-2') ||
        coins.find(c => c.id === 'bitcoin') ||
        coins[0]
      )
    }
  }, [coins, selectedCoin])

  useEffect(() => {
    if (!selectedCoin) return
    ;(async () => {
      setChartLoading(true)
      try { setChartData(await getChartData(selectedCoin.id, 7)) }
      finally { setChartLoading(false) }
    })()
  }, [selectedCoin, getChartData])

  const handleRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false) }

  if (loading && coins.length === 0) return <SkeletonDashboard />

  if (error) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircleIcon className="h-10 w-10 text-destructive" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold">Failed to load market data</h2>
          <p className="max-w-md text-center text-muted-foreground text-sm">{error}</p>
        </div>
        <button onClick={handleRefresh} className="btn btn-primary compact-btn">Try Again</button>
      </div>
    )
  }

  return (
    <div className="space-y-5 density-compact">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Market Overview</h1>
          <p className="text-sm text-muted-foreground">Real-time cryptocurrency data · updates every 30s</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="hidden sm:block text-xs text-muted-foreground">Updated {formatTimeAgo(lastUpdated)}</span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn('btn btn-outline compact-btn', refreshing && 'opacity-60')}
          >
            <RefreshCwIcon className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Market stats */}
      {marketData ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat title="Market Cap" value={formatNumber(marketData.totalMarketCap)} change={(marketData.marketCapChange24h / marketData.totalMarketCap) * 100} icon={DollarSignIcon} />
          <Stat title="24h Volume" value={formatNumber(marketData.totalVolume24h)} icon={BarChart3Icon} />
          <Stat title="BTC Dominance" value={`${marketData.bitcoinDominance.toFixed(1)}%`} icon={TrendingUpIcon} />
          <Stat title="Active Coins" value={marketData.activeCoins.toLocaleString()} icon={EyeIcon} />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card compact-card h-[90px] animate-pulse bg-secondary/40" />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-2">
          <div className="glass card compact-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold">
                  {selectedCoin ? `${selectedCoin.name} (${selectedCoin.symbol.toUpperCase()})` : 'Price Chart'}
                </h2>
                {selectedCoin && (
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-lg font-semibold tabular-nums">
                      ${selectedCoin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={cn('badge text-xs', selectedCoin.price_change_percentage_24h >= 0 ? 'badge-green' : 'badge-red')}>
                      {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}
                      {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              {chartLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading chart...
                  </div>
                </div>
              )}
              <TradingViewChart
                data={chartData}
                type="candlestick"
                height={380}
                symbol={selectedCoin?.symbol.toUpperCase()}
                theme="dark"
                enableVolume
              />
            </div>
          </div>
        </div>

        {/* Watchlist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Top Cryptocurrencies</h2>
            <span className="badge badge-muted">{coins.length}</span>
          </div>
          <div className="glass card compact-card overflow-auto max-h-[460px]">
            <WatchlistTable
              coins={coins.slice(0, 25)}
              loading={loading}
              onCoinSelect={setSelectedCoin}
              onAddToWatchlist={(id) => { const coin = coins.find(c => c.id === id); if (coin) addToWatchlist(coin.id, coin.symbol, coin.name) }}
              onRemoveFromWatchlist={removeFromWatchlist}
              watchlistIds={watchlist.map(w => w.coinId)}
              compact
              className="compact-table"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <DashboardContent />
    </Suspense>
  )
}
