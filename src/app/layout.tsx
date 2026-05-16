import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const APP_URL = 'https://gzeu.github.io/CryptoTraderPro'

export const metadata: Metadata = {
  title: {
    default: 'CryptoTraderPro — Real-time Crypto Dashboard',
    template: '%s | CryptoTraderPro',
  },
  description:
    'Professional cryptocurrency trading dashboard. Real-time prices, candlestick charts, portfolio P&L tracker, and watchlist for 100+ coins including EGLD/MultiversX.',
  keywords: ['crypto','cryptocurrency','trading','dashboard','bitcoin','ethereum','EGLD','MultiversX','portfolio','watchlist','CoinGecko'],
  authors: [{ name: 'Gzeu', url: 'https://github.com/Gzeu' }],
  creator: 'Gzeu',
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website', locale: 'en_US', url: APP_URL,
    title: 'CryptoTraderPro — Real-time Crypto Dashboard',
    description: 'Professional cryptocurrency dashboard with real-time prices, OHLC charts, and portfolio tracking.',
    siteName: 'CryptoTraderPro',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'CryptoTraderPro Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoTraderPro',
    description: 'Professional crypto dashboard with live prices, OHLC charts & portfolio tracking.',
    images: ['/og-image.png'],
  },
  manifest: '/CryptoTraderPro/manifest.json',
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#0f172a' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/CryptoTraderPro/favicon.svg" />
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){try{var t=localStorage.getItem('ctp-theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})()`
        }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
