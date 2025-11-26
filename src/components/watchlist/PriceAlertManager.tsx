// Price Alert Manager Component
'use client'
import { useState } from 'react'
import { Bell, BellOff, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import { usePriceAlerts } from '@/hooks/useWatchlist'

export function PriceAlertManager({ coinId }: { coinId?: string }) {
  const { priceAlerts, activeAlerts, triggeredAlerts, removeAlert, updateAlert } = usePriceAlerts()
  const [showTriggered, setShowTriggered] = useState(false)

  const filtered = coinId
    ? priceAlerts.filter(a => a.coinId === coinId)
    : showTriggered ? triggeredAlerts : activeAlerts

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Price Alerts</h3>
        <button
          onClick={() => setShowTriggered(!showTriggered)}
          className="rounded px-3 py-1 text-sm bg-muted hover:bg-muted/80"
        >
          {showTriggered ? 'Triggered' : 'Active'} ({filtered.length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm">No alerts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(alert => (
            <div key={alert.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{alert.name} ({alert.symbol})</h4>
                  <p className="text-sm text-muted-foreground">
                    {alert.type === 'above' && `Alert above $${alert.targetPrice}`}
                    {alert.type === 'below' && `Alert below $${alert.targetPrice}`}
                    {alert.type === 'percent_change' && `Alert on ${alert.targetPrice}% change`}
                  </p>
                  {alert.triggered && <span className="text-xs text-yellow-500">Triggered</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateAlert(alert.id, { enabled: !alert.enabled })}
                    className="p-1 hover:bg-muted rounded"
                  >
                    {alert.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => removeAlert(alert.id)} className="p-1 hover:bg-destructive/10 rounded">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
