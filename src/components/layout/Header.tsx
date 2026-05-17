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
  { href: '/',          label: 'Dashboard' },
  { href: '/watchlist', label: 'Watchlist' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/alerts',    label: 'Alerts' },
  { href: '/egld',      label: 'EGLD' },
  { href: '/compare',   label: 'Compare' },
  { href: '/backtest',  label: 'Backtest' },
] as const

const SHORTCUT_HELP = [
  { key: '\u2318K',  desc: 'Open search' },
  { key: 'D',        desc: 'Dashboard' },
  { key: 'W',        desc: 'Watchlist' },
  { key: 'P',        desc: 'Portfolio' },
  { key: 'A',        desc: 'Alerts' },
  { key: 'E',        desc: 'EGLD dashboard' },
  { key: 'C',        desc: 'Compare' },
  { key: 'B',        desc: 'Backtest' },
  { key: '?',        desc: 'This help' },
  { key: 'Esc',      desc: 'Close modal' },
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
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo + nav */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2" aria-label="CryptoTraderPro home">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect width="28" height="28" rx="7" fill="var(--primary)" />
                <path d="M6 14h4l2.5-5.5 3.5 11 2.5-7.5 2 2h3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-bold text-sm tracking-tight hidden sm:block">CryptoTraderPro</span>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5 text-sm" aria-label="Main navigation">
              {NAV.map(item => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative px-2.5 py-1 rounded-lg font-medium transition-opacity hover:opacity-80"
                    style={active
                      ? { background: 'var(--surface-2)', color: 'var(--text)' }
                      : { color: 'var(--text-muted)' }
                    }
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                    {item.href === '/alerts' && activeAlerts > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                        style={{ background: 'var(--primary)', color: '#fff' }}
                        aria-label={`${activeAlerts} active alerts`}
                      >
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
            aria-label="Search coins (Cmd+K)"
          >
            <Search size={13} aria-hidden="true" />
            <span className="flex-1 text-left">Search coins…</span>
            <kbd
              className="hidden sm:inline text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {lastUpdate && (
              <span className="text-xs num hidden lg:block mr-1" style={{ color: 'var(--text-faint)' }}>
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => refetch()}
              className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Refresh market data"
            >
              <RefreshCw size={15} aria-hidden="true" />
            </button>
            <Link
              href="/alerts"
              className="relative p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
              aria-label={activeAlerts > 0 ? `Alerts — ${activeAlerts} active` : 'Alerts'}
            >
              <Bell size={15} aria-hidden="true" />
              {activeAlerts > 0 && (
                <span
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{ background: 'var(--primary)' }}
                  aria-hidden="true"
                />
              )}
            </Link>
            <Link
              href="/backtest"
              className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Backtest"
            >
              <BarChart2 size={15} aria-hidden="true" />
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark'
                ? <Sun  size={15} aria-hidden="true" />
                : <Moon size={15} aria-hidden="true" />
              }
            </button>
            <button
              onClick={() => setHelpOpen(h => !h)}
              className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Keyboard shortcuts"
              aria-expanded={helpOpen}
            >
              <Keyboard size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Keyboard Shortcuts Help Modal */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setHelpOpen(false) }}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <div
            className="w-full max-w-sm rounded-2xl border overflow-hidden shadow-xl"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Keyboard size={14} aria-hidden="true" /> Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setHelpOpen(false)}
                className="p-1 rounded hover:opacity-60 transition-opacity"
                aria-label="Close shortcuts panel"
              >
                <X size={15} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
              </button>
            </div>

            <ul className="py-2" role="list">
              {SHORTCUT_HELP.map(s => (
                <li
                  key={s.key}
                  className="flex items-center justify-between px-4 py-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span className="text-sm">{s.desc}</span>
                  <kbd
                    className="text-xs px-2 py-0.5 rounded font-mono"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    {s.key}
                  </kbd>
                </li>
              ))}
            </ul>

            <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                Press <kbd className="font-mono">?</kbd> or the keyboard icon to toggle.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
