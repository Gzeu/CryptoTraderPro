import type { MetadataRoute } from 'next'

const BASE = 'https://gzeu.github.io/CryptoTraderPro'

// Top coins for static sitemap entries — full dynamic sitemap would require API call
const TOP_COINS = [
  'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana',
  'ripple', 'dogecoin', 'cardano', 'avalanche-2', 'polkadot',
  'elrond-erd-2',   // EGLD / MultiversX — always included
  'chainlink', 'litecoin', 'uniswap', 'stellar',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,             lastModified: now, changeFrequency: 'always',  priority: 1 },
    { url: `${BASE}/portfolio`, lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/watchlist`, lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/alerts`,    lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const coinRoutes: MetadataRoute.Sitemap = TOP_COINS.map(id => ({
    url:             `${BASE}/coin/${id}`,
    lastModified:    now,
    changeFrequency: 'always' as const,
    priority:        0.9,
  }))

  return [...staticRoutes, ...coinRoutes]
}
