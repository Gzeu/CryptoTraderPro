import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:        60_000,   // 1 min — don't refetch if fresh
      gcTime:           5 * 60_000, // 5 min cache
      retry:            2,
      refetchOnWindowFocus: false,
    },
  },
})
