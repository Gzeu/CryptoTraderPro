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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'CryptoTraderPro - Advanced Crypto Trading Dashboard',
    description: 'Professional cryptocurrency trading dashboard with real-time charts and portfolio tracking.',
    siteName: 'CryptoTraderPro',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="preconnect" href="https://api.binance.com" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}