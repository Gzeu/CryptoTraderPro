'use client'

import { useEffect, useState } from 'react'
import { formatNumber, shortenAddress } from '@/lib/utils'
import { Copy, ExternalLink, Coins, Image as ImageIcon, TrendingUp } from 'lucide-react'

interface EgldAccount {
  address: string
  balance: string
  nonce: number
  shard: number
  username?: string
}

interface EsdtToken {
  identifier: string
  name: string
  balance: string
  decimals: number
  assets?: { svgUrl?: string; pngUrl?: string }
  price?: number
  valueUsd?: number
}

interface NftToken {
  identifier: string
  name: string
  collection: string
  nonce: number
  type: string
  thumbnailUrl?: string
  metadata?: { description?: string }
}

const MX_API = 'https://api.multiversx.com'

async function fetchAccount(address: string): Promise<EgldAccount> {
  const res = await fetch(`${MX_API}/accounts/${address}`)
  if (!res.ok) throw new Error('Account not found')
  return res.json()
}

async function fetchEsdtTokens(address: string): Promise<EsdtToken[]> {
  const res = await fetch(`${MX_API}/accounts/${address}/tokens?size=100&includeMetaESDT=false`)
  if (!res.ok) return []
  return res.json()
}

async function fetchNfts(address: string): Promise<NftToken[]> {
  const res = await fetch(`${MX_API}/accounts/${address}/nfts?size=50&type=NonFungibleESDT,SemiFungibleESDT`)
  if (!res.ok) return []
  return res.json()
}

async function fetchEgldPrice(): Promise<number> {
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=elrond-erd-2&vs_currencies=usd')
  if (!res.ok) return 0
  const data = await res.json()
  return data['elrond-erd-2']?.usd ?? 0
}

function balanceToFloat(raw: string, decimals = 18): number {
  if (!raw || raw === '0') return 0
  const n = BigInt(raw)
  const divisor = BigInt(10 ** decimals)
  return Number(n * 10000n / divisor) / 10000
}

export function EgldWalletInspector({ address }: { address: string }) {
  const [account, setAccount] = useState<EgldAccount | null>(null)
  const [tokens, setTokens] = useState<EsdtToken[]>([])
  const [nfts, setNfts] = useState<NftToken[]>([])
  const [egldPrice, setEgldPrice] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'tokens' | 'nfts'>('tokens')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      fetchAccount(address),
      fetchEsdtTokens(address),
      fetchNfts(address),
      fetchEgldPrice(),
    ])
      .then(([acc, tkns, nftList, price]) => {
        setAccount(acc)
        setTokens(tkns)
        setNfts(nftList)
        setEgldPrice(price)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [address])

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading wallet…</div>
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>
  if (!account) return null

  const egldBalance = balanceToFloat(account.balance)
  const egldUsd = egldBalance * egldPrice

  const tokensWithValue = tokens.map((t) => ({
    ...t,
    floatBalance: balanceToFloat(t.balance, t.decimals),
    usdValue: t.price ? balanceToFloat(t.balance, t.decimals) * t.price : 0,
  }))

  const totalUsd = egldUsd + tokensWithValue.reduce((s, t) => s + t.usdValue, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          {address.slice(4, 6).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground truncate">{address}</span>
            <button onClick={copyAddress} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              <Copy size={14} />
            </button>
            <a
              href={`https://explorer.multiversx.com/accounts/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink size={14} />
            </a>
            {copied && <span className="text-xs text-green-500">Copied!</span>}
          </div>
          {account.username && (
            <p className="text-xs text-muted-foreground mt-0.5">@{account.username}</p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<TrendingUp size={18} />}
          label="EGLD Balance"
          value={`${formatNumber(egldBalance, 4)} EGLD`}
          sub={egldPrice > 0 ? `≈ $${formatNumber(egldUsd, 2)}` : undefined}
        />
        <StatCard
          icon={<Coins size={18} />}
          label="ESDT Tokens"
          value={tokens.length.toString()}
          sub={totalUsd > 0 ? `Portfolio: $${formatNumber(totalUsd, 2)}` : undefined}
        />
        <StatCard
          icon={<ImageIcon size={18} />}
          label="NFTs"
          value={nfts.length.toString()}
          sub={`Shard ${account.shard} · Nonce ${account.nonce}`}
        />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-border">
        {(['tokens', 'nfts'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t} ({t === 'tokens' ? tokens.length : nfts.length})
          </button>
        ))}
      </div>

      {/* ESDT Tokens table */}
      {tab === 'tokens' && (
        <div className="overflow-x-auto rounded-xl border border-border">
          {tokensWithValue.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">No ESDT tokens found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium">Token</th>
                  <th className="text-right px-4 py-3 font-medium">Balance</th>
                  <th className="text-right px-4 py-3 font-medium">Price</th>
                  <th className="text-right px-4 py-3 font-medium">Value USD</th>
                </tr>
              </thead>
              <tbody>
                {tokensWithValue
                  .sort((a, b) => b.usdValue - a.usdValue)
                  .map((token) => (
                    <tr key={token.identifier} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {token.assets?.svgUrl || token.assets?.pngUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={token.assets.svgUrl || token.assets.pngUrl}
                              alt={token.name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-500">
                              {token.name.slice(0, 1)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{token.name}</div>
                            <div className="text-xs text-muted-foreground">{token.identifier.split('-')[0]}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatNumber(token.floatBalance, 4)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {token.price ? `$${formatNumber(token.price, 4)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {token.usdValue > 0 ? `$${formatNumber(token.usdValue, 2)}` : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* NFT grid */}
      {tab === 'nfts' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {nfts.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground text-sm">No NFTs found</div>
          ) : (
            nfts.map((nft) => (
              <a
                key={nft.identifier}
                href={`https://explorer.multiversx.com/nfts/${nft.identifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-border overflow-hidden hover:border-blue-500 transition-colors"
              >
                <div className="aspect-square bg-muted/30 relative">
                  {nft.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={nft.thumbnailUrl}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <div className="text-xs font-medium truncate">{nft.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{nft.collection}</div>
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
      <div className="text-blue-500 mt-0.5">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold tabular-nums">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  )
}
