import type { NextConfig } from 'next'

// GitHub Pages serves from https://gzeu.github.io/CryptoTraderPro/
// Set NEXT_PUBLIC_BASE_PATH='' in .env.local for local dev (no basePath needed)
const isProd = process.env.NODE_ENV === 'production'
const repoName = 'CryptoTraderPro'

const nextConfig: NextConfig = {
  // Static HTML export — required for GitHub Pages
  output: 'export',

  // Sub-path for GitHub Pages (e.g. /CryptoTraderPro/)
  // Set to '' if you use a custom domain (CNAME)
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',

  // Images must be unoptimized for static export (no server)
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.coingecko.com' },
      { protocol: 'https', hostname: 'coin-images.coingecko.com' },
      { protocol: 'https', hostname: 'static.coinpaprika.com' },
      { protocol: 'https', hostname: 'cryptologos.cc' },
    ],
  },

  // Trailing slash for clean GitHub Pages routing
  trailingSlash: true,

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // NOTE: headers() does NOT work with output:'export' (static)
  // API routes also don't work in static export — all data fetching
  // must happen client-side (which this app already does via Axios/TanStack Query)
}

export default nextConfig
