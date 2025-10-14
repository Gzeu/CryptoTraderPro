'use client'

// =============================================================================
// Price Card Component - Individual crypto price display
// =============================================================================

import React from 'react'
import Image from 'next/image'
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatCurrency, formatPercentage } from '@/lib/utils'
import type { CryptoCoin } from '@/types/crypto'

interface PriceCardProps {
  coin: CryptoCoin
  onClick?: () => void
  className?: string
  compact?: boolean
  showSparkline?: boolean
}

export function PriceCard({ 
  coin, 
  onClick, 
  className, 
  compact = false,
  showSparkline = false 
}: PriceCardProps) {
  const isPositive = coin.price_change_percentage_24h >= 0
  const changeColor = isPositive ? 'text-bullish' : 'text-bearish'
  const changeBgColor = isPositive ? 'bg-bullish/10' : 'bg-bearish/10'

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
        onClick && "hover:bg-muted/30",
        className
      )}
      onClick={onClick}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-center justify-between">
          {/* Coin Info */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "relative rounded-full overflow-hidden bg-muted",
              compact ? "h-8 w-8" : "h-10 w-10"
            )}>
              {coin.image ? (
                <Image
                  src={coin.image}
                  alt={coin.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    {coin.symbol.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-semibold text-foreground truncate",
                  compact ? "text-sm" : "text-base"
                )}>
                  {coin.name}
                </span>
                {coin.market_cap_rank && coin.market_cap_rank <= 10 && (
                  <span className="inline-flex items-center rounded-full bg-primary/20 px-1.5 py-0.5 text-xs font-medium text-primary">
                    #{coin.market_cap_rank}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-muted-foreground uppercase",
                compact ? "text-xs" : "text-sm"
              )}>
                {coin.symbol}
              </span>
            </div>
          </div>

          {/* Price & Change */}
          <div className="text-right">
            <div className={cn(
              "font-mono font-semibold",
              compact ? "text-sm" : "text-base"
            )}>
              {formatCurrency(coin.current_price)}
            </div>
            
            <div className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
              changeBgColor,
              changeColor
            )}>
              {isPositive ? (
                <TrendingUpIcon className="h-3 w-3" />
              ) : (
                <TrendingDownIcon className="h-3 w-3" />
              )}
              {formatPercentage(coin.price_change_percentage_24h)}
            </div>
          </div>
        </div>

        {/* Extended Info (non-compact) */}
        {!compact && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Market Cap</span>
              <div className="font-medium">{formatCurrency(coin.market_cap)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Volume</span>
              <div className="font-medium">{formatCurrency(coin.total_volume)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PriceCard