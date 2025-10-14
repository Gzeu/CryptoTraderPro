// =============================================================================
// Portfolio Store - Zustand state management
// =============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Portfolio, PortfolioAsset, Transaction } from '@/types/crypto'

interface PortfolioState {
  // State
  portfolios: Portfolio[]
  currentPortfolioId: string | null
  transactions: Transaction[]
  
  // Actions
  addPortfolio: (portfolio: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => void
  removePortfolio: (portfolioId: string) => void
  updatePortfolio: (portfolioId: string, updates: Partial<Portfolio>) => void
  setCurrentPortfolio: (portfolioId: string | null) => void
  
  // Asset actions
  addAsset: (portfolioId: string, asset: Omit<PortfolioAsset, 'id' | 'lastUpdated'>) => void
  removeAsset: (portfolioId: string, assetId: string) => void
  updateAsset: (portfolioId: string, assetId: string, updates: Partial<PortfolioAsset>) => void
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void
  removeTransaction: (transactionId: string) => void
  
  // Computed getters
  getCurrentPortfolio: () => Portfolio | null
  getTotalPortfolioValue: () => number
  getPortfolioTransactions: (portfolioId: string) => Transaction[]
}

export const usePortfolioStore = create<PortfolioState>()(persist(
  (set, get) => ({
    // Initial state
    portfolios: [],
    currentPortfolioId: null,
    transactions: [],

    // Portfolio management
    addPortfolio: (portfolioData) => {
      const newPortfolio: Portfolio = {
        ...portfolioData,
        id: `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      set((state) => ({
        portfolios: [...state.portfolios, newPortfolio],
        currentPortfolioId: state.currentPortfolioId || newPortfolio.id,
      }))
    },

    removePortfolio: (portfolioId) => {
      set((state) => ({
        portfolios: state.portfolios.filter(p => p.id !== portfolioId),
        currentPortfolioId: state.currentPortfolioId === portfolioId ? null : state.currentPortfolioId,
        transactions: state.transactions.filter(t => t.portfolioId !== portfolioId),
      }))
    },

    updatePortfolio: (portfolioId, updates) => {
      set((state) => ({
        portfolios: state.portfolios.map(portfolio => 
          portfolio.id === portfolioId 
            ? { ...portfolio, ...updates, updatedAt: new Date().toISOString() }
            : portfolio
        ),
      }))
    },

    setCurrentPortfolio: (portfolioId) => {
      set({ currentPortfolioId: portfolioId })
    },

    // Asset management
    addAsset: (portfolioId, assetData) => {
      const newAsset: PortfolioAsset = {
        ...assetData,
        id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lastUpdated: new Date().toISOString(),
      }
      
      set((state) => ({
        portfolios: state.portfolios.map(portfolio => 
          portfolio.id === portfolioId
            ? {
                ...portfolio,
                assets: [...portfolio.assets, newAsset],
                updatedAt: new Date().toISOString(),
              }
            : portfolio
        ),
      }))
    },

    removeAsset: (portfolioId, assetId) => {
      set((state) => ({
        portfolios: state.portfolios.map(portfolio => 
          portfolio.id === portfolioId
            ? {
                ...portfolio,
                assets: portfolio.assets.filter(asset => asset.id !== assetId),
                updatedAt: new Date().toISOString(),
              }
            : portfolio
        ),
      }))
    },

    updateAsset: (portfolioId, assetId, updates) => {
      set((state) => ({
        portfolios: state.portfolios.map(portfolio => 
          portfolio.id === portfolioId
            ? {
                ...portfolio,
                assets: portfolio.assets.map(asset => 
                  asset.id === assetId
                    ? { ...asset, ...updates, lastUpdated: new Date().toISOString() }
                    : asset
                ),
                updatedAt: new Date().toISOString(),
              }
            : portfolio
        ),
      }))
    },

    // Transaction management
    addTransaction: (transactionData) => {
      const newTransaction: Transaction = {
        ...transactionData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      }
      
      set((state) => ({
        transactions: [...state.transactions, newTransaction],
      }))
    },

    removeTransaction: (transactionId) => {
      set((state) => ({
        transactions: state.transactions.filter(tx => tx.id !== transactionId),
      }))
    },

    // Computed getters
    getCurrentPortfolio: () => {
      const { portfolios, currentPortfolioId } = get()
      return portfolios.find(p => p.id === currentPortfolioId) || null
    },

    getTotalPortfolioValue: () => {
      const currentPortfolio = get().getCurrentPortfolio()
      return currentPortfolio?.totalValue || 0
    },

    getPortfolioTransactions: (portfolioId) => {
      const { transactions } = get()
      return transactions.filter(tx => tx.portfolioId === portfolioId)
    },
  }),
  {
    name: 'cryptotraderpro-portfolio',
    version: 1,
  }
))