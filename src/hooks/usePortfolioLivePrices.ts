/**
 * usePortfolioLivePrices
 * ───────────────────────
 * Combines the portfolio store with real-time Binance WS prices.
 * Falls back to CoinGecko REST prices when WS is not yet connected
 * or the coin has no Binance pair.
 *
 * Returns enriched rows ready for table + pie chart rendering.
 */

import { useMemo } from 'react'
import { useMultiTickerWS } from './useMultiTickerWS'
import { usePortfolioStore } from '@/store/portfolioStore'

// CoinGecko id → Binance base symbol mapping
const CG_TO_BINANCE: Record<string, string> = {
  bitcoin:        'BTC',
  ethereum:       'ETH',
  'elrond-erd-2': 'EGLD',
  solana:         'SOL',
  binancecoin:    'BNB',
  cardano:        'ADA',
  ripple:         'XRP',
  dogecoin:       'DOGE',
  polkadot:       'DOT',
  'avalanche-2':  'AVAX',
  chainlink:      'LINK',
  litecoin:       'LTC',
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
  pricesLoading = false,
) {
  const { entries } = usePortfolioStore()

  // Build list of Binance symbols to subscribe to
  const wsSymbols = useMemo(() => {
    const ids = [...new Set(entries.map((e) => e.coinId))]
    return ids
      .filter((id) => CG_TO_BINANCE[id])
      .map((id) => `${CG_TO_BINANCE[id]}USDT`)
  }, [entries])

  const tickers = useMultiTickerWS(wsSymbols)

  const rows = useMemo<PortfolioRow[]>(() => {
    return entries.map((e) => {
      const binanceSymbol = CG_TO_BINANCE[e.coinId]
        ? `${CG_TO_BINANCE[e.coinId]}USDT`
        : null

      const wsPrice   = binanceSymbol ? tickers.get(binanceSymbol)?.price : undefined
      const restPrice = restPrices?.[e.coinId]
      const cur       = wsPrice ?? restPrice ?? 0
      const isLive    = wsPrice !== undefined

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
  }, [entries, tickers, restPrices])

  const totalCost  = rows.reduce((s, r) => s + r.cost,  0)
  const totalValue = rows.reduce((s, r) => s + r.value, 0)
  const totalPnl   = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  const anyLive    = rows.some((r) => r.isLive)

  return { rows, totalCost, totalValue, totalPnl, totalPnlPct, anyLive, pricesLoading }
}
