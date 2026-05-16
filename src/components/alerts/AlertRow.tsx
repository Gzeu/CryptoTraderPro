'use client'

import React from 'react'
import { Trash2, BellRing, BellOff, CheckCircle2 } from 'lucide-react'
import type { AlertEntry } from '@/store/alertsStore'
import { useAlertsStore } from '@/store/alertsStore'
import { PriceCell } from '@/components/ui/PriceCell'
import { Badge } from '@/components/ui/Badge'
import { fmtPrice, fmtDate } from '@/lib/formatters'

const STATUS_MAP: Record<AlertEntry['status'], { label: string; variant: 'success' | 'warning' | 'info' }> = {
  active:    { label: 'Active',    variant: 'info' },
  triggered: { label: 'Triggered', variant: 'success' },
  dismissed: { label: 'Dismissed', variant: 'warning' },
}

interface AlertRowProps {
  alert: AlertEntry
  currentPrice?: number | null
}

export function AlertRow({ alert, currentPrice }: AlertRowProps) {
  const { removeAlert, updateStatus } = useAlertsStore()

  const { label, variant } = STATUS_MAP[alert.status]

  const diff =
    currentPrice != null
      ? ((currentPrice - alert.targetPrice) / alert.targetPrice) * 100
      : null

  return (
    <tr className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-offset)] transition-colors">
      {/* Coin */}
      <td className="py-3 px-4">
        <div className="font-medium text-[var(--color-text)]">{alert.coinName}</div>
        <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">
          {alert.direction === 'above' ? '↑ above' : '↓ below'}
        </div>
      </td>

      {/* Target */}
      <td className="py-3 px-4 tabular-nums text-right">
        <span className="font-medium">{fmtPrice(alert.targetPrice)}</span>
      </td>

      {/* Current price */}
      <td className="py-3 px-4 tabular-nums text-right">
        {currentPrice != null ? (
          <PriceCell price={currentPrice} pct={diff} />
        ) : (
          <span className="text-[var(--color-text-faint)]">—</span>
        )}
      </td>

      {/* Status */}
      <td className="py-3 px-4 text-center">
        <Badge variant={variant}>{label}</Badge>
      </td>

      {/* Created */}
      <td className="py-3 px-4 text-right text-xs text-[var(--color-text-muted)] tabular-nums hidden sm:table-cell">
        {fmtDate(alert.createdAt)}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {alert.status === 'triggered' && (
            <button
              onClick={() => updateStatus(alert.id, 'dismissed')}
              title="Dismiss"
              className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-highlight)] transition-colors"
            >
              <BellOff size={15} />
            </button>
          )}
          {alert.status === 'active' && (
            <button
              onClick={() => updateStatus(alert.id, 'dismissed')}
              title="Mark dismissed"
              className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-warning)] hover:bg-[var(--color-warning-highlight)] transition-colors"
            >
              <CheckCircle2 size={15} />
            </button>
          )}
          <button
            onClick={() => removeAlert(alert.id)}
            title="Delete alert"
            className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-highlight)] transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}
