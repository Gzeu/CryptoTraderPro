import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PortfolioEntry {
  id:        string
  coinId:    string
  coinName:  string
  amount:    number
  buyPrice:  number
  addedAt:   number
}

interface PortfolioState {
  entries:     PortfolioEntry[]
  addEntry:    (e: Omit<PortfolioEntry, 'id' | 'addedAt'>) => void
  removeEntry: (id: string) => void
  clearAll:    () => void
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (e) => set(s => ({
        entries: [...s.entries, {
          ...e,
          id:      crypto.randomUUID(),
          addedAt: Date.now(),
        }],
      })),
      removeEntry: (id) => set(s => ({ entries: s.entries.filter(e => e.id !== id) })),
      clearAll:    ()   => set({ entries: [] }),
    }),
    { name: 'ctp-portfolio' },
  ),
)
