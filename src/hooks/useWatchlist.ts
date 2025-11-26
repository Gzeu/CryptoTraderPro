// =============================================================================
// Watchlist Hook - Real-time price monitoring and alerts
// =============================================================================

import { useEffect, useState, useCallback } from 'react'
import { useWatchlistStore } from '@/store/watchlistStore'
import { getCoinById } from '@/lib/api/coinGecko'
import { get24hrStats } from '@/lib/api/binance'
import type { WatchlistItem, PriceAlert } from '@/types/crypto'

/**
 * Hook for managing watchlist with real-time updates
 */
export const useWatchlist = () => {
  const {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    isInWatchlist,
    getCategoryItems,
  } = useWatchlistStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  /**
   * Add coin to watchlist with current price data
   */
  const addCoinToWatchlist = useCallback(async (
    coinId: string,
    symbol: string,
    name: string,
    category?: string
  ) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch current price data
      const coinData = await getCoinById(coinId)
      
      addToWatchlist({
        coinId,
        symbol,
        name,
        image: coinData.image,
        category,
        currentPrice: coinData.current_price,
        priceChange24h: coinData.price_change_percentage_24h,
      })
      
      return true
    } catch (err) {
      setError('Failed to add coin to watchlist')
      console.error(err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [addToWatchlist])
  
  /**
   * Update watchlist prices
   */
  const updateWatchlistPrices = useCallback(async () => {
    if (watchlist.length === 0) return
    
    try {
      setIsLoading(true)
      
      // Update prices for all watchlist items
      const updates = watchlist.map(async (item) => {
        try {
          const coinData = await getCoinById(item.coinId)
          
          updateWatchlistItem(item.id, {
            currentPrice: coinData.current_price,
            priceChange24h: coinData.price_change_percentage_24h,
          })
        } catch (err) {
          console.error(`Failed to update ${item.symbol}:`, err)
        }
      })
      
      await Promise.all(updates)
    } catch (err) {
      setError('Failed to update watchlist prices')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [watchlist, updateWatchlistItem])
  
  return {
    watchlist,
    isLoading,
    error,
    addCoinToWatchlist,
    removeFromWatchlist,
    updateWatchlistPrices,
    isInWatchlist,
    getCategoryItems,
  }
}

/**
 * Hook for price alerts with auto-check functionality
 */
export const usePriceAlerts = () => {
  const {
    priceAlerts,
    addPriceAlert,
    removePriceAlert,
    updatePriceAlert,
    checkAndTriggerAlerts,
    getActiveAlerts,
    getTriggeredAlerts,
  } = useWatchlistStore()
  
  const [isChecking, setIsChecking] = useState(false)
  
  /**
   * Check all active alerts against current prices
   */
  const checkAlerts = useCallback(async () => {
    const activeAlerts = getActiveAlerts()
    
    if (activeAlerts.length === 0) return
    
    setIsChecking(true)
    
    try {
      // Group alerts by coinId to minimize API calls
      const alertsByCoin = activeAlerts.reduce((acc, alert) => {
        if (!acc[alert.coinId]) {
          acc[alert.coinId] = []
        }
        acc[alert.coinId].push(alert)
        return acc
      }, {} as Record<string, PriceAlert[]>)
      
      // Check alerts for each coin
      for (const [coinId, alerts] of Object.entries(alertsByCoin)) {
        try {
          const coinData = await getCoinById(coinId)
          const triggeredAlerts = checkAndTriggerAlerts(coinId, coinData.current_price)
          
          // Handle triggered alerts (e.g., show notifications)
          if (triggeredAlerts.length > 0) {
            triggeredAlerts.forEach(alert => {
              showAlertNotification(alert, coinData.current_price)
            })
          }
        } catch (err) {
          console.error(`Failed to check alerts for ${coinId}:`, err)
        }
      }
    } finally {
      setIsChecking(false)
    }
  }, [getActiveAlerts, checkAndTriggerAlerts])
  
  /**
   * Create a new price alert
   */
  const createAlert = useCallback(async (
    coinId: string,
    symbol: string,
    name: string,
    type: 'above' | 'below' | 'percent_change',
    targetPrice: number,
    basePrice?: number
  ) => {
    try {
      // Get current price for context
      const coinData = await getCoinById(coinId)
      
      addPriceAlert({
        coinId,
        symbol,
        name,
        type,
        targetPrice,
        basePrice: basePrice || coinData.current_price,
        currentPrice: coinData.current_price,
        enabled: true,
      })
      
      return true
    } catch (err) {
      console.error('Failed to create price alert:', err)
      return false
    }
  }, [addPriceAlert])
  
  return {
    priceAlerts,
    activeAlerts: getActiveAlerts(),
    triggeredAlerts: getTriggeredAlerts(),
    isChecking,
    createAlert,
    removeAlert: removePriceAlert,
    updateAlert: updatePriceAlert,
    checkAlerts,
  }
}

/**
 * Hook for auto-updating watchlist prices at intervals
 */
export const useWatchlistAutoUpdate = (intervalMs: number = 30000) => {
  const { updateWatchlistPrices } = useWatchlist()
  const { checkAlerts } = usePriceAlerts()
  
  useEffect(() => {
    // Initial update
    updateWatchlistPrices()
    checkAlerts()
    
    // Set up interval
    const interval = setInterval(() => {
      updateWatchlistPrices()
      checkAlerts()
    }, intervalMs)
    
    return () => clearInterval(interval)
  }, [intervalMs, updateWatchlistPrices, checkAlerts])
}

/**
 * Hook for watchlist statistics
 */
export const useWatchlistStats = () => {
  const { watchlist } = useWatchlistStore()
  
  const stats = {
    totalCoins: watchlist.length,
    gainers: watchlist.filter(item => (item.priceChange24h || 0) > 0).length,
    losers: watchlist.filter(item => (item.priceChange24h || 0) < 0).length,
    topGainer: watchlist.reduce((top, item) => {
      const change = item.priceChange24h || 0
      return change > (top?.priceChange24h || 0) ? item : top
    }, null as WatchlistItem | null),
    topLoser: watchlist.reduce((bottom, item) => {
      const change = item.priceChange24h || 0
      return change < (bottom?.priceChange24h || 0) ? item : bottom
    }, null as WatchlistItem | null),
  }
  
  return stats
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Show browser notification for triggered alert
 */
function showAlertNotification(alert: PriceAlert, currentPrice: number) {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications')
    return
  }
  
  if (Notification.permission === 'granted') {
    new Notification(`Price Alert: ${alert.symbol}`, {
      body: `${alert.name} has ${alert.type === 'above' ? 'risen above' : 'fallen below'} $${alert.targetPrice.toFixed(2)}. Current price: $${currentPrice.toFixed(2)}`,
      icon: '/icons/alert.png',
      tag: alert.id,
    })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showAlertNotification(alert, currentPrice)
      }
    })
  }
}

/**
 * Play alert sound
 */
export function playAlertSound() {
  const audio = new Audio('/sounds/alert.mp3')
  audio.play().catch(err => console.error('Failed to play alert sound:', err))
}