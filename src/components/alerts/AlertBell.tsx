'use client'

// =============================================================================
// AlertBell — navbar bell icon with badge and dropdown
// =============================================================================

import React, { useState, useRef, useEffect } from 'react'
import { BellIcon, CheckCircleIcon, Trash2Icon } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useAlertsStore } from '@/store/alertsStore'
import { Button } from '@/components/ui/button'

export function AlertBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { alerts, removeAlert } = useAlertsStore()

  const activeCount = alerts.filter((a) => !a.triggered).length
  const recent = alerts.slice(0, 8)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)} aria-label="Price Alerts">
        <div className="relative">
          <BellIcon className="h-5 w-5" />
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-bearish text-[10px] font-bold text-white">
              {activeCount > 9 ? '9+' : activeCount}
            </span>
          )}
        </div>
      </Button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border bg-background shadow-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold">Price Alerts</h3>
            <span className="text-xs text-muted-foreground">{activeCount} active</span>
          </div>

          {recent.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">No alerts set</div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {recent.map((alert) => (
                <div key={alert.id} className={cn(
                  'flex items-center justify-between px-4 py-2.5 border-b last:border-0 text-sm',
                  alert.triggered && 'opacity-50'
                )}>
                  <div className="flex items-center gap-2">
                    {alert.triggered
                      ? <CheckCircleIcon className="h-4 w-4 text-bullish flex-shrink-0" />
                      : <BellIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    <div>
                      <span className="font-medium">{alert.symbol}</span>
                      <span className="text-muted-foreground mx-1">{alert.condition === 'above' ? '↑' : '↓'}</span>
                      <span className="font-mono">{formatCurrency(alert.targetPrice)}</span>
                      {alert.triggered && <span className="ml-1 text-xs text-bullish">✓ fired</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-bearish flex-shrink-0" onClick={() => removeAlert(alert.id)}>
                    <Trash2Icon className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 py-2 border-t">
            <a href="/alerts" className="text-xs text-primary hover:underline">Manage all alerts →</a>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertBell
