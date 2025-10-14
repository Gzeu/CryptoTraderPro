'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  BarChart3Icon,
  RefreshCwIcon,
  AlertCircleIcon,
  EyeIcon
} from 'lucide-react'

import TradingViewChart from '@/components/charts/TradingViewChart'
import WatchlistTable from '@/components/dashboard/WatchlistTable'
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
          <p className="text-[11px] font-medium text-muted-foreground">{title}</p>
          <p className="text-xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="rounded-md bg-primary/10 p-1.5 text-primary">
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

export default function DashboardPage() {
  const { coins, loading, error, lastUpdated, refresh, getChartData } = usePriceData({ refreshInterval: 30000, limit: 100 })
  const { watchlist, addToWatchlist, removeFromWatchlist } = useSettingsStore()

  const [marketData, setMarketData] = useState<MarketOverview | null>(null)
  const [selectedCoin, setSelectedCoin] = useState(coins[0] || null)
  const [chartData, setChartData] = useState<CandlestickData[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    const fetchMarketData = async () => { try { setMarketData(await getGlobalMarketData()) } catch {} }
    fetchMarketData(); const id = setInterval(fetchMarketData, 60000); return () => clearInterval(id)
  }, [])

  useEffect(() => { if (coins.length > 0 && !selectedCoin) setSelectedCoin(coins.find(c => c.id === 'bitcoin') || coins[0]) }, [coins, selectedCoin])

  useEffect(() => {
    if (!selectedCoin) return; (async () => { setChartLoading(true); try { setChartData(await getChartData(selectedCoin.id, 7)) } finally { setChartLoading(false) } })()
  }, [selectedCoin, getChartData])

  const handleRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false) }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 density-compact">
        <div className="flex min-h-[320px] flex-col items-center justify-center space-y-3">
          <AlertCircleIcon className="h-12 w-12 text-bearish" />
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="max-w-md text-center text-muted-foreground text-sm">{error}</p>
          <button onClick={handleRefresh} className="btn btn-primary compact-btn">Try Again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 density-compact">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crypto Trading Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time cryptocurrency market data and portfolio tracking</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="text-xs text-muted-foreground">Last updated: {formatTimeAgo(lastUpdated)}</div>
          )}
          <button onClick={handleRefresh} disabled={refreshing} className={cn('btn btn-outline compact-btn', refreshing && 'opacity-50')}> 
            <RefreshCwIcon className={cn('h-4 w-4', refreshing && 'animate-spin')} /> Refresh
          </button>
        </div>
      </div>

      {/* Market stats */}
      {marketData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat title="Total Market Cap" value={formatNumber(marketData.totalMarketCap)} change={(marketData.marketCapChange24h / marketData.totalMarketCap) * 100} icon={DollarSignIcon} />
          <Stat title="24h Volume" value={formatNumber(marketData.totalVolume24h)} icon={BarChart3Icon} />
          <Stat title="Bitcoin Dominance" value={`${marketData.bitcoinDominance.toFixed(1)}%`} icon={TrendingUpIcon} />
          <Stat title="Active Coins" value={marketData.activeCoins.toLocaleString()} icon={EyeIcon} />
        </div>
      )}

      {/* Content */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chart Section */}
        <div className="space-y-3 lg:col-span-2">
          <div className="glass card compact-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedCoin ? `${selectedCoin.name} (${selectedCoin.symbol.toUpperCase()})` : 'Price Chart'}
                </h2>
                {selectedCoin && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-xl font-semibold">${selectedCoin.current_price.toFixed(2)}</span>
                    <span className={cn('badge', selectedCoin.price_change_percentage_24h >= 0 ? 'badge-green' : 'badge-red')}>
                      {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}
                      {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="relative mt-3">
              {chartLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading chart...
                  </div>
                </div>
              )}
              <TradingViewChart data={chartData} type="candlestick" height={380} symbol={selectedCoin?.symbol.toUpperCase()} theme="dark" enableVolume />
            </div>
          </div>
        </div>

        {/* Watchlist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top Cryptocurrencies</h2>
            <span className="text-xs text-muted-foreground">{coins.length} coins</span>
          </div>
          <div className="glass card compact-card">
            <div className="overflow-auto">
              <div className="min-w-full">
                <WatchlistTable
                  coins={coins.slice(0, 20)}
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
      </div>
    </div>
  )
}
