'use client'

// =============================================================================
// usePortfolioExport — fetches current prices for all portfolio coins,
// builds rows with P&L, then triggers CSV download.
// =============================================================================

import { useCallback, useState } from 'react'
import { usePortfolioStore } from '@/store/portfolioStore'
import { buildPortfolioCsv, downloadCsv, type PortfolioRow } from '@/lib/exportCsv'

async function fetchPrices(coinIds: string[]): Promise<Record<string, number>> {
  if (coinIds.length === 0) return {}
  const ids = coinIds.join(',')
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
    { next: { revalidate: 30 } },
  )
  if (!res.ok) throw new Error('Price fetch failed')
  const data = await res.json() as Record<string, { usd: number }>
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.usd]))
}

export function usePortfolioExport() {
  const entries   = usePortfolioStore(s => s.entries)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const exportCsv = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const ids    = [...new Set(entries.map(e => e.coinId))]
      const prices = await fetchPrices(ids)

      const rows: PortfolioRow[] = entries.map(e => {
        const currentPrice = prices[e.coinId] ?? 0
        const costBasis    = e.amount * e.buyPrice
        const currentValue = e.amount * currentPrice
        const pnl          = currentValue - costBasis
        const pnlPct       = costBasis > 0 ? (pnl / costBasis) * 100 : 0
        return { ...e, currentPrice, currentValue, costBasis, pnl, pnlPct }
      })

      const csv      = buildPortfolioCsv(rows)
      const filename = `portfolio_${new Date().toISOString().slice(0, 10)}.csv`
      downloadCsv(csv, filename)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setLoading(false)
    }
  }, [entries])

  return { exportCsv, loading, error }
}
