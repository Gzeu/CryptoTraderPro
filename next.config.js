/** @type {import('next').NextConfig} */

// GitHub Pages deploys to https://gzeu.github.io/CryptoTraderPro/
// Remove basePath if you add a custom domain (CNAME)
const isProd = process.env.NODE_ENV === 'production'
const repoName = 'CryptoTraderPro'

const nextConfig = {
  // --- Required for GitHub Pages (static HTML export) ---
  output: 'export',
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  trailingSlash: true,

  // Images must be unoptimized in static export (no server)
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.coingecko.com' },
      { protocol: 'https', hostname: 'coin-images.coingecko.com' },
      { protocol: 'https', hostname: 'static.coinpaprika.com' },
      { protocol: 'https', hostname: 'cryptologos.cc' },
    ],
  },

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // NOTE: headers() is ignored in static export
  // API routes are not supported in static export
}

module.exports = nextConfig
