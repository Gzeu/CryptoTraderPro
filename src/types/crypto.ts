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
// Binance-specific Types
// -----------------------------------------------------------------------------

export interface OrderBookData {
  lastUpdateId: number
  bids: Array<{
    price: number
    quantity: number
  }>
  asks: Array<{
    price: number
    quantity: number
  }>
}

export interface TradeData {
  id: number
  price: number
  quantity: number
  time: number
  isBuyerMaker: boolean
  isBestMatch: boolean
}

export interface Binance24hrStats {
  symbol: string
  priceChange: number
  priceChangePercent: number
  weightedAvgPrice: number
  prevClosePrice: number
  lastPrice: number
  lastQty: number
  bidPrice: number
  askPrice: number
  openPrice: number
  highPrice: number
  lowPrice: number
  volume: number
  quoteVolume: number
  openTime: number
  closeTime: number
  count: number
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
  image?: string
}

export interface Portfolio {
  id: string
  name: string
  description?: string
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
  type: 'buy' | 'sell' | 'transfer_in' | 'transfer_out'
  coinId: string
  symbol: string
  name: string
  amount: number
  price: number
  total: number
  fees?: number
  exchange?: string
  notes?: string
  timestamp: string
}

// -----------------------------------------------------------------------------
// Watchlist & Alerts
// -----------------------------------------------------------------------------

export interface WatchlistItem {
  id: string
  coinId: string
  symbol: string
  name: string
  image?: string
  category?: string
  notes?: string
  addedAt: string
  currentPrice?: number
  priceChange24h?: number
}

export interface PriceAlert {
  id: string
  coinId: string
  symbol: string
  name: string
  type: 'above' | 'below' | 'percent_change'
  targetPrice: number
  basePrice?: number // For percent_change alerts
  currentPrice?: number
  enabled: boolean
  triggered: boolean
  createdAt: string
  triggeredAt?: string
  notificationSent?: boolean
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
// Portfolio Analytics
// -----------------------------------------------------------------------------

export interface PortfolioAnalytics {
  totalValue: number
  totalCost: number
  totalPnl: number
  totalPnlPercent: number
  dayChange: number
  dayChangePercent: number
  bestPerformer: {
    coinId: string
    symbol: string
    pnlPercent: number
  } | null
  worstPerformer: {
    coinId: string
    symbol: string
    pnlPercent: number
  } | null
  diversificationScore: number
  riskLevel: 'low' | 'medium' | 'high'
}

export interface PortfolioHistory {
  date: string
  totalValue: number
  totalPnl: number
  totalPnlPercent: number
}

// -----------------------------------------------------------------------------
// Notifications
// -----------------------------------------------------------------------------

export interface Notification {
  id: string
  type: 'price_alert' | 'news' | 'portfolio' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
  coinId?: string
  metadata?: Record<string, any>
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
  type: 'price_update' | 'kline_update' | 'error' | 'connection'
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

export interface BinanceWebSocketKline {
  t: number // Kline start time
  T: number // Kline close time
  s: string // Symbol
  i: string // Interval
  o: string // Open price
  c: string // Close price
  h: string // High price
  l: string // Low price
  v: string // Volume
  x: boolean // Is this kline closed?
}

// -----------------------------------------------------------------------------
// UI State Types
// -----------------------------------------------------------------------------

export interface ChartConfig {
  interval: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d' | '3d' | '1w' | '1M'
  type: 'candlestick' | 'line' | 'area'
  indicators: string[]
  theme: 'light' | 'dark'
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  currency: 'usd' | 'eur' | 'btc' | 'eth'
  refreshInterval: number
  enableNotifications: boolean
  enableSounds: boolean
  compactMode: boolean
  defaultChartInterval: ChartConfig['interval']
  language: 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko'
}

// -----------------------------------------------------------------------------
// Trading Types (Future Implementation)
// -----------------------------------------------------------------------------

export interface Order {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop_limit'
  quantity: number
  price?: number
  stopPrice?: number
  status: 'pending' | 'filled' | 'cancelled' | 'rejected'
  createdAt: string
  executedAt?: string
}

export interface Balance {
  asset: string
  free: number
  locked: number
  total: number
  usdValue: number
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

// -----------------------------------------------------------------------------
// Utility Types
// -----------------------------------------------------------------------------

export type TimeFrame = '1h' | '24h' | '7d' | '30d' | '1y' | 'all'
export type SortDirection = 'asc' | 'desc'
export type CoinSortField = 'market_cap' | 'price' | 'volume' | 'change_24h' | 'name'

export interface TableFilters {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  minMarketCap?: number
  maxMarketCap?: number
  sortField?: CoinSortField
  sortDirection?: SortDirection
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}