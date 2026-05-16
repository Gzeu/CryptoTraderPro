// Re-export API types for convenience
export type { Coin, CoinDetail, OHLCBar } from '@/lib/api/coingecko'
export type { PortfolioEntry } from '@/store/portfolioStore'

// UI types
export type SortField = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume'
export type SortDir   = 'asc' | 'desc'
export type Theme     = 'dark' | 'light'
export type Tab       = 'market' | 'watchlist'

export interface KPI {
  label: string
  value: string
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
}
