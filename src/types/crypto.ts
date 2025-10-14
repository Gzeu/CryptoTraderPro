// =============================================================================
// CryptoTraderPro - Type Definitions
// =============================================================================

// -----------------------------------------------------------------------------
// Core Cryptocurrency Types
// -----------------------------------------------------------------------------

export interface CryptoCoin {
  id: string
  symbol: string
  name: string
  image?: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation?: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply?: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  last_updated: string
  price_change_percentage_1h_in_currency?: number
  price_change_percentage_7d_in_currency?: number
  price_change_percentage_30d_in_currency?: number
}

// -----------------------------------------------------------------------------
// TradingView Chart Data
// -----------------------------------------------------------------------------

export interface CandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface LineData {
  time: number
  value: number
}

export interface PriceUpdate {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  timestamp: number
}

// -----------------------------------------------------------------------------
// Portfolio Management
// -----------------------------------------------------------------------------

export interface PortfolioAsset {
  id: string
  coinId: string
  symbol: string
  name: string
  amount: number
  avgBuyPrice: number
  currentPrice: number
  value: number
  pnl: number
  pnlPercent: number
  allocation: number
  lastUpdated: string
}

export interface Portfolio {
  id: string
  name: string
  totalValue: number
  totalPnl: number
  totalPnlPercent: number
  assets: PortfolioAsset[]
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  portfolioId: string
  type: 'buy' | 'sell'
  coinId: string
  symbol: string
  amount: number
  price: number
  total: number
  fees?: number
  notes?: string
  timestamp: string
}

// -----------------------------------------------------------------------------
// Market Data & Analytics
// -----------------------------------------------------------------------------

export interface MarketOverview {
  totalMarketCap: number
  totalVolume24h: number
  marketCapChange24h: number
  volumeChange24h: number
  bitcoinDominance: number
  activeCoins: number
  markets: number
  fearGreedIndex?: number
}

export interface TrendingCoin {
  id: string
  coin_id: number
  name: string
  symbol: string
  market_cap_rank: number
  thumb: string
  small: string
  large: string
  slug: string
  price_btc: number
  score: number
}

export interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  imageUrl?: string
  source: string
  publishedAt: string
  sentiment?: 'positive' | 'negative' | 'neutral'
}

// -----------------------------------------------------------------------------
// Alerts & Notifications
// -----------------------------------------------------------------------------

export interface PriceAlert {
  id: string
  coinId: string
  symbol: string
  name: string
  condition: 'above' | 'below'
  targetPrice: number
  currentPrice: number
  isActive: boolean
  triggered: boolean
  createdAt: string
  triggeredAt?: string
}

export interface Notification {
  id: string
  type: 'price_alert' | 'news' | 'portfolio' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface CoinGeckoResponse<T> {
  data: T
  status: {
    timestamp: string
    error_code: number
    error_message?: string
  }
}

export interface BinanceTickerResponse {
  symbol: string
  priceChange: string
  priceChangePercent: string
  weightedAvgPrice: string
  prevClosePrice: string
  lastPrice: string
  lastQty: string
  bidPrice: string
  bidQty: string
  askPrice: string
  askQty: string
  openPrice: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
  openTime: number
  closeTime: number
  firstId: number
  lastId: number
  count: number
}

// -----------------------------------------------------------------------------
// WebSocket Types
// -----------------------------------------------------------------------------

export interface WebSocketMessage {
  type: 'price_update' | 'error' | 'connection'
  data: any
  timestamp: number
}

export interface BinanceWebSocketTicker {
  e: string // Event type
  E: number // Event time
  s: string // Symbol
  c: string // Close price
  C: number // Close time
  o: string // Open price
  h: string // High price
  l: string // Low price
  v: string // Volume
  q: string // Quote volume
  P: string // Price change percent
  p: string // Price change
}

// -----------------------------------------------------------------------------
// UI State Types
// -----------------------------------------------------------------------------

export interface ChartConfig {
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'
  type: 'candlestick' | 'line' | 'area'
  indicators: string[]
  theme: 'light' | 'dark'
}

export interface WatchlistItem {
  coinId: string
  symbol: string
  name: string
  addedAt: string
  alertsEnabled: boolean
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  currency: 'usd' | 'eur' | 'btc'
  refreshInterval: number
  enableNotifications: boolean
  enableSounds: boolean
  compactMode: boolean
  defaultChartInterval: ChartConfig['interval']
}

// -----------------------------------------------------------------------------
// Error Types
// -----------------------------------------------------------------------------

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
}

export interface ErrorState {
  hasError: boolean
  error?: ApiError
  retryCount: number
  lastRetry?: string
}