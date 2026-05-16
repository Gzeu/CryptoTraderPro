'use client'

interface Props {
  prices: number[]
  width?: number
  height?: number
}

export function SparklineChart({ prices, width = 64, height = 32 }: Props) {
  if (!prices?.length) return <div className="skeleton rounded" style={{ width, height }} />

  const min  = Math.min(...prices)
  const max  = Math.max(...prices)
  const norm = prices.map(p => max === min ? 0.5 : (p - min) / (max - min))
  const up   = prices[prices.length - 1] >= prices[0]
  const pts  = norm.map((v, i) => `${(i / (norm.length - 1)) * width},${height - v * (height - 4) - 2}`).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${up ? 'u' : 'd'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? 'var(--green)' : 'var(--red)'} stopOpacity="0.15" />
          <stop offset="100%" stopColor={up ? 'var(--green)' : 'var(--red)'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={up ? 'var(--green)' : 'var(--red)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
