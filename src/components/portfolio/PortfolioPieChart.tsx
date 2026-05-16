'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Holding {
  id: string
  name: string
  symbol: string
  quantity: number
  currentPrice: number
}

interface Props {
  holdings: Holding[]
}

const PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#a855f7',
  '#84cc16', '#6366f1',
]

const OTHER_COLOR = '#94a3b8'

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-sm">
      <div className="font-semibold">{d.name}</div>
      <div className="text-muted-foreground">{d.symbol}</div>
      <div className="mt-1 font-mono">${d.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      <div className="text-blue-500 font-medium">{d.percent.toFixed(2)}%</div>
    </div>
  )
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.04) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {(percent * 100).toFixed(1)}%
    </text>
  )
}

export function PortfolioPieChart({ holdings }: Props) {
  const data = useMemo(() => {
    const items = holdings
      .map((h) => ({
        id: h.id,
        name: h.name,
        symbol: h.symbol.toUpperCase(),
        value: h.quantity * h.currentPrice,
        percent: 0,
      }))
      .filter((h) => h.value > 0)
      .sort((a, b) => b.value - a.value)

    const total = items.reduce((s, i) => s + i.value, 0)
    if (total === 0) return []

    // Group items < 2% into "Other"
    const main: typeof items = []
    let otherValue = 0

    items.forEach((item) => {
      const pct = item.value / total
      if (pct >= 0.02 || main.length < 9) {
        main.push({ ...item, percent: pct * 100 })
      } else {
        otherValue += item.value
      }
    })

    if (otherValue > 0) {
      main.push({
        id: 'other',
        name: 'Other',
        symbol: 'OTHER',
        value: otherValue,
        percent: (otherValue / total) * 100,
      })
    }

    return main
  }, [holdings])

  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Add holdings to see your allocation
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Allocation</h2>
        <span className="text-sm text-muted-foreground">
          Total: ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={130}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.id}
                fill={entry.id === 'other' ? OTHER_COLOR : PALETTE[index % PALETTE.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value, entry: any) => (
              <span className="text-xs text-foreground">
                {entry.payload.symbol} — {entry.payload.percent.toFixed(1)}%
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
