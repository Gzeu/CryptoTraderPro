'use client'

// =============================================================================
// MultiversX Dashboard Page
// =============================================================================

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MultiversXConnect } from '@/components/multiversx/MultiversXConnect'
import { EgldPriceCard } from '@/components/multiversx/EgldPriceCard'
import { fetchEgldEconomics, fetchEgldPriceHistory } from '@/lib/multiversx'
import { useMultiversXStore } from '@/store/multiversxStore'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type TimeTab = '7' | '30' | '90'

export default function MultiversXPage() {
  const [activeTab, setActiveTab] = useState<TimeTab>('30')
  const { address, walletInfo, egldPrice } = useMultiversXStore()

  const { data: economics } = useQuery({
    queryKey: ['egld-economics'],
    queryFn: fetchEgldEconomics,
    staleTime: 60_000,
  })

  const { data: priceHistory = [] } = useQuery({
    queryKey: ['egld-price-history', activeTab],
    queryFn: () => fetchEgldPriceHistory(parseInt(activeTab)),
    staleTime: 5 * 60_000,
  })

  const tabs: { label: string; value: TimeTab }[] = [
    { label: '7D', value: '7' },
    { label: '30D', value: '30' },
    { label: '90D', value: '90' },
  ]

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">MultiversX</h1>
        <p className="text-muted-foreground text-sm">EGLD price, wallet overview & staking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-1">
          <MultiversXConnect />
        </div>

        <div className="md:col-span-2">
          <EgldPriceCard priceHistory={priceHistory} />
        </div>
      </div>

      {/* Economics Stats */}
      {economics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Market Cap', value: formatCurrency(economics.marketCap) },
            { label: 'Circulating', value: `${(economics.circulatingSupply / 1e6).toFixed(2)}M EGLD` },
            { label: 'Staked', value: `${(economics.staked / 1e6).toFixed(2)}M EGLD` },
            { label: 'Staking APR', value: `${economics.apr?.toFixed(2) ?? '—'}%` },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold font-mono">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Price History Chart Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">EGLD Price History</CardTitle>
            <div className="flex gap-1">
              {tabs.map((t) => (
                <Button
                  key={t.value}
                  size="sm"
                  variant={activeTab === t.value ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(t.value)}
                  className="h-7 px-3 text-xs"
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
            {priceHistory.length > 0
              ? `${priceHistory.length} data points loaded — chart rendered in EgldPriceCard`
              : 'Loading price history...'}
          </div>
        </CardContent>
      </Card>

      {/* Wallet Summary */}
      {address && walletInfo && egldPrice > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold font-mono">
                  {formatCurrency(walletInfo.balance * egldPrice)}
                </p>
                <p className="text-muted-foreground text-sm">
                  {walletInfo.balance.toFixed(6)} EGLD @ {formatCurrency(egldPrice)}
                </p>
              </div>
              <a
                href={`https://explorer.multiversx.com/accounts/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline"
              >
                View on Explorer →
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
