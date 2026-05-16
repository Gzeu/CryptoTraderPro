import { useEffect, useRef } from 'react'
import { useAlertsStore } from '@/store/alertsStore'
import { useNotifications } from '@/hooks/useNotifications'
import { fmtPrice } from '@/lib/formatters'

/**
 * useAlertEngine — evaluates active alerts against live prices on every tick.
 *
 * Call once in a top-level component (e.g. Providers or layout) that has access
 * to the live price map.
 *
 * @param priceMap  Map<binanceSymbol, price>  e.g. { BTCUSDT: 67420 }
 * @param cgToBinance  Record<coinGeckoId, binanceSymbol>
 */
export function useAlertEngine(
  priceMap: Map<string, number>,
  cgToBinance: Record<string, string>
) {
  const { alerts, updateStatus } = useAlertsStore()
  const { notify } = useNotifications()
  // Prevent double-firing the same alert within a session
  const firedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (priceMap.size === 0) return

    alerts.forEach(alert => {
      if (alert.status !== 'active') return
      if (firedRef.current.has(alert.id)) return

      const symbol = cgToBinance[alert.coinId]
      if (!symbol) return

      const currentPrice = priceMap.get(symbol)
      if (currentPrice == null) return

      const triggered =
        alert.direction === 'above'
          ? currentPrice >= alert.targetPrice
          : currentPrice <= alert.targetPrice

      if (triggered) {
        firedRef.current.add(alert.id)
        updateStatus(alert.id, 'triggered')
        notify(
          `🔔 ${alert.coinName} alert triggered`,
          {
            body: `Price ${alert.direction === 'above' ? 'reached' : 'dropped to'} ${fmtPrice(currentPrice)} (target: ${fmtPrice(alert.targetPrice)})`,
            tag: alert.id,
          }
        )
      }
    })
  }, [priceMap, alerts, updateStatus, notify, cgToBinance])
}
