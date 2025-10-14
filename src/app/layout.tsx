import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'CryptoTraderPro - Advanced Crypto Trading Dashboard',
    template: '%s | CryptoTraderPro',
  },
  description: 'Professional cryptocurrency trading dashboard with real-time charts, portfolio tracking, and advanced analytics. Built with Next.js 14, TypeScript, and TradingView charts.',
  keywords: [
    'cryptocurrency',
    'bitcoin',
    'ethereum',
    'trading',
    'dashboard',
    'portfolio',
    'charts',
    'real-time',
    'crypto prices',
    'market data',
  ],
  authors: [{ name: 'CryptoTraderPro Team' }],
  creator: 'CryptoTraderPro',
  publisher: 'CryptoTraderPro',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'CryptoTraderPro - Advanced Crypto Trading Dashboard',
    description: 'Professional cryptocurrency trading dashboard with real-time charts and portfolio tracking.',
    siteName: 'CryptoTraderPro',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CryptoTraderPro Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoTraderPro - Advanced Crypto Trading Dashboard',
    description: 'Professional cryptocurrency trading dashboard with real-time charts and portfolio tracking.',
    images: ['/og-image.png'],
    creator: '@cryptotraderpro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="preconnect" href="https://api.binance.com" />
        <link rel="dns-prefetch" href="https://assets.coingecko.com" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col bg-background">
            <div className="flex-1">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}