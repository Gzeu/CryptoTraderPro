// =============================================================================
// Portfolio Allocation Chart - Donut/Pie chart for asset distribution
// =============================================================================

'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { usePortfolioAllocation } from '@/hooks/usePortfolioAnalytics'

interface PortfolioAllocationChartProps {
  height?: number
  showLegend?: boolean
  chartType?: 'pie' | 'donut'
}

export function PortfolioAllocationChart({
  height = 300,
  showLegend = true,
  chartType = 'donut'
}: PortfolioAllocationChartProps) {
  const allocation = usePortfolioAllocation()

  const chartData = useMemo(() => {
    return allocation.map(asset => ({
      name: asset.symbol,
      value: asset.value,
      allocation: asset.allocation,
      color: asset.color,
    }))
  }, [allocation])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)}
          </p>
          <p className="text-sm font-medium text-primary">
            {data.allocation.toFixed(2)}%
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.value}</span>
            <span className="ml-auto text-muted-foreground">
              {entry.payload.allocation.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8">
        <div className="text-center">
          <PieChart className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No assets to display
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Asset Allocation</h3>
      <div className="rounded-xl border border-border bg-card p-6">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ allocation }) => `${allocation.toFixed(1)}%`}
              outerRadius={chartType === 'donut' ? 100 : 120}
              innerRadius={chartType === 'donut' ? 60 : 0}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend content={<CustomLegend />} />}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
