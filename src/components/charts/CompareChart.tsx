'use client'

import React, { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { fmtDate } from '@/lib/formatters'

export interface PricePoint { ts: number; price: number }

interface CompareChartProps {
  coinA: { id: string; name: string; color: string; data: PricePoint[] }
  coinB: { id: string; name: string; color: string; data: PricePoint[] }
  /** If true, normalizes both series to 100 at first point */
  normalized?: boolean
}

function normalize(data: PricePoint[]): Array<{ ts: number; value: number }> {
  if (!data.length) return []
  const base = data[0].price
  return data.map(d => ({ ts: d.ts, value: base > 0 ? (d.price / base) * 100 : 0 }))
}

const CustomTooltip = ({ active, payload, label, normalized }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] shadow-lg px-3 py-2 text-xs">
      <p className="text-[var(--color-text-muted)] mb-1">{fmtDate(label)}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-[var(--color-text)] font-medium">{p.name}:</span>
          <span className="tabular-nums text-[var(--color-text)]">
            {normalized ? `${p.value.toFixed(2)}%` : `$${p.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          </span>
        </div>
      ))}
    </div>
  )
}

export function CompareChart({ coinA, coinB, normalized = true }: CompareChartProps) {
  const merged = useMemo(() => {
    const seriesA = normalized ? normalize(coinA.data) : coinA.data.map(d => ({ ts: d.ts, value: d.price }))
    const seriesB = normalized ? normalize(coinB.data) : coinB.data.map(d => ({ ts: d.ts, value: d.price }))
    const mapB = new Map(seriesB.map(d => [d.ts, d.value]))
    return seriesA.map(d => ({
      ts: d.ts,
      [coinA.name]: parseFloat(d.value.toFixed(4)),
      [coinB.name]: parseFloat((mapB.get(d.ts) ?? 0).toFixed(4)),
    }))
  }, [coinA, coinB, normalized])

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={merged} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
        <XAxis
          dataKey="ts"
          tickFormatter={ts => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          tickLine={false}
          axisLine={false}
          minTickGap={40}
        />
        <YAxis
          tickFormatter={v => normalized ? `${v.toFixed(0)}%` : `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v.toFixed(0)}`}
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          tickLine={false}
          axisLine={false}
          width={52}
        />
        {normalized && <ReferenceLine y={100} stroke="var(--color-divider)" strokeDasharray="4 4" label={{ value: '100%', fill: 'var(--color-text-faint)', fontSize: 10, position: 'insideLeft' }} />}
        <Tooltip content={<CustomTooltip normalized={normalized} />} />
        <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)', paddingTop: 8 }} />
        <Line type="monotone" dataKey={coinA.name} stroke={coinA.color} dot={false} strokeWidth={2} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey={coinB.name} stroke={coinB.color} dot={false} strokeWidth={2} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
