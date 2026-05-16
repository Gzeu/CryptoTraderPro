'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RefreshCw, Moon, Sun, Search, Keyboard, X, Bell, BarChart2 } from 'lucide-react'
import { useMarketsQuery } from '@/hooks/useMarketsQuery'
import { useTheme } from '@/hooks/useTheme'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { SearchModal } from '@/components/layout/SearchModal'
import { useAlertStore } from '@/store/alertStore'

const NAV = [
  { href: '/',           label: 'Dashboard' },
  { href: '/watchlist',  label: 'Watchlist' },
  { href: '/portfolio',  label: 'Portfolio' },
  { href: '/alerts',     label: 'Alerts' },
  { href: '/backtest',   label: 'Backtest' },
]

const SHORTCUT_HELP = [
  { key: '⌘K',  desc: 'Open search' },
  { key: 'D',   desc: 'Dashboard' },
  { key: 'W',   desc: 'Watchlist' },
  { key: 'P',   desc: 'Portfolio' },
  { key: 'A',   desc: 'Alerts' },
  { key: 'B',   desc: 'Backtest' },
  { key: '?',   desc: 'This help' },
  { key: 'Esc', desc: 'Close modal' },
]

export function Header() {
  const pathname = usePathname()
  const { refetch, dataUpdatedAt } = useMarketsQuery()
  const { theme, toggle: toggleTheme } = useTheme()
  const { alerts } = useAlertStore()
  const activeAlerts = alerts.filter(a => !a.triggered).length

  const [searchOpen, setSearchOpen] = useState(false)
  const [helpOpen,   setHelpOpen]   = useState(false)

  useKeyboardShortcuts({
    onSearch: () => setSearchOpen(true),
    onHelp:   () => setHelpOpen(h => !h),
  })

  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt) : null

  return (
    <>
      <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo + nav */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="CryptoTraderPro">
                <rect width="28" height="28" rx="7" fill="var(--primary)" />
                <path d="M6 14h4l2.5-5.5 3.5 11 2.5-7.5 2 2h3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-bold text-sm tracking-tight hidden sm:block">CryptoTraderPro</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm">
              {NAV.map(item => {
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}
                    className="relative px-3 py-1 rounded-lg font-medium transition-colors"
                    style={active
                      ? { background: 'var(--surface-2)', color: 'var(--text)' }
                      : { color: 'var(--text-muted)' }}>
                    {item.label}
                    {item.href === '/alerts' && activeAlerts > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                        style={{ background: 'var(--primary)', color: '#fff' }}>
                        {activeAlerts}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm flex-1 max-w-xs transition-opacity hover:opacity-80"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            aria-label="Search coins">
            <Search size={13} />
            <span className="flex-1 text-left">Search coins…</span>
            <kbd className="hidden sm:inline text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>⌘K</kbd>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {lastUpdate && (
              <span className="text-xs num hidden lg:block mr-1" style={{ color: 'var(--text-faint)' }}>
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button onClick={() => refetch()} title="Refresh" className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }} aria-label="Refresh">
              <RefreshCw size={15} />
            </button>
            <Link href="/alerts" className="relative p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }} aria-label="Alerts">
              <Bell size={15} />
              {activeAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
              )}
            </Link>
            <Link href="/backtest" className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }} aria-label="Backtest">
              <BarChart2 size={15} />
            </Link>
            <button onClick={toggleTheme} title="Toggle theme" className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={() => setHelpOpen(h => !h)}
              title="Keyboard shortcuts (?)"
              className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Keyboard shortcuts"
            >
              <Keyboard size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ⌨️ Keyboard Shortcuts Help Modal — triggered by ? key */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setHelpOpen(false) }}
          role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"
        >
          <div className="w-full max-w-sm rounded-2xl border overflow-hidden shadow-xl"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Keyboard size={14} /> Keyboard Shortcuts
              </h2>
              <button onClick={() => setHelpOpen(false)} className="p-1 rounded hover:opacity-60 transition-opacity" aria-label="Close">
                <X size={15} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <ul className="py-2">
              {SHORTCUT_HELP.map(s => (
                <li key={s.key} className="flex items-center justify-between px-4 py-2 hover:opacity-80 transition-opacity">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.desc}</span>
                  <kbd
                    className="text-xs px-2 py-0.5 rounded font-mono"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  >
                    {s.key}
                  </kbd>
                </li>
              ))}
            </ul>

            <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Press <kbd className="font-mono">?</kbd> or click the keyboard icon to toggle this panel.</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
