'use client'

// =============================================================================
// Header Component - Top navigation and global controls
// =============================================================================

import React, { useState } from 'react'
import { useTheme } from 'next-themes'
import { 
  SunIcon, 
  MoonIcon, 
  SearchIcon,
  BellIcon,
  SettingsIcon,
  UserIcon,
  MenuIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuToggle?: () => void
  className?: string
}

export function Header({ onMenuToggle, className }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuToggle}
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="font-bold text-primary-foreground text-sm">CT</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg">CryptoTraderPro</h1>
                <p className="text-xs text-muted-foreground">Advanced Trading Dashboard</p>
              </div>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Mobile search */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <SearchIcon className="h-5 w-5" />
            </Button>
            
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <div className="relative">
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-bearish animate-pulse" />
              </div>
            </Button>
            
            {/* Settings */}
            <Button variant="ghost" size="icon">
              <SettingsIcon className="h-5 w-5" />
            </Button>
            
            {/* User menu */}
            <Button variant="ghost" size="icon">
              <UserIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Market Status Bar */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="status-online" />
              <span className="text-muted-foreground">Market Open</span>
            </div>
            <div className="text-muted-foreground">
              BTC: <span className="font-mono text-foreground">$43,521.45</span>
              <span className="text-bullish ml-1">+2.34%</span>
            </div>
            <div className="text-muted-foreground">
              ETH: <span className="font-mono text-foreground">$2,687.92</span>
              <span className="text-bearish ml-1">-1.23%</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header