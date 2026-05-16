import Link from 'next/link'
import { HomeIcon } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="font-mono text-7xl font-bold text-muted-foreground/20">404</p>
        <h2 className="text-xl font-semibold tracking-tight">Page not found</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Link href="/" className="btn btn-primary compact-btn inline-flex items-center gap-2">
        <HomeIcon className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  )
}
