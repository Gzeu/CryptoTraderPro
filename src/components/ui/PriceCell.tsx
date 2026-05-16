'use client'

import React from 'react'
import { usePriceFlash } from '@/hooks/usePriceFlash'
import { fmtPrice, fmtPct } from '@/lib/formatters'

interface PriceCellProps {
  price: number | null | undefined
  /** Optional: show 24h percent change alongside price */
  pct?: number | null
  /** Extra className on the wrapper span */
  className?: string
  /** Flash duration in ms, default 600 */
  flashDuration?: number
}

/**
 * PriceCell — renders a price with green/red flash animation on change.
 *
 * Add to globals.css:
 *   @keyframes flash-up   { 0%,100% { background: transparent } 50% { background: oklch(0.78 0.17 145 / 0.25) } }
 *   @keyframes flash-down { 0%,100% { background: transparent } 50% { background: oklch(0.55 0.22 25  / 0.25) } }
 *   .flash-up   { animation: flash-up   0.6s ease-out }
 *   .flash-down { animation: flash-down 0.6s ease-out }
 */
export function PriceCell({ price, pct, className = '', flashDuration = 600 }: PriceCellProps) {
  const flash = usePriceFlash(price ?? null, flashDuration)

  const flashClass =
    flash === 'up' ? 'flash-up' :
    flash === 'down' ? 'flash-down' : ''

  const pctColor =
    pct == null ? '' :
    pct > 0 ? 'text-green-500 dark:text-green-400' :
    pct < 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-400'

  return (
    <span
      className={`inline-flex items-center gap-2 tabular-nums rounded px-1 transition-colors ${flashClass} ${className}`}
    >
      <span className="font-medium">
        {price != null ? fmtPrice(price) : '—'}
      </span>
      {pct != null && (
        <span className={`text-xs font-medium ${pctColor}`}>
          {fmtPct(pct)}
        </span>
      )}
    </span>
  )
}
