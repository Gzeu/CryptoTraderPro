'use client'

// =============================================================================
// useAlertChecker — monitors live prices and fires notifications
// =============================================================================

import { useEffect, useRef } from 'react'
import { useMultipleWebSocketPrices } from './useMultipleWebSocketPrices'
import { useAlertsStore } from '@/store/alertsStore'

const WATCHED_SYMBOLS = ['btcusdt', 'ethusdt', 'egldusdt', 'solusdt', 'bnbusdt', 'xrpusdt', 'adausdt']

export function useAlertChecker() {
  const { prices } = useMultipleWebSocketPrices(WATCHED_SYMBOLS)
  const { alerts, markTriggered, markNotified, updateCurrentPrice } = useAlertsStore()
  const notificationPermission = useRef<NotificationPermission>('default')

  // Request notification permission once
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        notificationPermission.current = perm
      })
    } else {
      notificationPermission.current = Notification.permission
    }
  }, [])

  // Check alerts on every price update
  useEffect(() => {
    prices.forEach((priceData, symbol) => {
      const price = priceData.price
      // Update current price in store for UI display
      updateCurrentPrice(symbol.replace('usdt', '').toUpperCase(), price)

      const activeAlerts = alerts.filter(
        (a) =>
          !a.triggered &&
          a.symbol.toLowerCase() === symbol.replace('usdt', '').toLowerCase()
      )

      activeAlerts.forEach((alert) => {
        const triggered =
          (alert.condition === 'above' && price >= alert.targetPrice) ||
          (alert.condition === 'below' && price <= alert.targetPrice)

        if (triggered) {
          markTriggered(alert.id)

          // Browser Notification
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            notificationPermission.current === 'granted' &&
            !alert.notified
          ) {
            try {
              new Notification(`🚨 ${alert.symbol} Alert Triggered!`, {
                body: `${alert.symbol} is ${alert.condition} $${alert.targetPrice.toLocaleString()} (current: $${price.toLocaleString()})`,
                icon: '/favicon.ico',
              })
            } catch {
              // Notifications not supported in this context
            }
            markNotified(alert.id)
          }
        }
      })
    })
  }, [prices, alerts, markTriggered, markNotified, updateCurrentPrice])
}

export default useAlertChecker
