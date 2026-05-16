'use client'

// =============================================================================
// MultiversX Dashboard Page
// =============================================================================

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { MultiversXConnect } from '@/components/multiversx/MultiversXConnect'
import { EgldPriceCard } from '@/components/multiversx/EgldPriceCard'
import { fetchEgldPriceHistory } from '@/lib/multiversx'
import { useMultiversxStore } from '@/store/multiversxStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import Link from 'next/link'
import { CoinsIcon } from 'lucide-react'

const PERIODS = [{ label: '7D', days: 7 }, { label: '30D', days: 30 }, { label: '90D', days: 90 }]

export default function MultiversXPage() {
  const { address, balance } = useMultiversxStore()
  const [period, setPeriod] = useState(7)

  const { data: history, isLoading } = useQuery({
    queryKey: ['egld-history', period],
    queryFn: () => fetchEgldPriceHistory(period),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">MultiversX</h1>
          <p className="text-muted-foreground text-sm">EGLD price, wallet balance and staking.</p>
        </div>
        <Link
          href="/multiversx/staking"
          className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
        >
          <CoinsIcon className="h-4 w-4" />
          Staking Dashboard
        </Link>
      </div>

      <MultiversXConnect />
      <EgldPriceCard />

      {/* Price History */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">EGLD Price History</CardTitle>
            <div className="flex gap-1">
              {PERIODS.map(({ label, days }) => (
                <button
                  key={days}
                  onClick={() => setPeriod(days)}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-md font-medium transition-colors',
                    period === days
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-40 rounded-lg bg-muted animate-pulse" />
          ) : history && history.length > 0 ? (
            <div className="h-40 flex items-end gap-px">
              {history.slice(-60).map((point, i) => {
                const min = Math.min(...history.map((p) => p.price))
                const max = Math.max(...history.map((p) => p.price))
                const pct = max > min ? ((point.price - min) / (max - min)) * 100 : 50
                return (
                  <div
                    key={i}
                    className="flex-1 bg-primary/60 rounded-t-sm transition-all"
                    style={{ height: `${Math.max(4, pct)}%` }}
                    title={`$${point.price.toFixed(2)}`}
                  />
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No data available.</p>
          )}
        </CardContent>
      </Card>

      {/* Wallet Balance */}
      {address && balance !== null && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground font-mono mb-1">{address}</p>
            <p className="text-2xl font-mono font-bold">
              {new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(balance)} EGLD
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
