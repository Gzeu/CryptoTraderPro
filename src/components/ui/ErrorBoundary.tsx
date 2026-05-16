'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-8 rounded-xl border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <AlertTriangle size={32} style={{ color: 'var(--red)' }} />
          <div className="text-center">
            <p className="font-semibold mb-1">Something went wrong</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: 'var(--primary)', color: '#fff' }}>
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
