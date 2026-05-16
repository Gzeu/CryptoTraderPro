import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PriceAlert {
  id:        string
  coinId:    string
  coinName:  string
  price:     number
  direction: 'above' | 'below'
  createdAt: number
  triggered: boolean
}

interface AlertState {
  alerts: PriceAlert[]
  addAlert:     (a: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void
  removeAlert:  (id: string) => void
  markTriggered:(id: string) => void
  clearAll:     () => void
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set) => ({
      alerts: [],
      addAlert: (a) => set(s => ({
        alerts: [...s.alerts, {
          ...a,
          id:        crypto.randomUUID(),
          createdAt: Date.now(),
          triggered: false,
        }],
      })),
      removeAlert:   (id) => set(s => ({ alerts: s.alerts.filter(a => a.id !== id) })),
      markTriggered: (id) => set(s => ({ alerts: s.alerts.map(a => a.id === id ? { ...a, triggered: true } : a) })),
      clearAll:      ()   => set({ alerts: [] }),
    }),
    { name: 'ctp-alerts' },
  ),
)
