// =============================================================================
// Performance Chart - Historical portfolio performance line chart
// =============================================================================

'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PerformanceData {
  date: string
  value: number
  pnl: number
}

interface PerformanceChartProps {
  data: PerformanceData[]
  height?: number
  chartType?: 'line' | 'area'
  showGrid?: boolean
}

export function PerformanceChart({
  data,
  height = 300,
  chartType = 'area',
  showGrid = true
}: PerformanceChartProps) {
  const stats = useMemo(() => {
    if (data.length === 0) return null

    const firstValue = data[0].value
    const lastValue = data[data.length - 1].value
    const change = lastValue - firstValue
    const changePercent = (change / firstValue) * 100

    const maxValue = Math.max(...data.map(d => d.value))
    const minValue = Math.min(...data.map(d => d.value))

    return {
      current: lastValue,
      change,
      changePercent,
      max: maxValue,
      min: minValue,
      isPositive: change >= 0
    }
  }, [data])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">
            {new Date(data.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(data.value)}
          </p>
          <p className={`text-sm font-medium ${
            data.pnl >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {data.pnl >= 0 ? '+' : ''}{formatCurrency(data.pnl)}
          </p>
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8">
        <p className="text-sm text-muted-foreground">
          No performance data available
        </p>
      </div>
    )
  }

  const Chart = chartType === 'area' ? AreaChart : LineChart
  const ChartElement = chartType === 'area' ? Area : Line

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Performance</h3>
        {stats && (
          <div className="text-right">
            <p className="text-2xl font-bold">
              {formatCurrency(stats.current)}
            </p>
            <div className={`flex items-center justify-end gap-1 text-sm font-medium ${
              stats.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {stats.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {stats.isPositive ? '+' : ''}{formatCurrency(stats.change)}
              <span className="text-xs">
                ({stats.isPositive ? '+' : ''}{stats.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <ResponsiveContainer width="100%" height={height}>
          <Chart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
              />
            )}
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis
              tickFormatter={formatCurrency}
              stroke="#9ca3af"
              fontSize={12}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            {chartType === 'area' ? (
              <Area
                type="monotone"
                dataKey="value"
                stroke={stats?.isPositive ? '#10b981' : '#ef4444'}
                fill={stats?.isPositive ? '#10b98120' : '#ef444420'}
                strokeWidth={2}
                animationBegin={0}
                animationDuration={800}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="value"
                stroke={stats?.isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                dot={false}
                animationBegin={0}
                animationDuration={800}
              />
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
