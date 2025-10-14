import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import Header from '@/components/layout/Header'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'CryptoTraderPro - Advanced Crypto Trading Dashboard',
    template: '%s | CryptoTraderPro',
  },
  description: 'Professional cryptocurrency trading dashboard with real-time charts, portfolio tracking, and advanced analytics.',
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