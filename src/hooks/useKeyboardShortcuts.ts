'use client'

// =============================================================================
// useKeyboardShortcuts — global keyboard shortcut handler
// Safe to mount multiple times; won't double-fire
// =============================================================================

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ShortcutHandlers {
  onSearch?: () => void
  onHelp?:   () => void
}

export function useKeyboardShortcuts({ onSearch, onHelp }: ShortcutHandlers = {}) {
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in an input/textarea/select
      const tag = (e.target as HTMLElement).tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
      if ((e.target as HTMLElement).isContentEditable) return

      // ⌘K / Ctrl+K → search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onSearch?.()
        return
      }

      // Single-key shortcuts (no modifier)
      if (e.metaKey || e.ctrlKey || e.altKey) return

      switch (e.key) {
        case 'd': case 'D': router.push('/');           break
        case 'w': case 'W': router.push('/watchlist');  break
        case 'p': case 'P': router.push('/portfolio');  break
        case 'a': case 'A': router.push('/alerts');     break
        case 'b': case 'B': router.push('/backtest');   break
        case '?':           onHelp?.();                 break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSearch, onHelp, router])
}
