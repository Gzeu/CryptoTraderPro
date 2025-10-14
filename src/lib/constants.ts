// =============================================================================
// Application Constants
// =============================================================================

// -----------------------------------------------------------------------------
// API Configuration
// -----------------------------------------------------------------------------

export const API_ENDPOINTS = {
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    COINS_MARKETS: '/coins/markets',
    COIN_DETAIL: '/coins',
    GLOBAL: '/global',
    TRENDING: '/search/trending',
    SEARCH: '/search',
    OHLC: '/coins/{id}/ohlc',
  },
  BINANCE: {
    BASE_URL: 'https://api.binance.com/api/v3',
    WS_URL: 'wss://stream.binance.com:9443/ws',
    TICKER_24H: '/ticker/24hr',
    KLINES: '/klines',
  },
  CRYPTOCOMPARE: {
    BASE_URL: 'https://min-api.cryptocompare.com/data',
    PRICE: '/price',
    HISTOHOUR: '/v2/histohour',
    NEWS: '/v2/news',
  },
} as const

// -----------------------------------------------------------------------------
// Cryptocurrency Data
// -----------------------------------------------------------------------------

export const TOP_CRYPTOCURRENCIES = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
] as const

export const STABLE_COINS = [
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin' },
  { id: 'binance-usd', symbol: 'BUSD', name: 'Binance USD' },
  { id: 'dai', symbol: 'DAI', name: 'Dai' },
] as const

// -----------------------------------------------------------------------------
// Chart Configuration
// -----------------------------------------------------------------------------

export const CHART_INTERVALS = [
  { value: '1m', label: '1 Minute', duration: 60000 },
  { value: '5m', label: '5 Minutes', duration: 300000 },
  { value: '15m', label: '15 Minutes', duration: 900000 },
  { value: '1h', label: '1 Hour', duration: 3600000 },
  { value: '4h', label: '4 Hours', duration: 14400000 },
  { value: '1d', label: '1 Day', duration: 86400000 },
  { value: '1w', label: '1 Week', duration: 604800000 },
] as const

export const CHART_TYPES = [
  { value: 'candlestick', label: 'Candlestick', icon: '📊' },
  { value: 'line', label: 'Line', icon: '📈' },
  { value: 'area', label: 'Area', icon: '📉' },
] as const

// -----------------------------------------------------------------------------
// Application Settings
// -----------------------------------------------------------------------------

export const SUPPORTED_CURRENCIES = [
  { code: 'usd', symbol: '$', name: 'US Dollar' },
  { code: 'eur', symbol: '€', name: 'Euro' },
  { code: 'gbp', symbol: '£', name: 'British Pound' },
  { code: 'jpy', symbol: '¥', name: 'Japanese Yen' },
  { code: 'btc', symbol: '₿', name: 'Bitcoin' },
  { code: 'eth', symbol: 'Ξ', name: 'Ethereum' },
] as const

export const REFRESH_INTERVALS = [
  { value: 5000, label: '5 seconds' },
  { value: 10000, label: '10 seconds' },
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
  { value: 300000, label: '5 minutes' },
] as const

// -----------------------------------------------------------------------------
// UI Constants
// -----------------------------------------------------------------------------

export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const

// -----------------------------------------------------------------------------
// Cache Configuration
// -----------------------------------------------------------------------------

export const CACHE_KEYS = {
  TOP_COINS: 'top-coins',
  COIN_DETAIL: 'coin-detail',
  GLOBAL_DATA: 'global-data',
  TRENDING: 'trending',
  SEARCH: 'search',
  HISTORY: 'history',
  WATCHLIST: 'watchlist',
  PORTFOLIO: 'portfolio',
  SETTINGS: 'settings',
} as const

export const CACHE_TTL = {
  PRICES: 30000, // 30 seconds
  MARKET_DATA: 60000, // 1 minute
  COIN_DETAILS: 300000, // 5 minutes
  HISTORICAL: 600000, // 10 minutes
  SEARCH: 900000, // 15 minutes
} as const

// -----------------------------------------------------------------------------
// Error Messages
// -----------------------------------------------------------------------------

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  API_ERROR: 'Unable to fetch data from the server. Please try again later.',
  RATE_LIMIT: 'Too many requests. Please wait a moment before trying again.',
  INVALID_DATA: 'Received invalid data from the server.',
  COIN_NOT_FOUND: 'Cryptocurrency not found.',
  WEBSOCKET_ERROR: 'Real-time connection failed.',
} as const

// -----------------------------------------------------------------------------
// Feature Flags
// -----------------------------------------------------------------------------

export const FEATURES = {
  PORTFOLIO_TRACKING: true,
  PRICE_ALERTS: true,
  PAPER_TRADING: false,
  SOCIAL_FEATURES: false,
  ADVANCED_CHARTS: true,
  NEWS_FEED: false,
  MOBILE_APP: false,
} as const

// -----------------------------------------------------------------------------
// External Links
// -----------------------------------------------------------------------------

export const EXTERNAL_LINKS = {
  COINGECKO: 'https://www.coingecko.com',
  BINANCE: 'https://www.binance.com',
  TRADINGVIEW: 'https://www.tradingview.com',
  GITHUB: 'https://github.com/Gzeu/CryptoTraderPro',
  DISCORD: '#',
  TWITTER: '#',
  DOCS: '/docs',
  SUPPORT: '/support',
} as const