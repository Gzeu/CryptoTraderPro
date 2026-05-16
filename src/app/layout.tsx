import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import Header from '@/components/layout/Header'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const BASE_URL = 'https://gzeu.github.io/CryptoTraderPro'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'CryptoTraderPro — Real-Time Crypto Dashboard',
    template: '%s | CryptoTraderPro',
  },
  description:
    'Professional cryptocurrency trading dashboard. Real-time prices, portfolio tracking, candlestick charts, and watchlist for BTC, ETH, EGLD and 100+ coins.',
  keywords: ['crypto', 'trading', 'bitcoin', 'ethereum', 'EGLD', 'MultiversX', 'dashboard', 'portfolio', 'charts'],
  authors: [{ name: 'Gzeu', url: 'https://github.com/Gzeu' }],
  creator: 'Gzeu',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'CryptoTraderPro',
    title: 'CryptoTraderPro — Real-Time Crypto Dashboard',
    description: 'Professional cryptocurrency trading dashboard with real-time charts and portfolio tracking.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'CryptoTraderPro Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoTraderPro — Real-Time Crypto Dashboard',
    description: 'Real-time cryptocurrency prices, charts, and portfolio tracking.',
    images: [`${BASE_URL}/og-image.png`],
  },
  manifest: '/CryptoTraderPro/manifest.json',
  icons: {
    icon: '/CryptoTraderPro/favicon.svg',
    apple: '/CryptoTraderPro/apple-touch-icon.png',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1a' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
            <div className="header-blur">
              <Header />
            </div>
            <main className="container mx-auto px-4 py-8 fade-in">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
