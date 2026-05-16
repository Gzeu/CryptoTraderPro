'use client'

import { Bell, Trash2, CheckCircle } from 'lucide-react'
import { useAlertStore } from '@/store/alertStore'
import { fmtPrice } from '@/lib/formatters'
import { EmptyState } from '@/components/ui/EmptyState'

export function AlertsPanel() {
  const { alerts, removeAlert, clearAll } = useAlertStore()
  const active    = alerts.filter(a => !a.triggered)
  const triggered = alerts.filter(a => a.triggered)

  if (!alerts.length) {
    return (
      <EmptyState
        variant="search"
        title="No alerts set"
        description="Go to a coin page and set a price alert — you'll get a browser notification."
      />
    )
  }

  return (
    <div className="space-y-3">
      {alerts.length > 1 && (
        <div className="flex justify-end">
          <button onClick={clearAll} className="text-xs flex items-center gap-1 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-muted)' }}>
            <Trash2 size={11} /> Clear all
          </button>
        </div>
      )}

      {active.length > 0 && (
        <>
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Active ({active.length})</p>
          {active.map(a => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border px-3 py-2.5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Bell size={13} style={{ color: 'var(--primary)' }} />
                <div>
                  <p className="text-sm font-medium">{a.coinName}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {a.direction === 'above' ? '≥' : '≤'} {fmtPrice(a.price)}
                  </p>
                </div>
              </div>
              <button onClick={() => removeAlert(a.id)} className="p-1.5 rounded hover:opacity-60 transition-opacity"
                style={{ color: 'var(--text-faint)' }} aria-label="Remove alert">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </>
      )}

      {triggered.length > 0 && (
        <>
          <p className="text-xs font-medium mt-2" style={{ color: 'var(--text-muted)' }}>Triggered ({triggered.length})</p>
          {triggered.map(a => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border px-3 py-2.5 opacity-60"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <CheckCircle size={13} style={{ color: 'var(--green)' }} />
                <div>
                  <p className="text-sm font-medium">{a.coinName}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {a.direction === 'above' ? '≥' : '≤'} {fmtPrice(a.price)} · triggered
                  </p>
                </div>
              </div>
              <button onClick={() => removeAlert(a.id)} className="p-1.5 rounded hover:opacity-60 transition-opacity"
                style={{ color: 'var(--text-faint)' }} aria-label="Remove">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
