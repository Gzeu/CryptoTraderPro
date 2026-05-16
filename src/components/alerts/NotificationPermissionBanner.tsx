'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { useAlertStore } from '@/store/alertStore'

export function NotificationPermissionBanner() {
  const alertCount = useAlertStore(s => s.alerts.length)
  const [show,      setShow]      = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'default') return
    if (dismissed) return
    if (alertCount > 0) setShow(true)
  }, [alertCount, dismissed])

  if (!show) return null

  async function handleAllow() {
    await Notification.requestPermission()
    setShow(false); setDismissed(true)
  }

  return (
    <div role="banner"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg"
      style={{
        background:  'var(--color-surface)',
        borderColor: 'var(--color-border)',
        maxWidth: 420, width: 'calc(100vw - 2rem)',
        animation: 'ctp-toast-in 240ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <Bell size={16} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
      <p className="flex-1 text-sm" style={{ color: 'var(--color-text)' }}>
        Enable browser notifications to get alerted even when the tab is in the background.
      </p>
      <button onClick={handleAllow}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
        style={{ background: 'var(--color-primary)', color: '#fff' }}>
        Allow
      </button>
      <button onClick={() => { setShow(false); setDismissed(true) }}
        className="p-1 rounded hover:opacity-60 transition-opacity"
        style={{ color: 'var(--color-text-faint)' }} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  )
}
