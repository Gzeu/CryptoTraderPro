// =============================================================================
// Portfolio Types with P&L fields
// =============================================================================

export interface PortfolioPnLAsset {
  id: string
  symbol: string
  name: string
  amount: number
  avgBuyPrice: number       // user-entered cost basis
  currentPrice: number      // live from WebSocket
  currentValue: number      // amount * currentPrice
  costBasis: number         // amount * avgBuyPrice
  unrealizedPnL: number     // currentValue - costBasis
  unrealizedPnLPercent: number
  realizedPnL: number
  allocationPercent: number // % of total portfolio value
  lastUpdated: string
}

export interface PortfolioSummary {
  totalValue: number
  totalCostBasis: number
  totalUnrealizedPnL: number
  totalUnrealizedPnLPercent: number
  totalRealizedPnL: number
  dayChange: number
  dayChangePercent: number
  assetCount: number
}

export function calcPnLAsset(
  asset: Omit<PortfolioPnLAsset, 'currentValue' | 'costBasis' | 'unrealizedPnL' | 'unrealizedPnLPercent' | 'allocationPercent'>,
  totalPortfolioValue: number
): PortfolioPnLAsset {
  const currentValue = asset.amount * asset.currentPrice
  const costBasis = asset.amount * asset.avgBuyPrice
  const unrealizedPnL = currentValue - costBasis
  const unrealizedPnLPercent = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0
  const allocationPercent = totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0
  return {
    ...asset,
    currentValue,
    costBasis,
    unrealizedPnL,
    unrealizedPnLPercent,
    allocationPercent,
  }
}

export function calcPortfolioSummary(assets: PortfolioPnLAsset[]): PortfolioSummary {
  const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0)
  const totalCostBasis = assets.reduce((sum, a) => sum + a.costBasis, 0)
  const totalUnrealizedPnL = totalValue - totalCostBasis
  const totalUnrealizedPnLPercent = totalCostBasis > 0 ? (totalUnrealizedPnL / totalCostBasis) * 100 : 0
  const totalRealizedPnL = assets.reduce((sum, a) => sum + a.realizedPnL, 0)
  return {
    totalValue,
    totalCostBasis,
    totalUnrealizedPnL,
    totalUnrealizedPnLPercent,
    totalRealizedPnL,
    dayChange: 0,
    dayChangePercent: 0,
    assetCount: assets.length,
  }
}
