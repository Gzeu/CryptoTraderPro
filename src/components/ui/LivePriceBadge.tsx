'use client'

// =============================================================================
// LivePriceBadge — real-time price via Binance WS feed
// Green pulse dot = live | grey dot = connecting
// =============================================================================

import { useLivePrice } from '@/hooks/useLivePrice'

interface Props {
  symbol:      string   // e.g. 'BTCUSDT'
  className?:  string
  showChange?: boolean  // show 24h % change from WS ticker (default true)
}

export function LivePriceBadge({ symbol, className = '', showChange = true }: Props) {
  const { price, priceChangePercent, isLive } = useLivePrice(symbol)

  const fmt = (n: number) =>
    n >= 1_000
      ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })

  const pct = priceChangePercent ?? 0
  const pos = pct >= 0

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono num ${className}`}>
      {/* live indicator dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${isLive ? 'animate-pulse' : 'opacity-30'}`}
        style={{ background: isLive ? 'var(--success)' : 'var(--text-faint)' }}
        title={isLive ? 'Live' : 'Connecting…'}
      />
      {price !== null ? (
        <>
          <span style={{ color: 'var(--text)' }}>${fmt(price)}</span>
          {showChange && (
            <span style={{ color: pos ? 'var(--success)' : 'var(--error)' }}>
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
