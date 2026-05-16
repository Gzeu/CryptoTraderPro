import { useState, useEffect } from 'react'

const STORAGE_KEY = 'ctp-watchlist'
const DEFAULTS = ['bitcoin', 'ethereum', 'elrond-erd-2', 'binancecoin', 'solana', 'cardano']

export function useWatchlist() {
  const [ids, setIds] = useState<string[]>(DEFAULTS)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setIds(JSON.parse(stored))
    } catch {}
  }, [])

  const persist = (next: string[]) => {
    setIds(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  const toggle = (id: string) =>
    persist(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])

  const add    = (id: string) => !ids.includes(id) && persist([...ids, id])
  const remove = (id: string) => persist(ids.filter(x => x !== id))
  const has    = (id: string) => ids.includes(id)

  return { ids, toggle, add, remove, has }
}
