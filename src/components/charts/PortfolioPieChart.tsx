'use client'

// =============================================================================
// PortfolioPieChart — allocation donut chart using Recharts
// =============================================================================

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const PALETTE = [
  '#01696f', '#d19900', '#a12c7b', '#006494',
  '#437a22', '#7a39bb', '#da7101', '#a13544',
]

export interface PieSlice {
  name:  string
  value: number   // USD value
  pct:   number   // 0-100
}

interface Props {
  data:    PieSlice[]
  isDark:  boolean
  height?: number
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: PieSlice; name: string }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border px-3 py-2 text-xs shadow-lg"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{d.name}</p>
      <p style={{ color: 'var(--color-text-muted)' }}>
        ${d.value.toLocaleString('en-US', { maximumFractionDigits: 2 })} · {d.pct.toFixed(1)}%
      </p>
    </div>
  )
}

export function PortfolioPieChart({ data, isDark, height = 300 }: Props) {
  if (data.length === 0) return null

  const textColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(val: string) => val}
          wrapperStyle={{ fontSize: 12, color: textColor, paddingTop: 12 }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
