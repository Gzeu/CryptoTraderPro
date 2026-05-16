// =============================================================================
// P&L Portfolio Store — persisted Zustand store
// =============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PortfolioPnLAsset } from '@/types/portfolio'
import { calcPnLAsset, calcPortfolioSummary } from '@/types/portfolio'
import type { PortfolioSummary } from '@/types/portfolio'

interface PnLPortfolioState {
  assets: PortfolioPnLAsset[]
  summary: PortfolioSummary

  addAsset: (asset: Omit<PortfolioPnLAsset, 'id' | 'currentValue' | 'costBasis' | 'unrealizedPnL' | 'unrealizedPnLPercent' | 'allocationPercent' | 'lastUpdated'>) => void
  removeAsset: (id: string) => void
  updatePrice: (symbol: string, currentPrice: number) => void
  updateRealizedPnL: (id: string, realizedPnL: number) => void
  recalculate: () => void
}

const EMPTY_SUMMARY: PortfolioSummary = {
  totalValue: 0, totalCostBasis: 0, totalUnrealizedPnL: 0,
  totalUnrealizedPnLPercent: 0, totalRealizedPnL: 0,
  dayChange: 0, dayChangePercent: 0, assetCount: 0
}

export const usePnLPortfolioStore = create<PnLPortfolioState>()(persist(
  (set, get) => ({
    assets: [],
    summary: EMPTY_SUMMARY,

    addAsset: (assetData) => {
      const id = `pnl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      const lastUpdated = new Date().toISOString()
      const existing = get().assets
      const totalValue = existing.reduce((s, a) => s + a.currentValue, 0)
        + assetData.amount * assetData.currentPrice
      const newAsset = calcPnLAsset({ ...assetData, id, lastUpdated }, totalValue)
      const assets = [...existing, newAsset]
      set({ assets, summary: calcPortfolioSummary(assets) })
    },

    removeAsset: (id) => {
      const assets = get().assets.filter((a) => a.id !== id)
      set({ assets, summary: calcPortfolioSummary(assets) })
    },

    updatePrice: (symbol, currentPrice) => {
      let assets = get().assets.map((a) =>
        a.symbol.toLowerCase() === symbol.toLowerCase()
          ? { ...a, currentPrice, lastUpdated: new Date().toISOString() }
          : a
      )
      const totalValue = assets.reduce((s, a) => s + a.amount * a.currentPrice, 0)
      assets = assets.map((a) => calcPnLAsset(a, totalValue))
      set({ assets, summary: calcPortfolioSummary(assets) })
    },

    updateRealizedPnL: (id, realizedPnL) => {
      const assets = get().assets.map((a) => a.id === id ? { ...a, realizedPnL } : a)
      set({ assets, summary: calcPortfolioSummary(assets) })
    },

    recalculate: () => {
      const existing = get().assets
      const totalValue = existing.reduce((s, a) => s + a.currentValue, 0)
      const assets = existing.map((a) => calcPnLAsset(a, totalValue))
      set({ assets, summary: calcPortfolioSummary(assets) })
    },
  }),
  { name: 'cryptotraderpro-pnl-portfolio', version: 1 }
))

export default usePnLPortfolioStore
