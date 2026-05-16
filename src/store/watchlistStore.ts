import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WatchlistState {
  ids: string[]
  toggle: (id: string) => void
  add: (id: string) => void
  remove: (id: string) => void
  has: (id: string) => boolean
  clear: () => void
}

const DEFAULTS = ['bitcoin', 'ethereum', 'elrond-erd-2', 'binancecoin', 'solana', 'cardano']

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      ids: DEFAULTS,
      toggle: (id) => set(s => ({ ids: s.ids.includes(id) ? s.ids.filter(x => x !== id) : [...s.ids, id] })),
      add:    (id) => { if (!get().ids.includes(id)) set(s => ({ ids: [...s.ids, id] })) },
      remove: (id) => set(s => ({ ids: s.ids.filter(x => x !== id) })),
      has:    (id) => get().ids.includes(id),
      clear:  ()   => set({ ids: [] }),
    }),
    { name: 'ctp-watchlist' }
  )
)
