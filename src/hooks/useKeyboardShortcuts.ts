'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Options {
  onSearch?: () => void
  onHelp?:   () => void
}

/**
 * Global keyboard shortcuts.
 * Must be used inside a component that is inside the router context.
 *
 * Shortcuts:
 *   Cmd/Ctrl+K   → open search
 *   D            → /
 *   W            → /watchlist
 *   P            → /portfolio
 *   A            → /alerts
 *   ?            → help
 */
export function useKeyboardShortcuts({ onSearch, onHelp }: Options = {}) {
  const router = useRouter()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

      // Cmd+K / Ctrl+K — search (always active)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onSearch?.()
        return
      }

      // Single-key shortcuts — skip when user is typing
      if (isInput || e.metaKey || e.ctrlKey || e.altKey) return

      switch (e.key) {
        case 'd': case 'D': router.push('/');           break
        case 'w': case 'W': router.push('/watchlist');  break
        case 'p': case 'P': router.push('/portfolio');  break
        case 'a': case 'A': router.push('/alerts');     break
        case '?':           onHelp?.();                 break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router, onSearch, onHelp])
}
