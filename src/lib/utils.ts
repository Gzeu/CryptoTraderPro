// =============================================================================
// Utility Functions
// =============================================================================

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSS class merger utility
 * Combines clsx and tailwind-merge for better class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// -----------------------------------------------------------------------------
// Number Formatting
// -----------------------------------------------------------------------------

/**
 * Format currency values with proper locale and currency symbols
 */
export function formatCurrency(value: number, currency: string = 'USD', locale: string = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: value < 1 ? 6 : 2,
      maximumFractionDigits: value < 1 ? 8 : 2,
    }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

/**
 * Format percentage values with + or - prefix
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (value === 0) return '0.00%'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * Format large numbers with K, M, B, T suffixes
 */
export function formatCompactNumber(value: number): string {
  if (value === 0) return '0'
  
  const units = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
  ]
  
  for (const unit of units) {
    if (Math.abs(value) >= unit.value) {
      return `${(value / unit.value).toFixed(1)}${unit.suffix}`
    }
  }
  
  return value.toFixed(2)
}

/**
 * Format number with proper decimal places based on value size
 */
export function formatNumber(value: number): string {
  if (value === 0) return '0'
  
  if (value < 0.001) {
    return value.toExponential(2)
  } else if (value < 1) {
    return value.toFixed(6)
  } else if (value < 100) {
    return value.toFixed(4)
  } else {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
}

// -----------------------------------------------------------------------------
// Date & Time Utilities
// -----------------------------------------------------------------------------

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export function formatTimeAgo(timestamp: string | number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ]
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds)
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
    }
  }
  
  return 'just now'
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | number | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = new Date(date)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  
  return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

// -----------------------------------------------------------------------------
// URL & Navigation
// -----------------------------------------------------------------------------

/**
 * Create query string from object
 */
export function createQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString)
  const result: Record<string, string> = {}
  
  params.forEach((value, key) => {
    result[key] = value
  })
  
  return result
}

// -----------------------------------------------------------------------------
// Color & Theme Utilities
// -----------------------------------------------------------------------------

/**
 * Get color class based on positive/negative value
 */
export function getChangeColor(value: number): string {
  if (value > 0) return 'text-bullish'
  if (value < 0) return 'text-bearish'
  return 'text-muted-foreground'
}

/**
 * Get background color class based on positive/negative value
 */
export function getChangeBgColor(value: number): string {
  if (value > 0) return 'bg-bullish/10 text-bullish'
  if (value < 0) return 'bg-bearish/10 text-bearish'
  return 'bg-muted text-muted-foreground'
}

// -----------------------------------------------------------------------------
// Data Validation
// -----------------------------------------------------------------------------

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * Check if string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// -----------------------------------------------------------------------------
// Array & Object Utilities
// -----------------------------------------------------------------------------

/**
 * Safely get nested object property
 */
export function get(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    result = result?.[key]
    if (result === undefined || result === null) {
      return defaultValue
    }
  }
  
  return result
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj: any = {}
    for (const key in obj) {
      clonedObj[key] = deepClone(obj[key])
    }
    return clonedObj
  }
  return obj
}

/**
 * Remove duplicates from array based on key
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

// -----------------------------------------------------------------------------
// Storage Utilities
// -----------------------------------------------------------------------------

/**
 * Safe localStorage operations
 */
export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      if (typeof window === 'undefined') return defaultValue ?? null
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue ?? null
    } catch {
      return defaultValue ?? null
    }
  },
  
  set(key: string, value: any): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  },
  
  remove(key: string): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
  },
  
  clear(): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.clear()
      }
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  },
}

// -----------------------------------------------------------------------------
// Crypto-specific utilities
// -----------------------------------------------------------------------------

/**
 * Generate crypto symbol pair (e.g., BTC/USDT)
 */
export function createTradingPair(base: string, quote: string = 'USDT'): string {
  return `${base.toUpperCase()}/${quote.toUpperCase()}`
}

/**
 * Parse trading pair back to base and quote
 */
export function parseTradingPair(pair: string): { base: string; quote: string } {
  const [base, quote] = pair.split('/')
  return { base: base?.toLowerCase() || '', quote: quote?.toLowerCase() || 'usdt' }
}

/**
 * Calculate portfolio allocation percentage
 */
export function calculateAllocation(assetValue: number, totalValue: number): number {
  if (totalValue === 0) return 0
  return (assetValue / totalValue) * 100
}

/**
 * Calculate profit/loss percentage
 */
export function calculatePnLPercentage(currentPrice: number, buyPrice: number): number {
  if (buyPrice === 0) return 0
  return ((currentPrice - buyPrice) / buyPrice) * 100
}

// -----------------------------------------------------------------------------
// Debounce utility
// -----------------------------------------------------------------------------

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}