// =============================================================================
// Price Alert Types
// =============================================================================

export interface PriceAlert {
  id: string
  symbol: string
  condition: 'above' | 'below'
  targetPrice: number
  currentPrice: number
  triggered: boolean
  triggeredAt?: string // ISO string
  createdAt: string
  notified: boolean
}
