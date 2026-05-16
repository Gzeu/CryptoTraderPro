'use client'

import React, { useState } from 'react'
import { BellPlus } from 'lucide-react'
import { useAlertsStore } from '@/store/alertsStore'
import { CG_TO_BINANCE } from '@/lib/cgToBinance'
import { TOP_COINS } from '@/lib/constants'

/**
 * AddAlertForm — inline form to create a new price alert.
 * Rendered at the top of /alerts page.
 */
export function AddAlertForm() {
  const { addAlert } = useAlertsStore()
  const [coinId, setCoinId] = useState('bitcoin')
  const [direction, setDirection] = useState<'above' | 'below'>('above')
  const [targetPrice, setTargetPrice] = useState('')
  const [error, setError] = useState('')

  const coinOptions = TOP_COINS.filter(c => CG_TO_BINANCE[c.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const price = parseFloat(targetPrice)
    if (isNaN(price) || price <= 0) {
      setError('Enter a valid price > 0')
      return
    }
    const coin = coinOptions.find(c => c.id === coinId)
    if (!coin) return
    addAlert({
      coinId: coin.id,
      coinName: coin.name,
      symbol: CG_TO_BINANCE[coin.id],
      targetPrice: price,
      direction,
    })
    setTargetPrice('')
    setError('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap gap-3 items-end p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm"
    >
      {/* Coin selector */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--color-text-muted)] font-medium">Coin</label>
        <select
          value={coinId}
          onChange={e => setCoinId(e.target.value)}
          className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
        >
          {coinOptions.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Direction */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--color-text-muted)] font-medium">Direction</label>
        <select
          value={direction}
          onChange={e => setDirection(e.target.value as 'above' | 'below')}
          className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
        >
          <option value="above">↑ Price goes above</option>
          <option value="below">↓ Price drops below</option>
        </select>
      </div>

      {/* Target price */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--color-text-muted)] font-medium">Target price (USD)</label>
        <input
          type="number"
          step="any"
          min="0"
          placeholder="e.g. 70000"
          value={targetPrice}
          onChange={e => { setTargetPrice(e.target.value); setError('') }}
          className="h-9 w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text)] tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
          required
        />
        {error && <span className="text-xs text-[var(--color-error)]">{error}</span>}
      </div>

      <button
        type="submit"
        className="h-9 inline-flex items-center gap-2 px-4 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] transition-colors"
      >
        <BellPlus size={15} />
        Add Alert
      </button>
    </form>
  )
}
