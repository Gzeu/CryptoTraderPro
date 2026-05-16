// =============================================================================
// Tests for portfolio P&L calculations
// =============================================================================

import { describe, it, expect } from 'vitest'
import { calcPnLAsset, calcPortfolioSummary } from '@/types/portfolio'
import type { PortfolioPnLAsset } from '@/types/portfolio'

const makeAsset = (overrides: Partial<PortfolioPnLAsset> = {}): PortfolioPnLAsset => ({
  id: 'test-1',
  symbol: 'BTC',
  name: 'Bitcoin',
  amount: 1,
  avgBuyPrice: 40000,
  currentPrice: 43521,
  currentValue: 43521,
  costBasis: 40000,
  unrealizedPnL: 3521,
  unrealizedPnLPercent: 8.8025,
  realizedPnL: 0,
  allocationPercent: 100,
  lastUpdated: new Date().toISOString(),
  ...overrides,
})

describe('calcPnLAsset', () => {
  it('calculates currentValue correctly', () => {
    const asset = calcPnLAsset(
      { id: '1', symbol: 'BTC', name: 'Bitcoin', amount: 2, avgBuyPrice: 40000, currentPrice: 45000, realizedPnL: 0, lastUpdated: '' },
      90000
    )
    expect(asset.currentValue).toBe(90000)
    expect(asset.costBasis).toBe(80000)
  })

  it('calculates unrealized P&L for profit', () => {
    const asset = calcPnLAsset(
      { id: '1', symbol: 'ETH', name: 'Ethereum', amount: 10, avgBuyPrice: 2000, currentPrice: 2500, realizedPnL: 0, lastUpdated: '' },
      25000
    )
    expect(asset.unrealizedPnL).toBe(5000)
    expect(asset.unrealizedPnLPercent).toBe(25)
  })

  it('calculates unrealized P&L for loss', () => {
    const asset = calcPnLAsset(
      { id: '1', symbol: 'ETH', name: 'Ethereum', amount: 10, avgBuyPrice: 3000, currentPrice: 2500, realizedPnL: 0, lastUpdated: '' },
      25000
    )
    expect(asset.unrealizedPnL).toBe(-5000)
    expect(asset.unrealizedPnLPercent).toBeCloseTo(-16.67, 1)
  })

  it('calculates allocation percent correctly', () => {
    const asset = calcPnLAsset(
      { id: '1', symbol: 'BTC', name: 'Bitcoin', amount: 1, avgBuyPrice: 40000, currentPrice: 50000, realizedPnL: 0, lastUpdated: '' },
      100000
    )
    expect(asset.allocationPercent).toBe(50)
  })

  it('handles zero cost basis gracefully', () => {
    const asset = calcPnLAsset(
      { id: '1', symbol: 'BTC', name: 'Bitcoin', amount: 1, avgBuyPrice: 0, currentPrice: 50000, realizedPnL: 0, lastUpdated: '' },
      50000
    )
    expect(asset.unrealizedPnLPercent).toBe(0)
  })
})

describe('calcPortfolioSummary', () => {
  it('sums totalValue across assets', () => {
    const assets = [makeAsset({ currentValue: 43521 }), makeAsset({ id: '2', symbol: 'ETH', currentValue: 25000 })]
    const summary = calcPortfolioSummary(assets)
    expect(summary.totalValue).toBe(68521)
    expect(summary.assetCount).toBe(2)
  })

  it('calculates total unrealized P&L percent', () => {
    const assets = [makeAsset({ currentValue: 44000, costBasis: 40000, unrealizedPnL: 4000, unrealizedPnLPercent: 10 })]
    const summary = calcPortfolioSummary(assets)
    expect(summary.totalUnrealizedPnL).toBe(4000)
    expect(summary.totalUnrealizedPnLPercent).toBeCloseTo(10, 1)
  })
})
