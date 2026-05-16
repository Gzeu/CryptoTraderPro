import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AlertDirection = 'above' | 'below'
export type AlertStatus = 'active' | 'triggered' | 'dismissed'

export interface AlertEntry {
  id: string
  coinId: string
  coinName: string
  symbol: string        // Binance symbol e.g. "BTCUSDT"
  targetPrice: number
  direction: AlertDirection
  status: AlertStatus
  createdAt: number
  triggeredAt?: number
}

interface AlertsState {
  alerts: AlertEntry[]
  addAlert: (entry: Omit<AlertEntry, 'id' | 'createdAt' | 'status'>) => void
  removeAlert: (id: string) => void
  updateStatus: (id: string, status: AlertStatus) => void
  dismissAll: () => void
  clearTriggered: () => void
}

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set) => ({
      alerts: [],

      addAlert: (entry) =>
        set(state => ({
          alerts: [
            ...state.alerts,
            {
              ...entry,
              id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              status: 'active',
              createdAt: Date.now(),
            },
          ],
        })),

      removeAlert: (id) =>
        set(state => ({ alerts: state.alerts.filter(a => a.id !== id) })),

      updateStatus: (id, status) =>
        set(state => ({
          alerts: state.alerts.map(a =>
            a.id === id
              ? { ...a, status, ...(status === 'triggered' ? { triggeredAt: Date.now() } : {}) }
              : a
          ),
        })),

      dismissAll: () =>
        set(state => ({
          alerts: state.alerts.map(a => ({ ...a, status: 'dismissed' as AlertStatus })),
        })),

      clearTriggered: () =>
        set(state => ({ alerts: state.alerts.filter(a => a.status !== 'triggered') })),
    }),
    { name: 'alerts-v1' }
  )
)
