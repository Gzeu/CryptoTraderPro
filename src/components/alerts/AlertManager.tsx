'use client'

// =============================================================================
// AlertManager — full alert management UI
// =============================================================================

import React, { useState } from 'react'
import { z } from 'zod'
import { BellPlusIcon, Trash2Icon, BellIcon, CheckCircleIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { useAlertsStore } from '@/store/alertsStore'

const addAlertSchema = z.object({
  symbol: z.string().min(1, 'Symbol required').toUpperCase(),
  condition: z.enum(['above', 'below']),
  targetPrice: z.number().positive('Must be positive'),
})

type FormErrors = Partial<Record<'symbol' | 'targetPrice', string>>

export function AlertManager() {
  const { alerts, addAlert, removeAlert } = useAlertsStore()
  const [form, setForm] = useState({ symbol: '', condition: 'above' as 'above' | 'below', targetPrice: '' })
  const [errors, setErrors] = useState<FormErrors>({})

  const activeAlerts = alerts.filter((a) => !a.triggered)
  const triggeredAlerts = alerts.filter((a) => a.triggered)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = addAlertSchema.safeParse({
      symbol: form.symbol,
      condition: form.condition,
      targetPrice: parseFloat(form.targetPrice),
    })
    if (!parsed.success) {
      const fieldErrors: FormErrors = {}
      parsed.error.errors.forEach((err) => {
        const f = err.path[0] as keyof FormErrors
        fieldErrors[f] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    addAlert({ ...parsed.data, currentPrice: 0 })
    setForm({ symbol: '', condition: 'above', targetPrice: '' })
    setErrors({})
  }

  return (
    <div className="space-y-4">
      {/* Add Alert Form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BellPlusIcon className="h-5 w-5 text-primary" />
            New Price Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-24">
              <label className="text-xs font-medium text-muted-foreground">Symbol</label>
              <input
                value={form.symbol}
                onChange={(e) => { setForm((p) => ({ ...p, symbol: e.target.value })); setErrors((p) => ({ ...p, symbol: undefined })) }}
                placeholder="BTC"
                className={cn(
                  'w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono uppercase placeholder:normal-case placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
                  errors.symbol && 'border-bearish'
                )}
              />
              {errors.symbol && <p className="text-xs text-bearish mt-0.5">{errors.symbol}</p>}
            </div>

            <div className="flex-1 min-w-28">
              <label className="text-xs font-medium text-muted-foreground">Condition</label>
              <div className="flex gap-1 mt-1">
                {(['above', 'below'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, condition: c }))}
                    className={cn(
                      'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      form.condition === c
                        ? c === 'above' ? 'bg-bullish/20 text-bullish border border-bullish/30' : 'bg-bearish/20 text-bearish border border-bearish/30'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {c === 'above' ? '↑ Above' : '↓ Below'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-32">
              <label className="text-xs font-medium text-muted-foreground">Target Price (USD)</label>
              <input
                type="number"
                step="any"
                value={form.targetPrice}
                onChange={(e) => { setForm((p) => ({ ...p, targetPrice: e.target.value })); setErrors((p) => ({ ...p, targetPrice: undefined })) }}
                placeholder="50000"
                className={cn(
                  'w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
                  errors.targetPrice && 'border-bearish'
                )}
              />
              {errors.targetPrice && <p className="text-xs text-bearish mt-0.5">{errors.targetPrice}</p>}
            </div>

            <Button type="submit" className="h-10">
              <BellPlusIcon className="h-4 w-4 mr-2" />
              Set Alert
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BellIcon className="h-5 w-5" />
            Active Alerts
            {activeAlerts.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">{activeAlerts.length}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No active alerts. Set one above.</p>
          ) : (
            <div className="space-y-2">
              {activeAlerts.map((alert) => {
                const progress = alert.currentPrice > 0 && alert.targetPrice > 0
                  ? alert.condition === 'above'
                    ? Math.min((alert.currentPrice / alert.targetPrice) * 100, 100)
                    : Math.min((alert.targetPrice / alert.currentPrice) * 100, 100)
                  : 0
                return (
                  <div key={alert.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">{alert.symbol}</span>
                        <span className="mx-2 text-muted-foreground text-sm">{alert.condition === 'above' ? '↑ above' : '↓ below'}</span>
                        <span className="font-mono text-sm">{formatCurrency(alert.targetPrice)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.currentPrice > 0 && (
                          <span className="text-xs text-muted-foreground font-mono">
                            now: {formatCurrency(alert.currentPrice)}
                          </span>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-bearish" onClick={() => removeAlert(alert.id)}>
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {alert.currentPrice > 0 && (
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', alert.condition === 'above' ? 'bg-bullish' : 'bg-bearish')}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircleIcon className="h-5 w-5 text-bullish" />
              Triggered Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {triggeredAlerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between rounded-lg border border-dashed p-3 opacity-60">
                  <div className="text-sm">
                    <span className="font-semibold">{alert.symbol}</span>
                    <span className="mx-2 text-muted-foreground">{alert.condition === 'above' ? '↑ above' : '↓ below'}</span>
                    <span className="font-mono">{formatCurrency(alert.targetPrice)}</span>
                    {alert.triggeredAt && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        — {new Date(alert.triggeredAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-bearish" onClick={() => removeAlert(alert.id)}>
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AlertManager
