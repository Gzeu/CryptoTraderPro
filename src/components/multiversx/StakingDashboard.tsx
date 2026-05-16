'use client'

// =============================================================================
// StakingDashboard — EGLD staking overview, validators, delegations
// =============================================================================

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CoinsIcon, UsersIcon, TrendingUpIcon, CalculatorIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { fetchValidators, fetchDelegations, fetchStakingAPR, calcRewards } from '@/lib/multiversx-staking'
import { useMultiversxStore } from '@/store/multiversxStore'

function fmt(n: number, digits = 2) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
}

function APRCard({ apr }: { apr: number }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-start gap-3">
          <TrendingUpIcon className="h-5 w-5 text-bullish mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Network Staking APR</p>
            <p className="text-2xl font-mono font-bold text-bullish">{fmt(apr)}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Annual Percentage Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RewardsCalculator({ apr }: { apr: number }) {
  const [amount, setAmount] = useState('')
  const egld = parseFloat(amount) || 0
  const { yearly, monthly, daily } = calcRewards(egld, apr)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalculatorIcon className="h-5 w-5 text-primary" />
          Rewards Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">EGLD Amount to Stake</label>
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 100"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        {egld > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[{ label: 'Daily', value: daily }, { label: 'Monthly', value: monthly }, { label: 'Yearly', value: yearly }].map(
              ({ label, value }) => (
                <div key={label} className="rounded-lg bg-muted/40 px-3 py-2 text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-mono font-semibold text-bullish">{fmt(value, 4)}</p>
                  <p className="text-xs text-muted-foreground">EGLD</p>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function StakingDashboard() {
  const { address } = useMultiversxStore()
  const [tab, setTab] = useState<'overview' | 'validators' | 'delegations'>('overview')

  const { data: apr = 0, isLoading: aprLoading } = useQuery({
    queryKey: ['staking-apr'],
    queryFn: fetchStakingAPR,
    staleTime: 5 * 60 * 1000,
  })

  const { data: validators = [], isLoading: validatorsLoading } = useQuery({
    queryKey: ['validators'],
    queryFn: () => fetchValidators(20),
    staleTime: 5 * 60 * 1000,
    enabled: tab === 'validators' || tab === 'overview',
  })

  const { data: delegations = [], isLoading: delegationsLoading } = useQuery({
    queryKey: ['delegations', address],
    queryFn: () => fetchDelegations(address!),
    enabled: !!address && tab === 'delegations',
    staleTime: 60 * 1000,
  })

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <TrendingUpIcon className="h-4 w-4" /> },
    { key: 'validators', label: 'Validators', icon: <UsersIcon className="h-4 w-4" /> },
    { key: 'delegations', label: 'My Delegations', icon: <CoinsIcon className="h-4 w-4" /> },
  ] as const

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted/40 rounded-lg p-1 w-fit">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              tab === key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {aprLoading ? (
            <div className="h-20 rounded-xl bg-muted animate-pulse" />
          ) : (
            <APRCard apr={apr} />
          )}
          <RewardsCalculator apr={apr} />
        </div>
      )}

      {/* Validators */}
      {tab === 'validators' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <UsersIcon className="h-5 w-5" />
              Top Validators
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {validatorsLoading ? (
              <div className="p-6 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t text-xs text-muted-foreground">
                      {['Name', 'Locked (EGLD)', 'APR %', 'Nodes'].map((h) => (
                        <th key={h} className="px-4 py-2 text-right first:text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {validators.map((v, i) => (
                      <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium max-w-[180px] truncate">{v.name || v.identity}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{fmt(v.locked)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-bullish">{fmt(v.apr)}%</td>
                        <td className="px-4 py-2.5 text-right font-mono">{v.numNodes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* My Delegations */}
      {tab === 'delegations' && (
        !address ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            <CoinsIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Connect your MultiversX wallet to view delegations.</p>
          </div>
        ) : delegationsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : delegations.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            <p className="text-sm">No delegations found for this address.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {delegations.map((d, i) => (
              <Card key={i}>
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-xs text-muted-foreground font-mono truncate mb-2">{d.contract}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Staked</p>
                      <p className="font-mono font-semibold">{fmt(d.value)} EGLD</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Claimable Rewards</p>
                      <p className="font-mono font-semibold text-bullish">{fmt(d.claimableRewards, 6)} EGLD</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  )
}

export default StakingDashboard
