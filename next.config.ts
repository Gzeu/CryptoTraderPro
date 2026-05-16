import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'
// GitHub Pages serves from /CryptoTraderPro/ unless a custom domain is set
const repoName = 'CryptoTraderPro'

const nextConfig: NextConfig = {
  output: 'export',
  // When deployed to https://gzeu.github.io/CryptoTraderPro/
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  images: {
    unoptimized: true, // required for static export
  },
  trailingSlash: true,
}

export default nextConfig
