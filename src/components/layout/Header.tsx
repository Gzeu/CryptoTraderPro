'use client'

import { RefreshCw, Moon, Sun, Search } from 'lucide-react'

interface Props {
  search: string
  onSearch: (v: string) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onRefresh: () => void
  lastUpdate: Date | null
}

export function Header({ search, onSearch, theme, onToggleTheme, onRefresh, lastUpdate }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="CryptoTraderPro logo">
            <rect width="28" height="28" rx="7" fill="var(--primary)" />
            <path d="M6 14h4l2.5-5.5 3.5 11 2.5-7.5 2 2h3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-bold text-sm tracking-tight hidden sm:block">CryptoTraderPro</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input
            type="search"
            placeholder="Search coins…"
            value={search}
            onChange={e => onSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {lastUpdate && (
            <span className="text-xs num hidden md:block mr-1" style={{ color: 'var(--text-faint)' }}>
              {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button onClick={onRefresh} title="Refresh" className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>
            <RefreshCw size={15} />
          </button>
          <button onClick={onToggleTheme} title="Toggle theme" className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  )
}
