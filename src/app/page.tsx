'use client'

// =============================================================================
// CryptoTraderPro - Main Dashboard Page
// =============================================================================

import React, { useState, useEffect } from 'react'
import { 
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  BarChart3Icon,
  RefreshCwIcon,
  AlertCircleIcon,
  StarIcon,
  EyeIcon,
  SearchIcon
} from 'lucide-react'
import TradingViewChart from '@/components/charts/TradingViewChart'
import WatchlistTable from '@/components/dashboard/WatchlistTable'
import { getTopCoins, getGlobalMarketData, formatNumber, formatPercentage } from '@/lib/api/coinGecko'
import { cn, formatCurrency, formatTimeAgo } from '@/lib/utils'
import type { CryptoCoin, MarketOverview, CandlestickData } from '@/types/crypto'

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
            {formatPercentage(Math.abs(change))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [coins, setCoins] = useState<CryptoCoin[]>([])
  const [marketData, setMarketData] = useState<MarketOverview | null>(null)
  const [selectedCoin, setSelectedCoin] = useState<CryptoCoin | null>(null)
  const [chartData, setChartData] = useState<CandlestickData[]>([])
  const [watchlistIds, setWatchlistIds] = useState<string[]>(['bitcoin', 'ethereum', 'binancecoin'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)

  // Fetch initial data
  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      
      const [coinsData, globalData] = await Promise.all([
        getTopCoins({ limit: 100 }),
        getGlobalMarketData()
      ])
      
      setCoins(coinsData)
      setMarketData(globalData)
      setLastUpdated(new Date())
      setError(null)
      
      // Set initial selected coin to Bitcoin
      if (!selectedCoin && coinsData.length > 0) {
        const bitcoin = coinsData.find(coin => coin.id === 'bitcoin') || coinsData[0]
        setSelectedCoin(bitcoin)
        
        // Generate sample chart data for demo
        const sampleChartData: CandlestickData[] = Array.from({ length: 100 }, (_, i) => {
          const time = Date.now() - (100 - i) * 3600000 // 1 hour intervals
          const basePrice = bitcoin.current_price
          const volatility = basePrice * 0.02 // 2% volatility
          const open = basePrice + (Math.random() - 0.5) * volatility
          const close = open + (Math.random() - 0.5) * volatility
          const high = Math.max(open, close) + Math.random() * volatility * 0.5
          const low = Math.min(open, close) - Math.random() * volatility * 0.5
          const volume = Math.random() * 1000000
          
          return { time, open, high, low, close, volume }
        })
        
        setChartData(sampleChartData)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch market data. Please try again later.')
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleCoinSelect = (coin: CryptoCoin) => {
    setSelectedCoin(coin)
    // In a real app, you would fetch actual chart data here
    console.log('Selected coin:', coin.name)
  }

  const handleAddToWatchlist = (coinId: string) => {
    setWatchlistIds(prev => [...prev, coinId])
  }

  const handleRemoveFromWatchlist = (coinId: string) => {
    setWatchlistIds(prev => prev.filter(id => id !== coinId))
  }

  const handleRefresh = () => {
    fetchData(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>
          
          {/* Stats skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted animate-pulse rounded-md" />
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Chart and table skeleton */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
            </div>
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
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
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
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
          <div className="text-sm text-muted-foreground">
            Last updated: {formatTimeAgo(lastUpdated)}
          </div>
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
                  <span className="text-2xl font-bold">
                    {formatCurrency(selectedCoin.current_price)}
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
                    {formatPercentage(selectedCoin.price_change_percentage_24h)}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Chart */}
          <TradingViewChart
            data={chartData}
            type="candlestick"
            height={400}
            symbol={selectedCoin?.symbol.toUpperCase()}
            theme="dark"
            enableVolume
          />
        </div>

        {/* Watchlist */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Top Cryptocurrencies</h2>
            <StarIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <WatchlistTable
            coins={coins.slice(0, 20)} // Show top 20
            onCoinSelect={handleCoinSelect}
            onAddToWatchlist={handleAddToWatchlist}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
            watchlistIds={watchlistIds}
            compact
            className="h-[500px] overflow-hidden"
          />
        </div>
      </div>
    </div>
  )
}