// =============================================================================
// Volume Chart - Trading volume visualization with bar chart
// =============================================================================

'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface VolumeData {
  time: number
  volume: number
  change?: number
}

interface VolumeChartProps {
  data: VolumeData[]
  height?: number
  showGrid?: boolean
}

export function VolumeChart({
  data,
  height = 200,
  showGrid = false
}: VolumeChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: new Date(item.time * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      color: item.change && item.change >= 0 ? '#10b981' : '#ef4444'
    }))
  }, [data])

  const stats = useMemo(() => {
    if (data.length === 0) return null

    const totalVolume = data.reduce((sum, d) => sum + d.volume, 0)
    const avgVolume = totalVolume / data.length
    const maxVolume = Math.max(...data.map(d => d.volume))

    return {
      total: totalVolume,
      average: avgVolume,
      max: maxVolume
    }
  }, [data])

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
    return value.toFixed(2)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{data.date}</p>
          <p className="mt-1 text-lg font-semibold">
            {formatVolume(data.volume)}
          </p>
          {data.change !== undefined && (
            <p className={`text-sm font-medium ${
              data.change >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
            </p>
          )}
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8">
        <p className="text-sm text-muted-foreground">
          No volume data available
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Trading Volume</h3>
        {stats && (
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Avg</p>
              <p className="font-semibold">{formatVolume(stats.average)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Max</p>
              <p className="font-semibold">{formatVolume(stats.max)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
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
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis
              tickFormatter={formatVolume}
              stroke="#9ca3af"
              fontSize={12}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="volume"
              radius={[4, 4, 0, 0]}
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
