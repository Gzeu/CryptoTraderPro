// Asset List Component - Detailed portfolio asset table
'use client'
import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Trash2, Edit } from 'lucide-react'
import { usePortfolioStore } from '@/store/portfolioStore'
import type { PortfolioAsset } from '@/types/crypto'

export function AssetList({ onEditAsset }: { onEditAsset?: (asset: PortfolioAsset) => void }) {
  const currentPortfolio = usePortfolioStore(state => state.getCurrentPortfolio())
  const { removeAsset } = usePortfolioStore()
  const [sortField, setSortField] = useState<keyof PortfolioAsset>('value')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const sortedAssets = useMemo(() => {
    if (!currentPortfolio?.assets) return []
    return [...currentPortfolio.assets].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      return 0
    })
  }, [currentPortfolio?.assets, sortField, sortDirection])

  if (!currentPortfolio || sortedAssets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">No assets in portfolio</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase">Asset</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase">Holdings</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase">Value</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase">P&L</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase">Allocation</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sortedAssets.map((asset) => (
            <tr key={asset.id} className="hover:bg-muted/50">
              <td className="px-4 py-3">
                <div className="font-semibold">{asset.name}</div>
                <div className="text-sm text-muted-foreground">{asset.symbol.toUpperCase()}</div>
              </td>
              <td className="px-4 py-3 text-right font-mono">{asset.amount.toFixed(4)}</td>
              <td className="px-4 py-3 text-right font-mono font-semibold">${asset.value.toFixed(2)}</td>
              <td className="px-4 py-3 text-right">
                <div className={asset.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {asset.pnl >= 0 ? <TrendingUp className="inline h-4 w-4" /> : <TrendingDown className="inline h-4 w-4" />}
                  ${Math.abs(asset.pnl).toFixed(2)} ({asset.pnlPercent.toFixed(2)}%)
                </div>
              </td>
              <td className="px-4 py-3 text-right">{asset.allocation?.toFixed(1)}%</td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => removeAsset(currentPortfolio.id, asset.id)} className="text-destructive hover:underline">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
