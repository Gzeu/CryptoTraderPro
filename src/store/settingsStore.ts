// =============================================================================
// Settings Store - User preferences and app settings
// =============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings, WatchlistItem } from '@/types/crypto'

interface SettingsState {
  // Settings
  settings: AppSettings
  watchlist: WatchlistItem[]
  
  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void
  resetSettings: () => void
  
  // Watchlist actions
  addToWatchlist: (coinId: string, symbol: string, name: string) => void
  removeFromWatchlist: (coinId: string) => void
  isInWatchlist: (coinId: string) => boolean
  toggleWatchlist: (coinId: string, symbol: string, name: string) => void
  clearWatchlist: () => void
  
  // Getters
  getWatchlistIds: () => string[]
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  currency: 'usd',
  refreshInterval: 30000,
  enableNotifications: true,
  enableSounds: false,
  compactMode: false,
  defaultChartInterval: '1h',
}

export const useSettingsStore = create<SettingsState>()(persist(
  (set, get) => ({
    // Initial state
    settings: defaultSettings,
    watchlist: [
      // Default watchlist
      { coinId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', addedAt: new Date().toISOString(), alertsEnabled: true },
      { coinId: 'ethereum', symbol: 'ETH', name: 'Ethereum', addedAt: new Date().toISOString(), alertsEnabled: true },
      { coinId: 'binancecoin', symbol: 'BNB', name: 'BNB', addedAt: new Date().toISOString(), alertsEnabled: false },
    ],

    // Settings management
    updateSettings: (newSettings) => {
      set((state) => ({
        settings: { ...state.settings, ...newSettings },
      }))
    },

    resetSettings: () => {
      set({ settings: defaultSettings })
    },

    // Watchlist management
    addToWatchlist: (coinId, symbol, name) => {
      const { watchlist } = get()
      if (watchlist.some(item => item.coinId === coinId)) return
      
      const newItem: WatchlistItem = {
        coinId,
        symbol: symbol.toUpperCase(),
        name,
        addedAt: new Date().toISOString(),
        alertsEnabled: false,
      }
      
      set((state) => ({
        watchlist: [...state.watchlist, newItem],
      }))
    },

    removeFromWatchlist: (coinId) => {
      set((state) => ({
        watchlist: state.watchlist.filter(item => item.coinId !== coinId),
      }))
    },

    isInWatchlist: (coinId) => {
      const { watchlist } = get()
      return watchlist.some(item => item.coinId === coinId)
    },

    toggleWatchlist: (coinId, symbol, name) => {
      const { isInWatchlist, addToWatchlist, removeFromWatchlist } = get()
      
      if (isInWatchlist(coinId)) {
        removeFromWatchlist(coinId)
      } else {
        addToWatchlist(coinId, symbol, name)
      }
    },

    clearWatchlist: () => {
      set({ watchlist: [] })
    },

    // Getters
    getWatchlistIds: () => {
      const { watchlist } = get()
      return watchlist.map(item => item.coinId)
    },
  }),
  {
    name: 'cryptotraderpro-settings',
    version: 1,
  }
))