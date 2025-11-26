// =============================================================================
// Portfolio Overview Component - Summary analytics cards
// =============================================================================

'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, PieChart, AlertTriangle, Target, Activity } from 'lucide-react'
import { usePortfolioStore } from '@/store/portfolioStore'
import { usePortfolioAnalytics } from '@/hooks/usePortfolioAnalytics'

interface StatCardProps {
  title: string
  value: string
  change?: string
  changePercent?: number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

function StatCard({ title, value, change, changePercent, icon, trend = 'neutral' }: StatCardProps) {
  const trendColor = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500',
  }[trend]

  const bgColor = {
    up: 'bg-green-500/10',
    down: 'bg-red-500/10',
    neutral: 'bg-gray-500/10',
  }[trend]

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">{value}</h3>
          {change && (
            <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${trendColor}`}>
              {trend === 'up' && <TrendingUp className="h-4 w-4" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4" />}
              <span>{change}</span>
              {changePercent !== undefined && (
                <span className="text-xs">({changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%)</span>
              )}
            </div>
          )}
        </div>
        <div className={`rounded-lg p-3 ${bgColor}`}>
          <div className={trendColor}>{icon}</div>
        </div>
      </div>
    </div>
  )
}

export function PortfolioOverview() {
  const currentPortfolio = usePortfolioStore(state => state.getCurrentPortfolio())
  const analytics = usePortfolioAnalytics()

  const stats = useMemo(() => {
    if (!analytics || !currentPortfolio) {
      return null
    }

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    }

    return {
      totalValue: formatCurrency(analytics.totalValue),
      totalPnl: formatCurrency(analytics.totalPnl),
      totalPnlPercent: analytics.totalPnlPercent,
      dayChange: formatCurrency(analytics.dayChange),
      dayChangePercent: analytics.dayChangePercent,
      diversification: analytics.diversificationScore.toFixed(0),
      riskLevel: analytics.riskLevel,
      assetCount: currentPortfolio.assets.length,
      bestPerformer: analytics.bestPerformer,
      worstPerformer: analytics.worstPerformer,
    }
  }, [analytics, currentPortfolio])

  if (!currentPortfolio) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
        <PieChart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Portfolio Selected</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a portfolio to start tracking your crypto investments
        </p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Activity className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Loading portfolio data...</p>
      </div>
    )
  }

  const getTrendDirection = (value: number): 'up' | 'down' | 'neutral' => {
    if (value > 0) return 'up'
    if (value < 0) return 'down'
    return 'neutral'
  }

  const getRiskBadge = () => {
    const colors = {
      low: 'bg-green-500/10 text-green-500 border-green-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      high: 'bg-red-500/10 text-red-500 border-red-500/20',
    }

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${colors[stats.riskLevel]}`}>
        <AlertTriangle className="h-3 w-3" />
        {stats.riskLevel.toUpperCase()} RISK
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{currentPortfolio.name}</h2>
          {currentPortfolio.description && (
            <p className="mt-1 text-sm text-muted-foreground">{currentPortfolio.description}</p>
          )}
        </div>
        {getRiskBadge()}
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Value"
          value={stats.totalValue}
          change={stats.dayChange}
          changePercent={stats.dayChangePercent}
          icon={<PieChart className="h-6 w-6" />}
          trend={getTrendDirection(stats.dayChangePercent)}
        />

        <StatCard
          title="Total P&L"
          value={stats.totalPnl}
          changePercent={stats.totalPnlPercent}
          icon={stats.totalPnlPercent >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
          trend={getTrendDirection(stats.totalPnlPercent)}
        />

        <StatCard
          title="Diversification"
          value={`${stats.diversification}/100`}
          change={`${stats.assetCount} assets`}
          icon={<Target className="h-6 w-6" />}
          trend={parseInt(stats.diversification) > 70 ? 'up' : parseInt(stats.diversification) > 40 ? 'neutral' : 'down'}
        />

        <StatCard
          title="Risk Level"
          value={stats.riskLevel.toUpperCase()}
          change={stats.riskLevel === 'low' ? 'Well balanced' : stats.riskLevel === 'medium' ? 'Moderate risk' : 'High concentration'}
          icon={<AlertTriangle className="h-6 w-6" />}
          trend={stats.riskLevel === 'low' ? 'up' : stats.riskLevel === 'medium' ? 'neutral' : 'down'}
        />
      </div>

      {/* Top/Bottom Performers */}
      {(stats.bestPerformer || stats.worstPerformer) && (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.bestPerformer && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-green-500">Best Performer</h3>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stats.bestPerformer.symbol}</p>
                <p className="text-sm text-muted-foreground">{stats.bestPerformer.coinId}</p>
                <p className="mt-2 text-lg font-semibold text-green-500">
                  +{stats.bestPerformer.pnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          )}

          {stats.worstPerformer && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-red-500">Worst Performer</h3>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stats.worstPerformer.symbol}</p>
                <p className="text-sm text-muted-foreground">{stats.worstPerformer.coinId}</p>
                <p className="mt-2 text-lg font-semibold text-red-500">
                  {stats.worstPerformer.pnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
