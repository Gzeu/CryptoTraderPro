// =============================================================================
// Binance API Client
// =============================================================================

import axios from 'axios'
import type { CryptoCoin, CandlestickData, OrderBookData, TradeData } from '@/types/crypto'

const BINANCE_API_URL = process.env.NEXT_PUBLIC_BINANCE_API_URL || 'https://api.binance.com/api/v3'
const BINANCE_WS_URL = process.env.NEXT_PUBLIC_BINANCE_WS_URL || 'wss://stream.binance.com:9443/ws'
const API_KEY = process.env.NEXT_PUBLIC_BINANCE_API_KEY
const API_SECRET = process.env.NEXT_PUBLIC_BINANCE_SECRET_KEY

// Create axios instance with defaults
const api = axios.create({
  baseURL: BINANCE_API_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-MBX-APIKEY': API_KEY }),
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
 * Get current price for a symbol
 */
export const getPrice = async (symbol: string): Promise<number> => {
  const normalizedSymbol = symbol.toUpperCase()
  const cacheKey = `price-${normalizedSymbol}`
  
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const response = await api.get('/ticker/price', {
      params: { symbol: normalizedSymbol },
    })
    
    const price = parseFloat(response.data.price)
    setCachedData(cacheKey, price, 0.5) // Cache for 30 seconds
    return price
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    throw new Error(`Failed to fetch price for ${symbol}`)
  }
}

/**
 * Get 24hr ticker statistics
 */
export const get24hrStats = async (symbol: string) => {
  const normalizedSymbol = symbol.toUpperCase()
  const cacheKey = `24hr-${normalizedSymbol}`
  
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const response = await api.get('/ticker/24hr', {
      params: { symbol: normalizedSymbol },
    })
    
    const stats = {
      symbol: response.data.symbol,
      priceChange: parseFloat(response.data.priceChange),
      priceChangePercent: parseFloat(response.data.priceChangePercent),
      weightedAvgPrice: parseFloat(response.data.weightedAvgPrice),
      prevClosePrice: parseFloat(response.data.prevClosePrice),
      lastPrice: parseFloat(response.data.lastPrice),
      lastQty: parseFloat(response.data.lastQty),
      bidPrice: parseFloat(response.data.bidPrice),
      askPrice: parseFloat(response.data.askPrice),
      openPrice: parseFloat(response.data.openPrice),
      highPrice: parseFloat(response.data.highPrice),
      lowPrice: parseFloat(response.data.lowPrice),
      volume: parseFloat(response.data.volume),
      quoteVolume: parseFloat(response.data.quoteVolume),
      openTime: response.data.openTime,
      closeTime: response.data.closeTime,
      count: response.data.count,
    }
    
    setCachedData(cacheKey, stats, 1) // Cache for 1 minute
    return stats
  } catch (error) {
    console.error(`Error fetching 24hr stats for ${symbol}:`, error)
    throw new Error(`Failed to fetch 24hr stats for ${symbol}`)
  }
}

/**
 * Get all 24hr ticker statistics
 */
export const getAll24hrStats = async () => {
  const cacheKey = 'all-24hr-stats'
  
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const response = await api.get('/ticker/24hr')
    
    const stats = response.data.map((item: any) => ({
      symbol: item.symbol,
      priceChange: parseFloat(item.priceChange),
      priceChangePercent: parseFloat(item.priceChangePercent),
      lastPrice: parseFloat(item.lastPrice),
      volume: parseFloat(item.volume),
      quoteVolume: parseFloat(item.quoteVolume),
    }))
    
    setCachedData(cacheKey, stats, 2) // Cache for 2 minutes
    return stats
  } catch (error) {
    console.error('Error fetching all 24hr stats:', error)
    throw new Error('Failed to fetch all 24hr stats')
  }
}

/**
 * Get candlestick/kline data
 */
export const getKlines = async (
  symbol: string,
  interval: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M' = '1h',
  limit: number = 500
): Promise<CandlestickData[]> => {
  const normalizedSymbol = symbol.toUpperCase()
  const cacheKey = `klines-${normalizedSymbol}-${interval}-${limit}`
  
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const response = await api.get('/klines', {
      params: {
        symbol: normalizedSymbol,
        interval,
        limit: Math.min(limit, 1000), // Binance max limit
      },
    })
    
    const klines: CandlestickData[] = response.data.map((kline: any[]) => ({
      time: kline[0] / 1000, // Convert to seconds for TradingView
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }))
    
    const cacheDuration = interval.includes('m') ? 0.5 : 2 // 30s for minute intervals, 2min for others
    setCachedData(cacheKey, klines, cacheDuration)
    return klines
  } catch (error) {
    console.error(`Error fetching klines for ${symbol}:`, error)
    throw new Error(`Failed to fetch klines for ${symbol}`)
  }
}

/**
 * Get order book depth
 */
export const getOrderBook = async (
  symbol: string,
  limit: number = 100
): Promise<OrderBookData> => {
  const normalizedSymbol = symbol.toUpperCase()
  const cacheKey = `orderbook-${normalizedSymbol}-${limit}`
  
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const response = await api.get('/depth', {
      params: {
        symbol: normalizedSymbol,
        limit: Math.min(limit, 5000),
      },
    })
    
    const orderBook: OrderBookData = {
      lastUpdateId: response.data.lastUpdateId,
      bids: response.data.bids.map((bid: string[]) => ({
        price: parseFloat(bid[0]),
        quantity: parseFloat(bid[1]),
      })),
      asks: response.data.asks.map((ask: string[]) => ({
        price: parseFloat(ask[0]),
        quantity: parseFloat(ask[1]),
      })),
    }
    
    setCachedData(cacheKey, orderBook, 0.25) // Cache for 15 seconds
    return orderBook
  } catch (error) {
    console.error(`Error fetching order book for ${symbol}:`, error)
    throw new Error(`Failed to fetch order book for ${symbol}`)
  }
}

/**
 * Get recent trades
 */
export const getRecentTrades = async (
  symbol: string,
  limit: number = 100
): Promise<TradeData[]> => {
  const normalizedSymbol = symbol.toUpperCase()
  const cacheKey = `trades-${normalizedSymbol}-${limit}`
  
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const response = await api.get('/trades', {
      params: {
        symbol: normalizedSymbol,
        limit: Math.min(limit, 1000),
      },
    })
    
    const trades: TradeData[] = response.data.map((trade: any) => ({
      id: trade.id,
      price: parseFloat(trade.price),
      quantity: parseFloat(trade.qty),
      time: trade.time,
      isBuyerMaker: trade.isBuyerMaker,
      isBestMatch: trade.isBestMatch,
    }))
    
    setCachedData(cacheKey, trades, 0.5) // Cache for 30 seconds
    return trades
  } catch (error) {
    console.error(`Error fetching recent trades for ${symbol}:`, error)
    throw new Error(`Failed to fetch recent trades for ${symbol}`)
  }
}

/**
 * Get exchange info
 */
export const getExchangeInfo = async (symbol?: string) => {
  const cacheKey = symbol ? `exchange-info-${symbol.toUpperCase()}` : 'exchange-info-all'
  
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const params = symbol ? { symbol: symbol.toUpperCase() } : {}
    const response = await api.get('/exchangeInfo', { params })
    
    setCachedData(cacheKey, response.data, 60) // Cache for 1 hour
    return response.data
  } catch (error) {
    console.error('Error fetching exchange info:', error)
    throw new Error('Failed to fetch exchange info')
  }
}

/**
 * Get average price
 */
export const getAvgPrice = async (symbol: string): Promise<number> => {
  const normalizedSymbol = symbol.toUpperCase()
  const cacheKey = `avgprice-${normalizedSymbol}`
  
  const cached = getCachedData(cacheKey)
  if (cached) return cached
  
  try {
    const response = await api.get('/avgPrice', {
      params: { symbol: normalizedSymbol },
    })
    
    const avgPrice = parseFloat(response.data.price)
    setCachedData(cacheKey, avgPrice, 1) // Cache for 1 minute
    return avgPrice
  } catch (error) {
    console.error(`Error fetching average price for ${symbol}:`, error)
    throw new Error(`Failed to fetch average price for ${symbol}`)
  }
}

// -----------------------------------------------------------------------------
// WebSocket Connections
// -----------------------------------------------------------------------------

type WebSocketCallback = (data: any) => void

const wsConnections = new Map<string, WebSocket>()

/**
 * Subscribe to real-time price updates
 */
export const subscribeToPriceUpdates = (
  symbol: string,
  callback: WebSocketCallback
): () => void => {
  const normalizedSymbol = symbol.toLowerCase()
  const stream = `${normalizedSymbol}@ticker`
  
  if (wsConnections.has(stream)) {
    console.warn(`Already subscribed to ${stream}`)
    return () => unsubscribeFromPriceUpdates(symbol)
  }
  
  const ws = new WebSocket(`${BINANCE_WS_URL}/${stream}`)
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      callback({
        symbol: data.s,
        price: parseFloat(data.c),
        priceChange: parseFloat(data.p),
        priceChangePercent: parseFloat(data.P),
        high: parseFloat(data.h),
        low: parseFloat(data.l),
        volume: parseFloat(data.v),
        quoteVolume: parseFloat(data.q),
      })
    } catch (error) {
      console.error('Error parsing WebSocket data:', error)
    }
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
  
  ws.onclose = () => {
    console.log(`WebSocket connection closed for ${stream}`)
    wsConnections.delete(stream)
  }
  
  wsConnections.set(stream, ws)
  
  return () => unsubscribeFromPriceUpdates(symbol)
}

/**
 * Unsubscribe from price updates
 */
export const unsubscribeFromPriceUpdates = (symbol: string): void => {
  const normalizedSymbol = symbol.toLowerCase()
  const stream = `${normalizedSymbol}@ticker`
  
  const ws = wsConnections.get(stream)
  if (ws) {
    ws.close()
    wsConnections.delete(stream)
  }
}

/**
 * Subscribe to real-time kline/candlestick updates
 */
export const subscribeToKlineUpdates = (
  symbol: string,
  interval: string,
  callback: WebSocketCallback
): () => void => {
  const normalizedSymbol = symbol.toLowerCase()
  const stream = `${normalizedSymbol}@kline_${interval}`
  
  if (wsConnections.has(stream)) {
    console.warn(`Already subscribed to ${stream}`)
    return () => unsubscribeFromKlineUpdates(symbol, interval)
  }
  
  const ws = new WebSocket(`${BINANCE_WS_URL}/${stream}`)
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      const kline = data.k
      callback({
        time: kline.t / 1000,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v),
        isFinal: kline.x,
      })
    } catch (error) {
      console.error('Error parsing WebSocket data:', error)
    }
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
  
  ws.onclose = () => {
    console.log(`WebSocket connection closed for ${stream}`)
    wsConnections.delete(stream)
  }
  
  wsConnections.set(stream, ws)
  
  return () => unsubscribeFromKlineUpdates(symbol, interval)
}

/**
 * Unsubscribe from kline updates
 */
export const unsubscribeFromKlineUpdates = (symbol: string, interval: string): void => {
  const normalizedSymbol = symbol.toLowerCase()
  const stream = `${normalizedSymbol}@kline_${interval}`
  
  const ws = wsConnections.get(stream)
  if (ws) {
    ws.close()
    wsConnections.delete(stream)
  }
}

/**
 * Close all WebSocket connections
 */
export const closeAllWebSockets = (): void => {
  wsConnections.forEach((ws) => ws.close())
  wsConnections.clear()
}

/**
 * Clear all cached data
 */
export const clearCache = (): void => {
  cache.clear()
}