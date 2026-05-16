'use client'

import React from 'react'
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'
import type { BacktestResult } from '@/lib/backtest'

interface BacktestChartProps {
  result: BacktestResult
  initialCapital: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] shadow-lg px-3 py-2 text-xs">
      <p className="text-[var(--color-text-muted)] mb-1">{new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color ?? p.fill }} />
          <span className="text-[var(--color-text)]">{p.name}:</span>
          <span className="tabular-nums font-medium text-[var(--color-text)]">${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      ))}
    </div>
  )
}

export function BacktestChart({ result, initialCapital }: BacktestChartProps) {
  const buyTs = new Set(result.trades.filter(t => t.type === 'buy').map(t => t.ts))
  const sellTs = new Set(result.trades.filter(t => t.type === 'sell').map(t => t.ts))

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={result.equityCurve} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.18} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
          <XAxis
            dataKey="ts"
            tickFormatter={ts => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickLine={false} axisLine={false} minTickGap={50}
          />
          <YAxis
            tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickLine={false} axisLine={false} width={52}
          />
          <ReferenceLine y={initialCapital} stroke="var(--color-divider)" strokeDasharray="4 4" label={{ value: 'Capital', fill: 'var(--color-text-faint)', fontSize: 10 }} />
          {/* Buy markers */}
          {result.trades.filter(t => t.type === 'buy').map(t => (
            <ReferenceLine key={`b-${t.ts}`} x={t.ts} stroke="var(--color-success)" strokeWidth={1} strokeDasharray="2 4" />
          ))}
          {/* Sell markers */}
          {result.trades.filter(t => t.type === 'sell').map(t => (
            <ReferenceLine key={`s-${t.ts}`} x={t.ts} stroke="var(--color-error)" strokeWidth={1} strokeDasharray="2 4" />
          ))}
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)', paddingTop: 8 }} />
          <Area type="monotone" dataKey="equity" name="Strategy Equity" stroke="var(--color-primary)" fill="url(#equityGrad)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="text-xs text-[var(--color-text-muted)] text-center">
        <span className="inline-flex items-center gap-1"><span className="w-3 h-px bg-green-500 inline-block" /> Buy signal</span>
        <span className="mx-3">·</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-px bg-red-500 inline-block" /> Sell signal</span>
      </p>
    </div>
  )
}
