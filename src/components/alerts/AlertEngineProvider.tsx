'use client'

import { useEffect, useRef } from 'react'
import { useAlertStore } from '@/store/alertStore'
import { alertEngine } from '@/lib/alertEngine'
import { useToastStore } from '@/store/toastStore'

export function AlertEngineProvider() {
  const alerts    = useAlertStore(s => s.alerts)
  const pushToast = useToastStore(s => s.push)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    alertEngine.start((alert, price) => {
      const dir = alert.direction === 'above' ? '▲ above' : '▼ below'
      const msg = `${alert.coinName} ${dir} $${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`

      pushToast({ type: 'alert', title: '🔔 Price Alert', message: msg, coinId: alert.coinId })

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('CryptoTraderPro Alert', {
            body:   msg,
            icon:   '/CryptoTraderPro/favicon.svg',
            tag:    `ctp-alert-${alert.id}`,
            silent: false,
          })
        } catch { /* non-critical */ }
      }
    })

    return () => alertEngine.stop()
  }, [])

  useEffect(() => {
    alertEngine.sync(alerts)
  }, [alerts])

  return null
}
