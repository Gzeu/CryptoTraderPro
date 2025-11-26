// =============================================================================
// Watchlist Store - Zustand state management for watchlists and price alerts
// =============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WatchlistItem, PriceAlert } from '@/types/crypto'

interface WatchlistState {
  // State
  watchlist: WatchlistItem[]
  categories: string[]
  priceAlerts: PriceAlert[]
  
  // Watchlist actions
  addToWatchlist: (item: Omit<WatchlistItem, 'id' | 'addedAt'>) => void
  removeFromWatchlist: (itemId: string) => void
  updateWatchlistItem: (itemId: string, updates: Partial<WatchlistItem>) => void
  isInWatchlist: (coinId: string) => boolean
  getWatchlistByCoinId: (coinId: string) => WatchlistItem | undefined
  
  // Category actions
  addCategory: (category: string) => void
  removeCategory: (category: string) => void
  getCategoryItems: (category: string) => WatchlistItem[]
  
  // Price alert actions
  addPriceAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void
  removePriceAlert: (alertId: string) => void
  updatePriceAlert: (alertId: string, updates: Partial<PriceAlert>) => void
  triggerAlert: (alertId: string) => void
  getActiveAlerts: () => PriceAlert[]
  getTriggeredAlerts: () => PriceAlert[]
  checkAndTriggerAlerts: (coinId: string, currentPrice: number) => PriceAlert[]
  
  // Bulk operations
  clearWatchlist: () => void
  clearCategory: (category: string) => void
  exportWatchlist: () => string
  importWatchlist: (data: string) => boolean
}

export const useWatchlistStore = create<WatchlistState>()(persist(
  (set, get) => ({
    // Initial state
    watchlist: [],
    categories: ['Favorites', 'DeFi', 'Gaming', 'Layer 1', 'Layer 2', 'Meme Coins'],
    priceAlerts: [],

    // Watchlist management
    addToWatchlist: (itemData) => {
      const { watchlist } = get()
      
      // Check if coin already exists
      if (watchlist.some(item => item.coinId === itemData.coinId)) {
        console.warn(`${itemData.coinId} is already in watchlist`)
        return
      }
      
      const newItem: WatchlistItem = {
        ...itemData,
        id: `watchlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        addedAt: new Date().toISOString(),
      }
      
      set((state) => ({
        watchlist: [...state.watchlist, newItem],
      }))
    },

    removeFromWatchlist: (itemId) => {
      set((state) => ({
        watchlist: state.watchlist.filter(item => item.id !== itemId),
        // Also remove related price alerts
        priceAlerts: state.priceAlerts.filter(alert => {
          const watchlistItem = state.watchlist.find(item => item.id === itemId)
          return watchlistItem ? alert.coinId !== watchlistItem.coinId : true
        }),
      }))
    },

    updateWatchlistItem: (itemId, updates) => {
      set((state) => ({
        watchlist: state.watchlist.map(item => 
          item.id === itemId 
            ? { ...item, ...updates }
            : item
        ),
      }))
    },

    isInWatchlist: (coinId) => {
      return get().watchlist.some(item => item.coinId === coinId)
    },

    getWatchlistByCoinId: (coinId) => {
      return get().watchlist.find(item => item.coinId === coinId)
    },

    // Category management
    addCategory: (category) => {
      const { categories } = get()
      if (!categories.includes(category)) {
        set((state) => ({
          categories: [...state.categories, category],
        }))
      }
    },

    removeCategory: (category) => {
      set((state) => ({
        categories: state.categories.filter(cat => cat !== category),
        // Remove category from all watchlist items
        watchlist: state.watchlist.map(item => ({
          ...item,
          category: item.category === category ? undefined : item.category,
        })),
      }))
    },

    getCategoryItems: (category) => {
      return get().watchlist.filter(item => item.category === category)
    },

    // Price alert management
    addPriceAlert: (alertData) => {
      const newAlert: PriceAlert = {
        ...alertData,
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        triggered: false,
      }
      
      set((state) => ({
        priceAlerts: [...state.priceAlerts, newAlert],
      }))
    },

    removePriceAlert: (alertId) => {
      set((state) => ({
        priceAlerts: state.priceAlerts.filter(alert => alert.id !== alertId),
      }))
    },

    updatePriceAlert: (alertId, updates) => {
      set((state) => ({
        priceAlerts: state.priceAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, ...updates }
            : alert
        ),
      }))
    },

    triggerAlert: (alertId) => {
      set((state) => ({
        priceAlerts: state.priceAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, triggered: true, triggeredAt: new Date().toISOString() }
            : alert
        ),
      }))
    },

    getActiveAlerts: () => {
      return get().priceAlerts.filter(alert => !alert.triggered && alert.enabled)
    },

    getTriggeredAlerts: () => {
      return get().priceAlerts.filter(alert => alert.triggered)
    },

    checkAndTriggerAlerts: (coinId, currentPrice) => {
      const { priceAlerts } = get()
      const triggeredAlerts: PriceAlert[] = []
      
      priceAlerts.forEach(alert => {
        if (alert.coinId !== coinId || !alert.enabled || alert.triggered) {
          return
        }
        
        let shouldTrigger = false
        
        switch (alert.type) {
          case 'above':
            shouldTrigger = currentPrice >= alert.targetPrice
            break
          case 'below':
            shouldTrigger = currentPrice <= alert.targetPrice
            break
          case 'percent_change':
            // Requires base price to be set
            if (alert.basePrice) {
              const changePercent = ((currentPrice - alert.basePrice) / alert.basePrice) * 100
              shouldTrigger = Math.abs(changePercent) >= Math.abs(alert.targetPrice)
            }
            break
        }
        
        if (shouldTrigger) {
          get().triggerAlert(alert.id)
          triggeredAlerts.push({ ...alert, triggered: true })
        }
      })
      
      return triggeredAlerts
    },

    // Bulk operations
    clearWatchlist: () => {
      set({
        watchlist: [],
        priceAlerts: [],
      })
    },

    clearCategory: (category) => {
      set((state) => ({
        watchlist: state.watchlist.filter(item => item.category !== category),
      }))
    },

    exportWatchlist: () => {
      const { watchlist, categories, priceAlerts } = get()
      return JSON.stringify({
        watchlist,
        categories,
        priceAlerts,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      }, null, 2)
    },

    importWatchlist: (data) => {
      try {
        const parsed = JSON.parse(data)
        
        if (!parsed.watchlist || !Array.isArray(parsed.watchlist)) {
          throw new Error('Invalid watchlist data')
        }
        
        set({
          watchlist: parsed.watchlist || [],
          categories: parsed.categories || get().categories,
          priceAlerts: parsed.priceAlerts || [],
        })
        
        return true
      } catch (error) {
        console.error('Error importing watchlist:', error)
        return false
      }
    },
  }),
  {
    name: 'cryptotraderpro-watchlist',
    version: 1,
  }
))