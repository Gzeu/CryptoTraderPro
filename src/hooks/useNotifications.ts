import { useCallback, useEffect, useRef, useState } from 'react'

export type NotificationPermission = 'default' | 'granted' | 'denied'

/**
 * useNotifications — wraps the browser Notification API.
 *
 * Returns:
 *   permission  — current permission state
 *   request()   — asks the user for permission (call on a user gesture)
 *   notify(title, opts) — fires a notification if permission is 'granted'
 *   supported   — true when Notification is available in this browser
 */
export function useNotifications() {
  const supported = typeof window !== 'undefined' && 'Notification' in window

  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? (Notification.permission as NotificationPermission) : 'denied'
  )

  // Keep permission state in sync if user changes it externally
  useEffect(() => {
    if (!supported) return
    const id = setInterval(() => {
      const current = Notification.permission as NotificationPermission
      setPermission(p => (p !== current ? current : p))
    }, 2000)
    return () => clearInterval(id)
  }, [supported])

  const request = useCallback(async () => {
    if (!supported) return 'denied' as NotificationPermission
    const result = await Notification.requestPermission()
    setPermission(result as NotificationPermission)
    return result as NotificationPermission
  }, [supported])

  const notify = useCallback(
    (title: string, opts?: NotificationOptions) => {
      if (!supported || Notification.permission !== 'granted') return null
      const n = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...opts,
      })
      return n
    },
    [supported]
  )

  return { permission, request, notify, supported }
}
