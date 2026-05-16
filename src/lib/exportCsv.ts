import { type PortfolioEntry } from '@/store/portfolioStore'

export interface PortfolioRow extends PortfolioEntry {
  currentPrice: number
  pnlUsd:       number
  pnlPct:       number
  currentValue: number
  costBasis:    number
}

/**
 * Build CSV string from portfolio rows.
 * Includes: Coin, Symbol, Amount, Buy Price, Current Price,
 *           Cost Basis, Current Value, P&L $, P&L %
 */
export function buildPortfolioCsv(rows: PortfolioRow[]): string {
  const headers = [
    'Coin', 'Symbol', 'Amount', 'Buy Price (USD)', 'Current Price (USD)',
    'Cost Basis (USD)', 'Current Value (USD)', 'P&L (USD)', 'P&L (%)', 'Added At',
  ]

  const escape = (val: string | number) => {
    const str = String(val)
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str
  }

  const lines = [
    headers.join(','),
    ...rows.map(r => [
      escape(r.coinName),
      escape(r.coinId.toUpperCase()),
      escape(r.amount),
      escape(r.buyPrice.toFixed(6)),
      escape(r.currentPrice.toFixed(6)),
      escape(r.costBasis.toFixed(2)),
      escape(r.currentValue.toFixed(2)),
      escape(r.pnlUsd.toFixed(2)),
      escape(r.pnlPct.toFixed(2) + '%'),
      escape(new Date(r.addedAt).toISOString()),
    ].join(',')),
  ]

  return lines.join('\n')
}

/** Trigger browser download of a CSV string. */
export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
