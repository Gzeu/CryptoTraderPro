'use client'

// =============================================================================
// ComparisonChart — normalised % performance chart for multiple coins
// Uses lightweight-charts (Recharts fallback via CDN not needed — pure canvas)
// Built with recharts LineChart to stay consistent with existing chart stack.
// =============================================================================

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import { fmtDate } from '@/lib/formatters'

const PALETTE = [
  '#01696f', // teal  (primary)
  '#d19900', // gold
  '#a12c7b', // magenta
  '#006494', // blue
  '#437a22', // green
  '#7a39bb', // purple
]

export interface ComparisonSeries {
  coinId:   string
  coinName: string
  // [timestamp, price] pairs from CoinGecko market_chart
  prices:   [number, number][]
}

interface DataPoint {
  ts:    number
  [key: string]: number
}

function normalise(series: ComparisonSeries[]): DataPoint[] {
  if (series.length === 0) return []

  // Use the shortest series length so all lines stay aligned
  const minLen = Math.min(...series.map(s => s.prices.length))
  if (minLen === 0) return []

  // Subsample to ~120 points max for perf
  const step  = Math.max(1, Math.floor(minLen / 120))
  const points: DataPoint[] = []

  for (let i = 0; i < minLen; i += step) {
    const point: DataPoint = { ts: series[0].prices[i][0] }
    series.forEach(s => {
      const base  = s.prices[0][1]
      const curr  = s.prices[i]?.[1] ?? base
      point[s.coinId] = base > 0 ? ((curr - base) / base) * 100 : 0
    })
    points.push(point)
  }
  return points
}

interface Props {
  series:  ComparisonSeries[]
  isDark:  boolean
  height?: number
}

export function ComparisonChart({ series, isDark, height = 300 }: Props) {
  const data   = normalise(series)
  const muted  = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'
  const textC  = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm" style={{ color: textC }}>No data</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={muted} />
        <XAxis dataKey="ts" scale="time" type="number"
          domain={['dataMin', 'dataMax']}
          tickCount={5}
          tickFormatter={(v: number) => fmtDate(new Date(v))}
          tick={{ fill: textC, fontSize: 11 }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
          tick={{ fill: textC, fontSize: 11 }}
          axisLine={false} tickLine={false} width={56}
        />
        <Tooltip
          contentStyle={{
            background: isDark ? '#1c1b19' : '#f9f8f5',
            border:     `1px solid ${muted}`,
            borderRadius: 10, fontSize: 12,
          }}
          labelFormatter={(v: number) => fmtDate(new Date(v))}
          formatter={(val: number, name: string) => [
            `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`,
            series.find(s => s.coinId === name)?.coinName ?? name,
          ]}
        />
        <Legend
          formatter={(val: string) =>
            series.find(s => s.coinId === val)?.coinName ?? val
          }
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        {series.map((s, i) => (
          <Line key={s.coinId} type="monotone"
            dataKey={s.coinId}
            stroke={PALETTE[i % PALETTE.length]}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
