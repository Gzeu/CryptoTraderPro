// =============================================================================
// Portfolio Analytics Hook
// =============================================================================

import { useMemo } from 'react'
import { usePortfolioStore } from '@/store/portfolioStore'
import type { PortfolioAnalytics, PortfolioAsset } from '@/types/crypto'

/**
 * Hook for calculating portfolio analytics and metrics
 */
export const usePortfolioAnalytics = (): PortfolioAnalytics | null => {
  const currentPortfolio = usePortfolioStore(state => state.getCurrentPortfolio())
  
  const analytics = useMemo(() => {
    if (!currentPortfolio || currentPortfolio.assets.length === 0) {
      return null
    }
    
    const { assets } = currentPortfolio
    
    // Calculate total values
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)
    const totalCost = assets.reduce((sum, asset) => sum + (asset.avgBuyPrice * asset.amount), 0)
    const totalPnl = totalValue - totalCost
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
    
    // Find best and worst performers
    const sortedByPnl = [...assets].sort((a, b) => b.pnlPercent - a.pnlPercent)
    const bestPerformer = sortedByPnl.length > 0 ? {
      coinId: sortedByPnl[0].coinId,
      symbol: sortedByPnl[0].symbol,
      pnlPercent: sortedByPnl[0].pnlPercent,
    } : null
    
    const worstPerformer = sortedByPnl.length > 0 ? {
      coinId: sortedByPnl[sortedByPnl.length - 1].coinId,
      symbol: sortedByPnl[sortedByPnl.length - 1].symbol,
      pnlPercent: sortedByPnl[sortedByPnl.length - 1].pnlPercent,
    } : null
    
    // Calculate diversification score (Herfindahl-Hirschman Index)
    // Score ranges from 0 (perfectly diversified) to 10000 (single asset)
    const hhi = assets.reduce((sum, asset) => {
      const share = (asset.value / totalValue) * 100
      return sum + (share * share)
    }, 0)
    
    // Normalize to 0-100 scale (100 = perfectly diversified, 0 = single asset)
    const maxAssets = 10 // Ideal number of assets for perfect diversification
    const idealHHI = 10000 / maxAssets
    const diversificationScore = Math.max(0, Math.min(100, ((10000 - hhi) / (10000 - idealHHI)) * 100))
    
    // Determine risk level based on portfolio concentration and volatility
    let riskLevel: 'low' | 'medium' | 'high'
    
    if (diversificationScore > 70 && assets.length >= 5) {
      riskLevel = 'low'
    } else if (diversificationScore > 40 && assets.length >= 3) {
      riskLevel = 'medium'
    } else {
      riskLevel = 'high'
    }
    
    // Calculate 24h change (simplified - would need historical data for accurate calculation)
    const dayChange = assets.reduce((sum, asset) => {
      // Estimate based on current PnL - this is a placeholder
      return sum + (asset.pnl * 0.1) // Assume 10% of PnL happened today
    }, 0)
    
    const dayChangePercent = totalValue > 0 ? (dayChange / totalValue) * 100 : 0
    
    return {
      totalValue,
      totalCost,
      totalPnl,
      totalPnlPercent,
      dayChange,
      dayChangePercent,
      bestPerformer,
      worstPerformer,
      diversificationScore,
      riskLevel,
    }
  }, [currentPortfolio])
  
  return analytics
}

/**
 * Hook for calculating individual asset analytics
 */
export const useAssetAnalytics = (asset: PortfolioAsset) => {
  return useMemo(() => {
    const value = asset.currentPrice * asset.amount
    const cost = asset.avgBuyPrice * asset.amount
    const pnl = value - cost
    const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0
    
    return {
      value,
      cost,
      pnl,
      pnlPercent,
      isProfit: pnl > 0,
      isLoss: pnl < 0,
      breakEvenPrice: asset.avgBuyPrice,
      currentPrice: asset.currentPrice,
      amount: asset.amount,
    }
  }, [asset])
}

/**
 * Hook for portfolio allocation analysis
 */
export const usePortfolioAllocation = () => {
  const currentPortfolio = usePortfolioStore(state => state.getCurrentPortfolio())
  
  return useMemo(() => {
    if (!currentPortfolio || currentPortfolio.assets.length === 0) {
      return []
    }
    
    const totalValue = currentPortfolio.assets.reduce((sum, asset) => sum + asset.value, 0)
    
    return currentPortfolio.assets
      .map(asset => ({
        coinId: asset.coinId,
        symbol: asset.symbol,
        name: asset.name,
        value: asset.value,
        allocation: totalValue > 0 ? (asset.value / totalValue) * 100 : 0,
        color: getAssetColor(asset.symbol),
      }))
      .sort((a, b) => b.allocation - a.allocation)
  }, [currentPortfolio])
}

/**
 * Helper function to generate consistent colors for assets
 */
function getAssetColor(symbol: string): string {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
    '#6366f1', // indigo
    '#84cc16', // lime
  ]
  
  // Generate a consistent color based on symbol
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

/**
 * Hook for transaction history analysis
 */
export const useTransactionAnalytics = (portfolioId: string) => {
  const transactions = usePortfolioStore(state => state.getPortfolioTransactions(portfolioId))
  
  return useMemo(() => {
    const buyTransactions = transactions.filter(tx => tx.type === 'buy')
    const sellTransactions = transactions.filter(tx => tx.type === 'sell')
    
    const totalBuyAmount = buyTransactions.reduce((sum, tx) => sum + tx.total, 0)
    const totalSellAmount = sellTransactions.reduce((sum, tx) => sum + tx.total, 0)
    const totalFees = transactions.reduce((sum, tx) => sum + (tx.fees || 0), 0)
    
    const netInvestment = totalBuyAmount - totalSellAmount
    const realizedPnl = totalSellAmount - totalBuyAmount
    
    return {
      totalTransactions: transactions.length,
      buyTransactions: buyTransactions.length,
      sellTransactions: sellTransactions.length,
      totalBuyAmount,
      totalSellAmount,
      totalFees,
      netInvestment,
      realizedPnl,
      averageTransactionSize: transactions.length > 0 
        ? (totalBuyAmount + totalSellAmount) / transactions.length 
        : 0,
    }
  }, [transactions])
}