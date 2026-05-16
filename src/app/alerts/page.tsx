'use client'

import React, { useEffect } from 'react'
import { Bell, BellOff, Trash2, Info } from 'lucide-react'
import { useAlertsStore } from '@/store/alertsStore'
import { AlertRow } from '@/components/alerts/AlertRow'
import { AddAlertForm } from '@/components/alerts/AddAlertForm'
import { useNotifications } from '@/hooks/useNotifications'
import { useLivePrices } from '@/hooks/useLivePrice'
import { CG_TO_BINANCE } from '@/lib/cgToBinance'
import { useAlertEngine } from '@/hooks/useAlertEngine'

export default function AlertsPage() {
  const { alerts, dismissAll, clearTriggered } = useAlertsStore()
  const { permission, request, supported } = useNotifications()

  // Collect unique symbols from active alerts
  const activeSymbols = [...new Set(
    alerts
      .filter(a => a.status === 'active')
      .map(a => a.symbol)
      .filter(Boolean)
  )]

  const { priceMap } = useLivePrices(activeSymbols)

  // Build simple number map for AlertEngine
  const numericPriceMap = new Map<string, number>()
  priceMap.forEach((ticker, sym) => numericPriceMap.set(sym, ticker.price))

  // Evaluate alerts every time prices tick
  useAlertEngine(numericPriceMap, CG_TO_BINANCE)

  const activeCount    = alerts.filter(a => a.status === 'active').length
  const triggeredCount = alerts.filter(a => a.status === 'triggered').length

  return (
    <main className="max-w-[var(--content-wide)] mx-auto px-4 py-8 space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[var(--text-xl)] font-display font-bold text-[var(--color-text)] flex items-center gap-2">
            <Bell size={22} className="text-[var(--color-primary)]" />
            Price Alerts
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {activeCount} active · {triggeredCount} triggered
          </p>
        </div>

        <div className="flex gap-2">
          {triggeredCount > 0 && (
            <button
              onClick={clearTriggered}
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-offset)] transition-colors"
            >
              <Trash2 size={13} /> Clear triggered
            </button>
          )}
          {activeCount > 0 && (
            <button
              onClick={dismissAll}
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-offset)] transition-colors"
            >
              <BellOff size={13} /> Dismiss all
            </button>
          )}
        </div>
      </div>

      {/* Notification permission banner */}
      {supported && permission !== 'granted' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-warning-highlight)] border border-[var(--color-warning)] text-sm">
          <Info size={16} className="text-[var(--color-warning)] mt-0.5 shrink-0" />
          <div>
            <span className="font-medium text-[var(--color-text)]">Browser notifications are {permission === 'denied' ? 'blocked' : 'not enabled'}.</span>
            {' '}Alerts will still update in the table, but you won&apos;t get pop-up notifications.
            {permission === 'default' && (
              <button
                onClick={request}
                className="ml-2 underline font-medium text-[var(--color-warning)] hover:text-[var(--color-warning-hover)] transition-colors"
              >
                Enable now
              </button>
            )}
          </div>
        </div>
      )}

      {!supported && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-surface-offset)] text-sm text-[var(--color-text-muted)]">
          <Info size={15} />
          Browser notifications are not supported in this environment.
        </div>
      )}

      {/* Add alert form */}
      <AddAlertForm />

      {/* Alerts table */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell size={40} className="text-[var(--color-text-faint)] mb-4" />
          <h3 className="font-semibold text-[var(--color-text)] mb-1">No alerts yet</h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-[36ch]">
            Add a price alert above. You&apos;ll get a browser notification the moment the price crosses your target.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-offset)] border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <th className="py-2.5 px-4 text-left font-medium">Coin</th>
                <th className="py-2.5 px-4 text-right font-medium">Target</th>
                <th className="py-2.5 px-4 text-right font-medium">Current</th>
                <th className="py-2.5 px-4 text-center font-medium">Status</th>
                <th className="py-2.5 px-4 text-right font-medium hidden sm:table-cell">Created</th>
                <th className="py-2.5 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(alert => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  currentPrice={priceMap.get(alert.symbol)?.price ?? null}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
