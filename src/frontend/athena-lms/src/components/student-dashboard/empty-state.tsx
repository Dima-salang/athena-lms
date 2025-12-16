import { FileText } from "lucide-react"

export function EmptyState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50">
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="p-3 bg-white rounded-full mb-4">
          <FileText className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 text-center">No tests available</h3>
        <p className="text-slate-600 text-sm mt-2 text-center max-w-sm">
          There are no tests for your section yet. Check back later or contact your instructor.
        </p>
      </div>
    </div>
  )
}
