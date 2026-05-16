import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PortfolioEntry {
  coinId: string
  symbol: string
  name: string
  image: string
  amount: number       // qty held
  buyPrice: number     // avg entry price in USD
  addedAt: number      // unix ms
}

interface PortfolioState {
  entries: PortfolioEntry[]
  add:    (entry: PortfolioEntry) => void
  remove: (coinId: string) => void
  update: (coinId: string, patch: Partial<PortfolioEntry>) => void
  clear:  () => void
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      entries: [],
      add:    (entry)         => set(s => ({ entries: [...s.entries, entry] })),
      remove: (coinId)        => set(s => ({ entries: s.entries.filter(e => e.coinId !== coinId) })),
      update: (coinId, patch) => set(s => ({ entries: s.entries.map(e => e.coinId === coinId ? { ...e, ...patch } : e) })),
      clear:  ()              => set({ entries: [] }),
    }),
    { name: 'ctp-portfolio' }
  )
)
