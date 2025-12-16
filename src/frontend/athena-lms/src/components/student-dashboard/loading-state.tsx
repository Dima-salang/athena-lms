import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <Skeleton className="h-5 w-24 mb-3" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="px-6 py-5 space-y-3 flex-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="px-6 py-4 border-t border-slate-200">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
