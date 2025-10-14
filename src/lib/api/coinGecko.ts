// =============================================================================
// CoinGecko API Client
// =============================================================================

import axios from 'axios'
import type { CryptoCoin, TrendingCoin, MarketOverview } from '@/types/crypto'

const COINGECKO_API_URL = process.env.NEXT_PUBLIC_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3'
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY

// Create axios instance with defaults
const api = axios.create({
  baseURL: COINGECKO_API_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(API_KEY && { 'x-cg-demo-api-key': API_KEY }),
  },
})

// Simple in-memory cache
interface CacheItem {
  data: any
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheItem>()

const getCachedData = (key: string): any | null => {
  const item = cache.get(key)
  if (item && Date.now() - item.timestamp < item.ttl) {
    return item.data
  }
  cache.delete(key)
  return null
}

const setCachedData = (key: string, data: any, ttlMinutes: number = 5) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMinutes * 60 * 1000,
  })
}

// -----------------------------------------------------------------------------
// API Methods
// -----------------------------------------------------------------------------

/**
 * Get top coins by market cap
 */
export const getTopCoins = async (params: {
  limit?: number
  currency?: string
  sparkline?: boolean
} = {}): Promise<CryptoCoin[]> => {
  const { limit = 100, currency = 'usd', sparkline = false } = params
  const cacheKey = `top-coins-${limit}-${currency}-${sparkline}`
  
  // Check cache first
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const response = await api.get('/coins/markets', {
      params: {
        vs_currency: currency,
        order: 'market_cap_desc',
        per_page: Math.min(limit, 250), // CoinGecko max per page
        page: 1,
        sparkline,
        price_change_percentage: '1h,24h,7d,30d',
        locale: 'en',
      },
    })
    
    const coins: CryptoCoin[] = response.data
    setCachedData(cacheKey, coins, 3) // Cache for 3 minutes
    return coins
  } catch (error) {
    console.error('Error fetching top coins:', error)
    throw new Error('Failed to fetch cryptocurrency data')
  }
}

/**
 * Get specific coin data by ID
 */
export const getCoinById = async (coinId: string, currency: string = 'usd'): Promise<CryptoCoin> => {
  const cacheKey = `coin-${coinId}-${currency}`
  
  // Check cache first
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const response = await api.get(`/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
      },
    })
    
    // Transform detailed coin data to match CryptoCoin interface
    const coinData = response.data
    const coin: CryptoCoin = {
      id: coinData.id,
      symbol: coinData.symbol,
      name: coinData.name,
      image: coinData.image?.large,
      current_price: coinData.market_data.current_price[currency],
      market_cap: coinData.market_data.market_cap[currency],
      market_cap_rank: coinData.market_cap_rank,
      fully_diluted_valuation: coinData.market_data.fully_diluted_valuation?.[currency],
      total_volume: coinData.market_data.total_volume[currency],
      high_24h: coinData.market_data.high_24h[currency],
      low_24h: coinData.market_data.low_24h[currency],
      price_change_24h: coinData.market_data.price_change_24h_in_currency[currency],
      price_change_percentage_24h: coinData.market_data.price_change_percentage_24h,
      market_cap_change_24h: coinData.market_data.market_cap_change_24h_in_currency[currency],
      market_cap_change_percentage_24h: coinData.market_data.market_cap_change_percentage_24h,
      circulating_supply: coinData.market_data.circulating_supply,
      total_supply: coinData.market_data.total_supply,
      max_supply: coinData.market_data.max_supply,
      ath: coinData.market_data.ath[currency],
      ath_change_percentage: coinData.market_data.ath_change_percentage[currency],
      ath_date: coinData.market_data.ath_date[currency],
      atl: coinData.market_data.atl[currency],
      atl_change_percentage: coinData.market_data.atl_change_percentage[currency],
      atl_date: coinData.market_data.atl_date[currency],
      last_updated: coinData.last_updated,
      price_change_percentage_1h_in_currency: coinData.market_data.price_change_percentage_1h_in_currency?.[currency],
      price_change_percentage_7d_in_currency: coinData.market_data.price_change_percentage_7d_in_currency?.[currency],
      price_change_percentage_30d_in_currency: coinData.market_data.price_change_percentage_30d_in_currency?.[currency],
    }
    
    setCachedData(cacheKey, coin, 2) // Cache for 2 minutes
    return coin
  } catch (error) {
    console.error(`Error fetching coin ${coinId}:`, error)
    throw new Error(`Failed to fetch data for ${coinId}`)
  }
}

/**
 * Get trending coins
 */
export const getTrendingCoins = async (): Promise<TrendingCoin[]> => {
  const cacheKey = 'trending-coins'
  
  // Check cache first
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const response = await api.get('/search/trending')
    const trendingCoins: TrendingCoin[] = response.data.coins.map((item: any) => item.item)
    
    setCachedData(cacheKey, trendingCoins, 10) // Cache for 10 minutes
    return trendingCoins
  } catch (error) {
    console.error('Error fetching trending coins:', error)
    throw new Error('Failed to fetch trending coins')
  }
}

/**
 * Get global market data
 */
export const getGlobalMarketData = async (): Promise<MarketOverview> => {
  const cacheKey = 'global-market-data'
  
  // Check cache first
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const response = await api.get('/global')
    const globalData = response.data.data
    
    const marketOverview: MarketOverview = {
      totalMarketCap: globalData.total_market_cap.usd,
      totalVolume24h: globalData.total_volume.usd,
      marketCapChange24h: globalData.market_cap_change_24h_usd,
      volumeChange24h: 0, // Not provided by CoinGecko global endpoint
      bitcoinDominance: globalData.market_cap_percentage.btc,
      activeCoins: globalData.active_cryptocurrencies,
      markets: globalData.markets,
    }
    
    setCachedData(cacheKey, marketOverview, 5) // Cache for 5 minutes
    return marketOverview
  } catch (error) {
    console.error('Error fetching global market data:', error)
    throw new Error('Failed to fetch global market data')
  }
}

/**
 * Search coins by query
 */
export const searchCoins = async (query: string): Promise<Array<{id: string, name: string, symbol: string, thumb: string}>> => {
  if (!query || query.length < 2) return []
  
  const cacheKey = `search-${query.toLowerCase()}`
  
  // Check cache first
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const response = await api.get('/search', {
      params: { query },
    })
    
    const results = response.data.coins.slice(0, 10) // Limit to top 10 results
    setCachedData(cacheKey, results, 15) // Cache for 15 minutes
    return results
  } catch (error) {
    console.error('Error searching coins:', error)
    return []
  }
}

/**
 * Get historical price data (OHLC)
 */
export const getCoinHistory = async (
  coinId: string,
  days: number = 30,
  currency: string = 'usd'
): Promise<Array<[number, number, number, number, number]>> => {
  const cacheKey = `history-${coinId}-${days}-${currency}`
  
  // Check cache first
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const response = await api.get(`/coins/${coinId}/ohlc`, {
      params: {
        vs_currency: currency,
        days: Math.min(days, 365), // CoinGecko limit
      },
    })
    
    const ohlcData: Array<[number, number, number, number, number]> = response.data
    const cacheDuration = days > 7 ? 60 : 10 // Longer cache for historical data
    setCachedData(cacheKey, ohlcData, cacheDuration)
    return ohlcData
  } catch (error) {
    console.error(`Error fetching history for ${coinId}:`, error)
    throw new Error(`Failed to fetch historical data for ${coinId}`)
  }
}

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

/**
 * Format large numbers (market cap, volume, etc.)
 */
export const formatNumber = (num: number, currency: string = 'USD'): string => {
  if (num === 0) return '$0'
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    notation: 'compact',
    maximumFractionDigits: 2,
  })
  
  return formatter.format(num)
}

/**
 * Format percentage change
 */
export const formatPercentage = (percentage: number): string => {
  if (percentage === 0) return '0.00%'
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
}

/**
 * Clear all cached data
 */
export const clearCache = (): void => {
  cache.clear()
}