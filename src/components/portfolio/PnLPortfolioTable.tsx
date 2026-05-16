'use client'

// =============================================================================
// PnL Portfolio Table — shows assets with full P&L breakdown
// =============================================================================

import React, { useState } from 'react'
import { PlusCircleIcon, Trash2Icon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatPercentage } from '@/lib/utils'
import { usePnLPortfolioStore } from '@/store/pnlPortfolioStore'
import { AddAssetModal } from './AddAssetModal'

function PnLBadge({ value, percent }: { value: number; percent?: number }) {
  const positive = value >= 0
  return (
    <div className={cn('text-right', positive ? 'text-bullish' : 'text-bearish')}>
      <div className="font-mono text-sm font-medium">
        {positive ? '+' : ''}{formatCurrency(value)}
      </div>
      {percent !== undefined && (
        <div className="text-xs opacity-80">{positive ? '+' : ''}{percent.toFixed(2)}%</div>
      )}
    </div>
  )
}

export function PnLPortfolioTable() {
  const { assets, summary, removeAsset } = usePnLPortfolioStore()
  const [showModal, setShowModal] = useState(false)

  const totalPnLPositive = summary.totalUnrealizedPnL >= 0

  return (
    <>
      {showModal && <AddAssetModal onClose={() => setShowModal(false)} />}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Portfolio P&amp;L</CardTitle>
            <Button size="sm" onClick={() => setShowModal(true)} className="h-8 gap-1">
              <PlusCircleIcon className="h-4 w-4" />
              Add Asset
            </Button>
          </div>
        </CardHeader>

        {/* Summary bar */}
        {assets.length > 0 && (
          <div className="px-6 pb-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="font-mono font-semibold">{formatCurrency(summary.totalValue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cost Basis</p>
              <p className="font-mono font-semibold">{formatCurrency(summary.totalCostBasis)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unrealized P&amp;L</p>
              <p className={cn('font-mono font-semibold', totalPnLPositive ? 'text-bullish' : 'text-bearish')}>
                {totalPnLPositive ? '+' : ''}{formatCurrency(summary.totalUnrealizedPnL)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Return</p>
              <p className={cn('font-mono font-semibold', totalPnLPositive ? 'text-bullish' : 'text-bearish')}>
                {totalPnLPositive ? '+' : ''}{summary.totalUnrealizedPnLPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        <CardContent className="p-0">
          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <p className="text-sm">No assets yet.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowModal(true)}>
                <PlusCircleIcon className="h-4 w-4 mr-2" />
                Add your first asset
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t text-xs text-muted-foreground">
                    {['Asset', 'Amount', 'Avg Buy', 'Current', 'Value', 'P&L', 'P&L%', 'Alloc%', ''].map((h) => (
                      <th key={h} className="px-4 py-2 text-right first:text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{asset.symbol}</div>
                        <div className="text-xs text-muted-foreground">{asset.name}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{asset.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(asset.avgBuyPrice)}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(asset.currentPrice)}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(asset.currentValue)}</td>
                      <td className="px-4 py-3">
                        <PnLBadge value={asset.unrealizedPnL} />
                      </td>
                      <td className="px-4 py-3">
                        <PnLBadge value={asset.unrealizedPnLPercent} />
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                        {asset.allocationPercent.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-bearish"
                          onClick={() => removeAsset(asset.id)}
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default PnLPortfolioTable
