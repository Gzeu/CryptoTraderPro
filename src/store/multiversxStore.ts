// =============================================================================
// MultiversX Zustand Store
// =============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WalletInfo } from '@/lib/multiversx'

interface MultiversXState {
  address: string | null
  walletInfo: WalletInfo | null
  egldPrice: number
  isConnecting: boolean
  error: string | null

  setAddress: (address: string) => void
  setWalletInfo: (info: WalletInfo) => void
  setEgldPrice: (price: number) => void
  setIsConnecting: (v: boolean) => void
  setError: (err: string | null) => void
  disconnect: () => void
}

export const useMultiversXStore = create<MultiversXState>()(persist(
  (set) => ({
    address: null,
    walletInfo: null,
    egldPrice: 0,
    isConnecting: false,
    error: null,

    setAddress: (address) => set({ address }),
    setWalletInfo: (walletInfo) => set({ walletInfo }),
    setEgldPrice: (egldPrice) => set({ egldPrice }),
    setIsConnecting: (isConnecting) => set({ isConnecting }),
    setError: (error) => set({ error }),
    disconnect: () => set({ address: null, walletInfo: null, error: null }),
  }),
  {
    name: 'cryptotraderpro-multiversx',
    version: 1,
  }
))

export default useMultiversXStore
