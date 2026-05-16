import { useMemo } from 'react'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useLivePrices } from '@/hooks/useLivePrice'
import { CG_TO_BINANCE } from '@/lib/cgToBinance'

export interface PortfolioRow {
  id: string
  coinId: string
  coinName: string
  amount: number
  buyPrice: number
  currentPrice: number | null
  costBasis: number
  currentValue: number | null
  pnl: number | null
  pnlPct: number | null
  /** 24h price change percent from Binance WS */
  pct24h: number | null
  isLive: boolean
  binanceSymbol: string | null
}

export interface PortfolioSummary {
  rows: PortfolioRow[]
  totalCost: number
  totalValue: number | null
  totalPnl: number | null
  totalPnlPct: number | null
  anyLive: boolean
}

export function usePortfolioLivePrices(
  restPrices?: Record<string, number>,
  restLoading?: boolean
): PortfolioSummary {
  const entries = usePortfolioStore(s => s.entries)

  const symbols = useMemo(
    () => entries.map(e => CG_TO_BINANCE[e.coinId]).filter((s): s is string => !!s),
    [entries]
  )

  const { priceMap, isLive } = useLivePrices(symbols)

  const rows: PortfolioRow[] = useMemo(() =>
    entries.map(entry => {
      const symbol = CG_TO_BINANCE[entry.coinId] ?? null
      const ticker = symbol ? priceMap.get(symbol) : undefined

      const currentPrice =
        ticker?.price ??
        restPrices?.[entry.coinId] ??
        null

      // 24h% comes directly from Binance WS miniTicker stream
      const pct24h = ticker?.priceChangePercent ?? null

      const costBasis = entry.amount * entry.buyPrice
      const currentValue = currentPrice != null ? entry.amount * currentPrice : null
      const pnl = currentValue != null ? currentValue - costBasis : null
      const pnlPct = pnl != null && costBasis > 0 ? (pnl / costBasis) * 100 : null

      return {
        id: entry.id,
        coinId: entry.coinId,
        coinName: entry.coinName,
        amount: entry.amount,
        buyPrice: entry.buyPrice,
        currentPrice,
        costBasis,
        currentValue,
        pnl,
        pnlPct,
        pct24h,
        isLive: !!ticker?.price,
        binanceSymbol: symbol,
      }
    }),
    [entries, priceMap, restPrices]
  )

  const totalCost = rows.reduce((s, r) => s + r.costBasis, 0)
  const totalValue = rows.every(r => r.currentValue != null)
    ? rows.reduce((s, r) => s + (r.currentValue ?? 0), 0)
    : null
  const totalPnl = totalValue != null ? totalValue - totalCost : null
  const totalPnlPct = totalPnl != null && totalCost > 0 ? (totalPnl / totalCost) * 100 : null

  return { rows, totalCost, totalValue, totalPnl, totalPnlPct, anyLive: isLive }
}
