'use client'

import React, { useState } from 'react'
import { useTheme } from 'next-themes'
import {
  SunIcon,
  MoonIcon,
  SearchIcon,
  BellIcon,
  SettingsIcon,
  UserIcon,
  MenuIcon,
  TrendingUpIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LiveTicker } from './LiveTicker'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuToggle?: () => void
  className?: string
}

export function Header({ onMenuToggle, className }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <header className={cn('sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm', className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuToggle}>
              <MenuIcon className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              {/* SVG Logo */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="CryptoTraderPro logo">
                <rect width="32" height="32" rx="8" fill="hsl(221 83% 53%)" />
                <polyline points="4,22 10,14 16,18 22,8 28,12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="28" cy="12" r="2" fill="white" />
              </svg>
              <div className="hidden sm:block">
                <span className="font-bold text-base leading-tight tracking-tight">CryptoTraderPro</span>
                <p className="text-[10px] text-muted-foreground leading-none">Advanced Trading Dashboard</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                className="w-full rounded-lg border bg-secondary/40 pl-9 pr-4 py-1.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="md:hidden">
              <SearchIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon">
              <div className="relative">
                <BellIcon className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--bearish))] animate-pulse" />
              </div>
            </Button>
            <Button variant="ghost" size="icon"><SettingsIcon className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon">
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                <UserIcon className="h-3.5 w-3.5 text-primary" />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Live Ticker */}
      <LiveTicker />
    </header>
  )
}

export default Header
