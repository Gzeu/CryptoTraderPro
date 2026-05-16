/**
 * usePortfolioLivePrices
 * ───────────────────────
 * Combines the portfolio store with real-time Binance WS prices via
 * the priceFeed singleton (useLivePrices).
 *
 * Strategy:
 *   1. Subscribe all held coins to Binance WS via useLivePrices
 *   2. Fall back to CoinGecko REST prices (passed in as restPrices)
 *   3. Expose isLive per row + aggregated totals
 */

import { useMemo } from 'react'
import { useLivePrices } from './useLivePrice'
import { usePortfolioStore } from '@/store/portfolioStore'

// CoinGecko id → Binance USDT symbol
const CG_TO_BINANCE: Record<string, string> = {
  bitcoin:        'BTCUSDT',
  ethereum:       'ETHUSDT',
  'elrond-erd-2': 'EGLDUSDT',
  solana:         'SOLUSDT',
  binancecoin:    'BNBUSDT',
  cardano:        'ADAUSDT',
  ripple:         'XRPUSDT',
  dogecoin:       'DOGEUSDT',
  polkadot:       'DOTUSDT',
  'avalanche-2':  'AVAXUSDT',
  chainlink:      'LINKUSDT',
  litecoin:       'LTCUSDT',
}

export interface PortfolioRow {
  id: string
  coinId: string
  coinName: string
  amount: number
  buyPrice: number
  currentPrice: number
  cost: number
  value: number
  pnl: number
  pnlPct: number
  isLive: boolean
}

export function usePortfolioLivePrices(
  restPrices?: Record<string, number>,
  restLoading = false,
) {
  const { entries } = usePortfolioStore()

  // Collect Binance symbols for all held coins
  const wsSymbols = useMemo(() => {
    const ids = [...new Set(entries.map(e => e.coinId))]
    return ids
      .filter(id => CG_TO_BINANCE[id])
      .map(id => CG_TO_BINANCE[id])
  }, [entries])

  // Single shared WS connection via priceFeed singleton
  const { priceMap } = useLivePrices(wsSymbols)

  const rows = useMemo<PortfolioRow[]>(() => {
    return entries.map(e => {
      const wsSymbol  = CG_TO_BINANCE[e.coinId]
      const wsPrice   = wsSymbol ? priceMap.get(wsSymbol)?.price : undefined
      const restPrice = restPrices?.[e.coinId]
      const cur       = wsPrice ?? restPrice ?? 0
      const isLive    = wsPrice !== undefined && wsPrice > 0

      const cost   = e.amount * e.buyPrice
      const value  = e.amount * cur
      const pnl    = value - cost
      const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0

      return {
        id:           e.id,
        coinId:       e.coinId,
        coinName:     e.coinName,
        amount:       e.amount,
        buyPrice:     e.buyPrice,
        currentPrice: cur,
        cost,
        value,
        pnl,
        pnlPct,
        isLive,
      }
    })
  }, [entries, priceMap, restPrices])

  const totalCost   = rows.reduce((s, r) => s + r.cost,  0)
  const totalValue  = rows.reduce((s, r) => s + r.value, 0)
  const totalPnl    = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  const anyLive     = rows.some(r => r.isLive)

  return { rows, totalCost, totalValue, totalPnl, totalPnlPct, anyLive, restLoading }
}
