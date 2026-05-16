'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { AlertEngineProvider } from '@/components/alerts/AlertEngineProvider'
import { NotificationPermissionBanner } from '@/components/alerts/NotificationPermissionBanner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AlertEngineProvider />
      {children}
      <NotificationPermissionBanner />
      <ToastContainer />
    </QueryClientProvider>
  )
}
