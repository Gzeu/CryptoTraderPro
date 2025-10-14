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
import Header from '@/components/layout/Header'
import { usePriceData } from '@/hooks/usePriceData'
import { useSettingsStore } from '@/store/settingsStore'
import { getGlobalMarketData, formatNumber } from '@/lib/api/coinGecko'
import { cn, formatTimeAgo } from '@/lib/utils'
import type { MarketOverview, CandlestickData } from '@/types/crypto'

interface MarketStatsCardProps {
  title: string
  value: string
  change?: number
  icon: React.ReactNode
  loading?: boolean
}

function MarketStatsCard({ title, value, change, icon, loading }: MarketStatsCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <div className="h-6 w-24 bg-muted animate-pulse rounded mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
        </div>
        {change !== undefined && !loading && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            change >= 0 ? "text-bullish" : "text-bearish"
          )}>
            {change >= 0 ? (
              <TrendingUpIcon className="h-4 w-4" />
            ) : (
              <TrendingDownIcon className="h-4 w-4" />
            )}
            {Math.abs(change).toFixed(2)}%
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { coins, loading, error, lastUpdated, refresh, getChartData } = usePriceData({
    refreshInterval: 30000,
    limit: 100
  })
  
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useSettingsStore()
  
  const [marketData, setMarketData] = useState<MarketOverview | null>(null)
  const [selectedCoin, setSelectedCoin] = useState(coins[0] || null)
  const [chartData, setChartData] = useState<CandlestickData[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)

  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await getGlobalMarketData()
        setMarketData(data)
      } catch (err) {
        console.error('Error fetching market data:', err)
      }
    }
    
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000) // Every minute
    return () => clearInterval(interval)
  }, [])

  // Set initial selected coin
  useEffect(() => {
    if (coins.length > 0 && !selectedCoin) {
      const bitcoin = coins.find(coin => coin.id === 'bitcoin') || coins[0]
      setSelectedCoin(bitcoin)
    }
  }, [coins, selectedCoin])

  // Fetch chart data when selected coin changes
  useEffect(() => {
    if (!selectedCoin) return
    
    const fetchChart = async () => {
      setChartLoading(true)
      try {
        const data = await getChartData(selectedCoin.id, 7) // 7 days of data
        setChartData(data)
      } catch (err) {
        console.error('Error fetching chart data:', err)
        setChartData([])
      } finally {
        setChartLoading(false)
      }
    }
    
    fetchChart()
  }, [selectedCoin, getChartData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  const handleCoinSelect = (coin: typeof coins[0]) => {
    setSelectedCoin(coin)
  }

  const handleAddToWatchlist = (coinId: string) => {
    const coin = coins.find(c => c.id === coinId)
    if (coin) {
      addToWatchlist(coin.id, coin.symbol, coin.name)
    }
  }

  const handleRemoveFromWatchlist = (coinId: string) => {
    removeFromWatchlist(coinId)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <AlertCircleIcon className="h-16 w-16 text-bearish" />
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground text-center max-w-md">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Crypto Trading Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time cryptocurrency market data and portfolio tracking
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-sm text-muted-foreground">
                Last updated: {formatTimeAgo(lastUpdated)}
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md border bg-background hover:bg-muted transition-colors",
                refreshing && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCwIcon className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>

        {/* Market Stats */}
        {marketData && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MarketStatsCard
              title="Total Market Cap"
              value={formatNumber(marketData.totalMarketCap)}
              change={marketData.marketCapChange24h / marketData.totalMarketCap * 100}
              icon={<DollarSignIcon className="h-5 w-5" />}
            />
            <MarketStatsCard
              title="24h Volume"
              value={formatNumber(marketData.totalVolume24h)}
              icon={<BarChart3Icon className="h-5 w-5" />}
            />
            <MarketStatsCard
              title="Bitcoin Dominance"
              value={`${marketData.bitcoinDominance.toFixed(1)}%`}
              icon={<TrendingUpIcon className="h-5 w-5" />}
            />
            <MarketStatsCard
              title="Active Coins"
              value={marketData.activeCoins.toLocaleString()}
              icon={<EyeIcon className="h-5 w-5" />}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedCoin ? `${selectedCoin.name} (${selectedCoin.symbol.toUpperCase()})` : 'Price Chart'}
                </h2>
                {selectedCoin && (
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-2xl font-bold font-mono">
                      ${selectedCoin.current_price.toFixed(2)}
                    </span>
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      selectedCoin.price_change_percentage_24h >= 0 ? "text-bullish" : "text-bearish"
                    )}>
                      {selectedCoin.price_change_percentage_24h >= 0 ? (
                        <TrendingUpIcon className="h-4 w-4" />
                      ) : (
                        <TrendingDownIcon className="h-4 w-4" />
                      )}
                      {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}
                      {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Chart */}
            <div className="relative">
              {chartLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm text-muted-foreground">Loading chart...</span>
                  </div>
                </div>
              )}
              <TradingViewChart
                data={chartData}
                type="candlestick"
                height={400}
                symbol={selectedCoin?.symbol.toUpperCase()}
                theme="dark"
                enableVolume
              />
            </div>
          </div>

          {/* Watchlist */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Top Cryptocurrencies</h2>
              <span className="text-sm text-muted-foreground">
                {coins.length} coins
              </span>
            </div>
            
            <WatchlistTable
              coins={coins.slice(0, 20)}
              loading={loading}
              onCoinSelect={handleCoinSelect}
              onAddToWatchlist={handleAddToWatchlist}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              watchlistIds={watchlist.map(w => w.coinId)}
              compact
              className="h-[500px] overflow-auto"
            />
          </div>
        </div>
      </main>
    </div>
  )
}