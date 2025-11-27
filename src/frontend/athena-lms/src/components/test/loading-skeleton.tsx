"use client"

/**
 * LoadingSkeleton Component
 * Provides a better UX with skeleton loading state
 * Shows while test data is being fetched
 */
export default function LoadingSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-label="Loading test details">
      <div className="space-y-3 rounded-lg border border-border bg-card p-4 md:p-6">
        <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-border bg-card p-4 md:p-6">
          <div className="h-6 w-1/4 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading test details...</span>
    </div>
  )
}
