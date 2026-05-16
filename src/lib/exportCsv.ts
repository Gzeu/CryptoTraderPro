// =============================================================================
// exportCsv — converts portfolio entries + live prices into a CSV download
// =============================================================================

import type { PortfolioEntry } from '@/store/portfolioStore'

export interface PortfolioRow extends PortfolioEntry {
  currentPrice: number
  currentValue: number
  costBasis:    number
  pnl:          number
  pnlPct:       number
}

function escapeCell(v: string | number): string {
  const s = String(v)
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

export function buildPortfolioCsv(rows: PortfolioRow[]): string {
  const headers = [
    'Coin', 'Symbol', 'Amount', 'Buy Price (USD)',
    'Current Price (USD)', 'Cost Basis (USD)', 'Current Value (USD)',
    'P&L (USD)', 'P&L (%)', 'Added At',
  ]

  const lines = [
    headers.map(escapeCell).join(','),
    ...rows.map(r => [
      r.coinName,
      r.coinId.toUpperCase(),
      r.amount,
      r.buyPrice.toFixed(6),
      r.currentPrice.toFixed(6),
      r.costBasis.toFixed(2),
      r.currentValue.toFixed(2),
      r.pnl.toFixed(2),
      r.pnlPct.toFixed(2),
      new Date(r.addedAt).toISOString(),
    ].map(escapeCell).join(',')),
  ]

  return lines.join('\r\n')
}

export function downloadCsv(csv: string, filename = 'portfolio.csv') {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
