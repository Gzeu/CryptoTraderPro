'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Copy, ExternalLink, Coins, Image as ImageIcon, Wallet } from 'lucide-react'
import {
  fetchEgldAccount, fetchEgldAccountTokens, fetchEgldAccountNfts,
  fromDenomination, type EgldToken, type EgldNft, type EgldAccountSummary,
} from '@/lib/api/multiversx'
import { fetchEgldEconomics } from '@/lib/api/multiversx'
import { fmtPrice, fmtLarge } from '@/lib/formatters'
import { Skeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

type Tab = 'tokens' | 'nfts'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} aria-label="Copy address"
      className="p-1 rounded hover:opacity-60 transition-opacity"
      style={{ color: 'var(--color-text-faint)' }}>
      {copied
        ? <span className="text-xs" style={{ color: 'var(--color-success)' }}>✓</span>
        : <Copy size={13} />}
    </button>
  )
}

function shortAddr(addr: string) {
  return addr.length > 16 ? `${addr.slice(0, 8)}…${addr.slice(-8)}` : addr
}

export default function EgldWalletPage() {
  const { address } = useParams<{ address: string }>()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('tokens')

  const { data: account, isLoading: accLoading, error: accError } = useQuery({
    queryKey: ['egld-account', address],
    queryFn: () => fetchEgldAccount(address),
    staleTime: 30_000,
    retry: 1,
  })

  const { data: tokens, isLoading: tokensLoading } = useQuery({
    queryKey: ['egld-account-tokens', address],
    queryFn: () => fetchEgldAccountTokens(address, 50),
    staleTime: 30_000,
    enabled: !!account,
  })

  const { data: nfts, isLoading: nftsLoading } = useQuery({
    queryKey: ['egld-account-nfts', address],
    queryFn: () => fetchEgldAccountNfts(address, 50),
    staleTime: 60_000,
    enabled: !!account,
  })

  const { data: eco } = useQuery({
    queryKey: ['egld-eco'],
    queryFn: fetchEgldEconomics,
    staleTime: 60_000,
  })

  const egldBalance  = account ? fromDenomination(account.balance) : 0
  const egldUsdValue = eco?.price ? egldBalance * eco.price : null
  const tokenCount   = tokens?.length ?? 0
  const nftCount     = nfts?.length   ?? 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <Wallet size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="font-bold text-sm hidden sm:block">{shortAddr(address)}</span>
          <CopyButton text={address} />
          <a href={`https://explorer.multiversx.com/accounts/${address}`}
            target="_blank" rel="noopener noreferrer"
            className="p-1 rounded hover:opacity-60 transition-opacity"
            style={{ color: 'var(--color-text-faint)' }} aria-label="View on Explorer">
            <ExternalLink size={13} />
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {accError && (
          <div className="rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
            Address not found or invalid. Check the address and try again.
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'EGLD Balance',
              val:   accLoading ? null : `${egldBalance.toFixed(4)} EGLD`,
              sub:   egldUsdValue != null ? `≈ ${fmtPrice(egldUsdValue)}` : undefined,
              icon:  <Coins size={16} />,
              accent: 'var(--color-primary)',
            },
            {
              label: 'USD Value',
              val:   accLoading || egldUsdValue == null ? null : fmtPrice(egldUsdValue),
              icon:  <Wallet size={16} />,
              accent: 'var(--color-gold)',
            },
            {
              label: 'ESDT Tokens',
              val:   tokensLoading ? null : String(tokenCount),
              icon:  <Coins size={16} />,
              accent: 'var(--color-success)',
            },
            {
              label: 'NFTs',
              val:   nftsLoading ? null : String(nftCount),
              icon:  <ImageIcon size={16} />,
              accent: 'var(--color-purple)',
            },
          ].map(({ label, val, sub, icon, accent }) => (
            <div key={label} className="rounded-xl border p-4 flex items-start gap-3"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <span className="mt-0.5" style={{ color: accent }}>{icon}</span>
              <div className="min-w-0">
                <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                {val == null
                  ? <Skeleton className="h-4 w-24" />
                  : <p className="font-semibold text-sm tabular-nums">{val}</p>}
                {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Nonce / Shard / TxCount */}
        {!accLoading && account && (
          <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Shard <strong style={{ color: 'var(--color-text)' }}>{account.shard}</strong></span>
            <span>Nonce <strong style={{ color: 'var(--color-text)' }}>{account.nonce}</strong></span>
            <span>Transactions <strong style={{ color: 'var(--color-text)' }}>{account.txCount.toLocaleString()}</strong></span>
            {account.username && (
              <span>Username <strong style={{ color: 'var(--color-text)' }}>{account.username}</strong></span>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
          {(['tokens', 'nfts'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 text-sm font-medium capitalize transition-colors"
              style={tab === t
                ? { color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', marginBottom: -1 }
                : { color: 'var(--color-text-muted)' }}>
              {t === 'tokens' ? `ESDT Tokens${tokenCount ? ` (${tokenCount})` : ''}` : `NFTs${nftCount ? ` (${nftCount})` : ''}`}
            </button>
          ))}
        </div>

        {/* Tokens tab */}
        {tab === 'tokens' && (
          <div className="rounded-xl border overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['Token', 'Ticker', 'Balance', 'Price', 'Value'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-medium text-xs"
                        style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tokensLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={5} className="px-4 py-2.5">
                        <Skeleton className="h-4 w-full" />
                      </td></tr>
                    ))
                    : !tokens?.length
                    ? <tr><td colSpan={5} className="px-4 py-8 text-center text-sm"
                        style={{ color: 'var(--color-text-muted)' }}>No ESDT tokens found</td></tr>
                    : tokens.map((t: EgldToken) => {
                        const bal = fromDenomination(t.circulatingSupply ?? '0', t.decimals)
                        const val = t.price != null ? bal * t.price : null
                        return (
                          <tr key={t.identifier}
                            className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            style={{ borderColor: 'var(--color-divider)' }}>
                            <td className="px-4 py-2.5 font-medium">{t.name}</td>
                            <td className="px-4 py-2.5 tabular-nums text-xs"
                              style={{ color: 'var(--color-text-muted)' }}>{t.ticker}</td>
                            <td className="px-4 py-2.5 tabular-nums">{bal.toFixed(4)}</td>
                            <td className="px-4 py-2.5 tabular-nums">{t.price != null ? fmtPrice(t.price) : '—'}</td>
                            <td className="px-4 py-2.5 tabular-nums">{val != null ? fmtPrice(val) : '—'}</td>
                          </tr>
                        )
                      })
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NFTs tab */}
        {tab === 'nfts' && (
          <>
            {nftsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
              </div>
            ) : !nfts?.length ? (
              <div className="py-16 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <ImageIcon size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-faint)' }} />
                No NFTs found
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {nfts.map((nft: EgldNft) => (
                  <div key={nft.identifier}
                    className="rounded-xl border overflow-hidden"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    {nft.thumbnailUrl || nft.url
                      ? <img
                          src={nft.thumbnailUrl ?? nft.url ?? ''}
                          alt={nft.name}
                          width={200} height={200}
                          loading="lazy"
                          className="w-full aspect-square object-cover"
                        />
                      : <div className="w-full aspect-square flex items-center justify-center"
                          style={{ background: 'var(--color-surface-offset)' }}>
                          <ImageIcon size={24} style={{ color: 'var(--color-text-faint)' }} />
                        </div>
                    }
                    <div className="px-2.5 py-2">
                      <p className="text-xs font-medium truncate">{nft.name}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {nft.collection}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
