import { BacktestPanel } from '@/components/backtest/BacktestPanel'

export const metadata = {
  title: 'Backtesting | CryptoTraderPro',
  description: 'Run SMA Cross, RSI Reversal and Buy & Hold backtests on historical OHLC data.',
}

export default function BacktestPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Backtesting</h1>
      <BacktestPanel />
    </main>
  )
}
