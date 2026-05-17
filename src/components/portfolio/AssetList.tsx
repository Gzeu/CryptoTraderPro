'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import { usePortfolioStore } from '@/store/portfolioStore'
import { fmtPrice, fmtPct } from '@/lib/formatters'
import { EmptyState } from '@/components/ui/EmptyState'
import type { PortfolioAsset } from '@/types/crypto'

type SortField = 'value' | 'pnl' | 'pnlPercent' | 'allocation' | 'amount'
type SortDir   = 'asc' | 'desc'

const COLS: { label: string; field: SortField; cls: string }[] = [
  { label: 'Holdings',   field: 'amount',     cls: 'text-right' },
  { label: 'Value',      field: 'value',      cls: 'text-right' },
  { label: 'P&L',        field: 'pnl',        cls: 'text-right' },
  { label: 'Allocation', field: 'allocation', cls: 'text-right' },
]

export function AssetList({ onEditAsset }: { onEditAsset?: (asset: PortfolioAsset) => void }) {
  const currentPortfolio = usePortfolioStore(state => state.getCurrentPortfolio())
  const { removeAsset }  = usePortfolioStore()

  const [sortField, setSortField] = useState<SortField>('value')
  const [sortDir,   setSortDir]   = useState<SortDir>('desc')

  function handleSort(field: SortField) {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const sortedAssets = useMemo(() => {
    if (!currentPortfolio?.assets) return []
    return [...currentPortfolio.assets].sort((a, b) => {
      const av = (a[sortField] as number) ?? 0
      const bv = (b[sortField] as number) ?? 0
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }, [currentPortfolio?.assets, sortField, sortDir])

  if (!currentPortfolio || sortedAssets.length === 0) {
    return <EmptyState variant="portfolio" />
  }

  return (
    <div
      className="overflow-x-auto rounded-xl border"
      style={{ borderColor: 'var(--border)' }}
      role="region"
      aria-label="Portfolio assets"
      aria-live="polite"
    >
      <table className="w-full" role="table">
        <thead>
          <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <th
              className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}
              scope="col"
            >
              Asset
            </th>
            {COLS.map(col => (
              <th
                key={col.field}
                scope="col"
                className={`px-4 py-3 text-xs font-medium uppercase tracking-wide cursor-pointer select-none ${col.cls}`}
                style={{ color: sortField === col.field ? 'var(--primary)' : 'var(--text-muted)' }}
                onClick={() => handleSort(col.field)}
                aria-sort={sortField === col.field ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                {col.label} {sortField === col.field ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
            ))}
            <th
              className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}
              scope="col"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedAssets.map(asset => {
            const pnlUp = asset.pnl >= 0
            return (
              <tr
                key={asset.id}
                style={{ borderBottom: '1px solid var(--border)' }}
                className="transition-colors"
                onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in oklch, var(--primary) 3%, var(--surface))')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Asset name */}
                <td className="px-4 py-3">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{asset.name}</p>
                  <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{asset.symbol}</p>
                </td>

                {/* Holdings */}
                <td className="px-4 py-3 text-right">
                  <span className="text-sm num font-mono" style={{ color: 'var(--text)' }}>
                    {asset.amount.toFixed(4)}
                  </span>
                </td>

                {/* Value */}
                <td className="px-4 py-3 text-right">
                  <span className="text-sm num font-semibold" style={{ color: 'var(--text)' }}>
                    {fmtPrice(asset.value)}
                  </span>
                </td>

                {/* P&L */}
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    <span
                      className="inline-flex items-center gap-0.5 text-sm num font-medium"
                      style={{ color: pnlUp ? 'var(--green)' : 'var(--red)' }}
                    >
                      {pnlUp
                        ? <TrendingUp  size={12} aria-hidden="true" />
                        : <TrendingDown size={12} aria-hidden="true" />
                      }
                      {fmtPrice(Math.abs(asset.pnl))}
                    </span>
                    <span
                      className="inline-flex items-center gap-0.5 text-xs num px-1.5 py-0.5 rounded-full"
                      style={{
                        color:      pnlUp ? 'var(--green)'        : 'var(--red)',
                        background: pnlUp ? 'var(--green-subtle)' : 'var(--red-subtle)',
                      }}
                    >
                      {fmtPct(asset.pnlPercent)}
                    </span>
                  </div>
                </td>

                {/* Allocation */}
                <td className="px-4 py-3 text-right">
                  <span className="text-sm num" style={{ color: 'var(--text-muted)' }}>
                    {(asset.allocation ?? 0).toFixed(1)}%
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onEditAsset && (
                      <button
                        onClick={() => onEditAsset(asset)}
                        className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label={`Edit ${asset.name}`}
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      onClick={() => removeAsset(currentPortfolio.id, asset.id)}
                      className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                      style={{ color: 'var(--red)' }}
                      aria-label={`Remove ${asset.name} from portfolio`}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
