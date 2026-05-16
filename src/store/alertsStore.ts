// =============================================================================
// Price Alerts Zustand Store
// =============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PriceAlert } from '@/types/alert'

interface AlertsState {
  alerts: PriceAlert[]
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered' | 'notified' | 'triggeredAt'>) => void
  removeAlert: (id: string) => void
  markTriggered: (id: string) => void
  markNotified: (id: string) => void
  updateCurrentPrice: (symbol: string, price: number) => void
}

export const useAlertsStore = create<AlertsState>()(persist(
  (set) => ({
    alerts: [],

    addAlert: (alertData) => {
      const newAlert: PriceAlert = {
        ...alertData,
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        createdAt: new Date().toISOString(),
        triggered: false,
        notified: false,
      }
      set((state) => ({ alerts: [newAlert, ...state.alerts] }))
    },

    removeAlert: (id) =>
      set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),

    markTriggered: (id) =>
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === id ? { ...a, triggered: true, triggeredAt: new Date().toISOString() } : a
        ),
      })),

    markNotified: (id) =>
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? { ...a, notified: true } : a)),
      })),

    updateCurrentPrice: (symbol, price) =>
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.symbol.toLowerCase() === symbol.toLowerCase() ? { ...a, currentPrice: price } : a
        ),
      })),
  }),
  { name: 'cryptotraderpro-alerts', version: 1 }
))

export default useAlertsStore
