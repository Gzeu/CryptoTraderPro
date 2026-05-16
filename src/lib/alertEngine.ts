// =============================================================================
// Alert Engine — runs outside React, subscribes to priceFeed for all active
// alerts and fires callbacks when threshold is crossed.
// =============================================================================

import { priceFeed } from '@/lib/ws/priceFeed'
import { useAlertStore, type PriceAlert } from '@/store/alertStore'

type FireCallback = (alert: PriceAlert, price: number) => void

class AlertEngine {
  private unsubs  = new Map<string, () => void>()
  private onFire: FireCallback | null = null
  private started = false

  start(onFire: FireCallback) {
    this.onFire = onFire
    this.started = true
  }

  sync(alerts: PriceAlert[]) {
    if (!this.started) return

    const active    = alerts.filter(a => !a.triggered)
    const activeIds = new Set(active.map(a => a.id))

    this.unsubs.forEach((unsub, id) => {
      if (!activeIds.has(id)) { unsub(); this.unsubs.delete(id) }
    })

    active.forEach(alert => {
      if (this.unsubs.has(alert.id)) return

      const wsSymbol = alert.coinId.toUpperCase() + 'USDT'
      const unsub = priceFeed.subscribe(wsSymbol, (payload) => {
        const { price } = payload
        const crossed =
          (alert.direction === 'above' && price >= alert.price) ||
          (alert.direction === 'below' && price <= alert.price)

        if (crossed) {
          useAlertStore.getState().markTriggered(alert.id)
          this.onFire?.(alert, price)
          const u = this.unsubs.get(alert.id)
          if (u) { u(); this.unsubs.delete(alert.id) }
        }
      })

      this.unsubs.set(alert.id, unsub)
    })
  }

  stop() {
    this.unsubs.forEach(u => u())
    this.unsubs.clear()
    this.started = false
  }
}

export const alertEngine = new AlertEngine()
