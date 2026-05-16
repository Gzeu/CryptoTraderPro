'use client'

// =============================================================================
// useExportCSV — one-click portfolio CSV export
// Merges portfolio entries with live prices to include current value + P&L
// =============================================================================

import { useCallback } from 'react'
import { usePortfolioStore, type PortfolioEntry } from '@/store/portfolioStore'
import { priceFeed } from '@/lib/ws/priceFeed'

function escapeCSV(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildRow(e: PortfolioEntry, currentPrice: number | null) {
  const currentValue  = currentPrice !== null ? currentPrice * e.amount : null
  const costBasis     = e.buyPrice * e.amount
  const pnlUsd        = currentValue !== null ? currentValue - costBasis : null
  const pnlPct        = pnlUsd    !== null ? (pnlUsd / costBasis) * 100 : null

  return [
    escapeCSV(e.coinName),
    escapeCSV(e.coinId.toUpperCase()),
    escapeCSV(e.amount),
    escapeCSV(e.buyPrice.toFixed(6)),
    escapeCSV(currentPrice !== null ? currentPrice.toFixed(6) : 'N/A'),
    escapeCSV(costBasis.toFixed(2)),
    escapeCSV(currentValue !== null ? currentValue.toFixed(2) : 'N/A'),
    escapeCSV(pnlUsd     !== null ? pnlUsd.toFixed(2)    : 'N/A'),
    escapeCSV(pnlPct     !== null ? pnlPct.toFixed(2)    : 'N/A'),
    escapeCSV(new Date(e.addedAt).toISOString()),
  ].join(',')
}

export function useExportCSV() {
  const { entries } = usePortfolioStore()

  const exportCSV = useCallback(() => {
    const header = [
      'Name', 'Symbol', 'Amount', 'Buy Price (USD)', 'Current Price (USD)',
      'Cost Basis (USD)', 'Current Value (USD)', 'P&L (USD)', 'P&L (%)', 'Added At',
    ].join(',')

    const rows = entries.map(e => {
      // map coinId → Binance symbol (e.g. bitcoin → BTCUSDT)
      const wsSymbol = `${e.coinId.toUpperCase()}USDT`
      const cached   = priceFeed.getCached(wsSymbol)
      return buildRow(e, cached?.price ?? null)
    })

    const csv     = [header, ...rows].join('\n')
    const blob    = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url     = URL.createObjectURL(blob)
    const anchor  = document.createElement('a')
    const date    = new Date().toISOString().slice(0, 10)

    anchor.href     = url
    anchor.download = `portfolio-${date}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [entries])

  return { exportCSV, isEmpty: entries.length === 0 }
}
