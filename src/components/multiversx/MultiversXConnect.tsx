'use client'

// =============================================================================
// MultiversX Wallet Connect Component
// =============================================================================

import React, { useState } from 'react'
import { WalletIcon, LoaderCircleIcon, CheckCircleIcon, XCircleIcon, LogOutIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { fetchWalletBalance, validateMvxAddress, formatEgld } from '@/lib/multiversx'
import { useMultiversXStore } from '@/store/multiversxStore'

export function MultiversXConnect() {
  const [input, setInput] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const { address, walletInfo, egldPrice, isConnecting, error, setAddress, setWalletInfo, setIsConnecting, setError, disconnect } =
    useMultiversXStore()

  const handleConnect = async () => {
    const trimmed = input.trim()
    if (!validateMvxAddress(trimmed)) {
      setValidationError('Invalid MultiversX address. Must start with erd1 and be 62 characters.')
      return
    }
    setValidationError(null)
    setIsConnecting(true)
    setError(null)
    try {
      const info = await fetchWalletBalance(trimmed)
      setAddress(trimmed)
      setWalletInfo(info)
    } catch {
      setError('Failed to fetch wallet. Check address or network.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setInput('')
    disconnect()
  }

  if (address && walletInfo) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircleIcon className="h-5 w-5 text-bullish" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="rounded-lg bg-muted p-3 font-mono text-xs break-all text-muted-foreground">
              {address}
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">EGLD Balance</p>
                <p className="font-semibold text-lg">{formatEgld(walletInfo.balance)}</p>
                <p className="text-xs text-muted-foreground">
                  {egldPrice > 0 ? formatCurrency(walletInfo.balance * egldPrice) : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Nonce</p>
                <p className="font-semibold">{walletInfo.nonce.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Transactions</p>
                <p className="font-semibold">{walletInfo.txCount.toLocaleString()}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={handleDisconnect}>
              <LogOutIcon className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <WalletIcon className="h-5 w-5 text-primary" />
          Connect MultiversX Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setValidationError(null) }}
              placeholder="erd1..."
              className={cn(
                'w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
                validationError && 'border-bearish focus:ring-bearish'
              )}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            />
          </div>

          {validationError && (
            <div className="flex items-center gap-2 text-xs text-bearish">
              <XCircleIcon className="h-4 w-4 flex-shrink-0" />
              {validationError}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-xs text-bearish">
              <XCircleIcon className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button className="w-full" onClick={handleConnect} disabled={isConnecting || !input.trim()}>
            {isConnecting ? (
              <><LoaderCircleIcon className="h-4 w-4 mr-2 animate-spin" />Connecting...</>
            ) : (
              <><WalletIcon className="h-4 w-4 mr-2" />Connect Wallet</>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Read-only — no private key required
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default MultiversXConnect
