'use client'

import { useEffect, useRef } from 'react'
import { useAlertStore } from '@/store/alertStore'
import { type Coin } from '@/types'

/**
 * Checks active price alerts against live market data every time `coins` updates.
 * Fires a browser Notification if the threshold is crossed.
 * Call once inside a top-level component (e.g. providers or layout).
 */
export function useAlertWatcher(coins: Coin[]) {
  const { alerts, markTriggered } = useAlertStore()
  const notifiedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!coins.length || !alerts.length) return

    alerts.forEach(alert => {
      if (alert.triggered || notifiedRef.current.has(alert.id)) return
      const coin = coins.find(c => c.id === alert.coinId)
      if (!coin) return

      const price = coin.current_price
      const hit   = alert.direction === 'above'
        ? price >= alert.price
        : price <= alert.price

      if (!hit) return

      // Mark so we don't fire twice in the same session
      notifiedRef.current.add(alert.id)
      markTriggered(alert.id)

      // Browser notification
      const send = () => {
        new Notification(`${coin.name} Alert 🔔`, {
          body: `Price ${alert.direction === 'above' ? 'reached' : 'dropped to'} $${price.toLocaleString()}`,
          icon: coin.image,
          tag:  alert.id,
        })
      }

      if (Notification.permission === 'granted') {
        send()
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(p => { if (p === 'granted') send() })
      }
    })
  }, [coins, alerts, markTriggered])
}
