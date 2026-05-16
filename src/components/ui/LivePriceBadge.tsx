'use client'

// =============================================================================
// LivePriceBadge — shows a real-time price with a green pulse dot
// Drop-in anywhere you need a live price display
// =============================================================================

import { useLivePrice } from '@/hooks/useLivePrice'

interface Props {
  symbol:    string  // e.g. 'BTCUSDT'
  className?: string
  showChange?: boolean
}

export function LivePriceBadge({ symbol, className = '', showChange = true }: Props) {
  const { price, priceChangePercent, isLive } = useLivePrice(symbol)

  const fmt = (n: number) =>
    n >= 1_000
      ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })

  const pct  = priceChangePercent ?? 0
  const pos  = pct >= 0
  const col  = pos ? 'var(--success)' : 'var(--error)'

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-sm num ${className}`}>
      {/* live indicator */}
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${isLive ? 'animate-pulse' : 'opacity-30'}`}
        style={{ background: isLive ? 'var(--success)' : 'var(--text-faint)' }}
        title={isLive ? 'Live' : 'Connecting…'}
      />
      {price !== null ? (
        <>
          <span style={{ color: 'var(--text)' }}>${fmt(price)}</span>
          {showChange && (
            <span style={{ color: col }}>
              {pos ? '+' : ''}{pct.toFixed(2)}%
            </span>
          )}
        </>
      ) : (
        <span style={{ color: 'var(--text-faint)' }}>—</span>
      )}
    </span>
  )
}
