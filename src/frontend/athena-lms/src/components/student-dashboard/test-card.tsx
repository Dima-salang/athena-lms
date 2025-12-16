"use client"
import { Clock, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Test } from "@/services/api"

interface TestCardProps {
  test: Test
  isCompleted: boolean
  onTakeTest: () => void
}

export function TestCard({ test, isCompleted, onTakeTest }: TestCardProps) {
  const isPastDue = new Date(test.testDueDate) < new Date()
  const statusColor = isPastDue ? "bg-red-50" : isCompleted ? "bg-green-50" : "bg-blue-50"
  const statusBorderColor = isPastDue ? "border-red-200" : isCompleted ? "border-green-200" : "border-blue-200"

  return (
    <div
      className={`rounded-lg border ${statusBorderColor} ${statusColor} overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full`}
    >
      {/* Header */}
      <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-current border-opacity-10">
        <div className="flex items-start justify-between gap-3 mb-2">
          <Badge variant="secondary" className="text-xs font-medium">
            {test.subject.name}
          </Badge>
          {isCompleted && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />}
          {isPastDue && !isCompleted && <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
        </div>
        <h3 className="text-base font-bold text-slate-900 line-clamp-2">{test.testName}</h3>
        <p className="text-sm text-slate-600 line-clamp-2 mt-1">{test.testDescription}</p>
      </div>

      {/* Details */}
      <div className="flex-1 px-5 py-4 sm:px-6 sm:py-5 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <span className="font-medium">{test.testDuration / 60} minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <span className="font-medium">Due: {new Date(test.testDueDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-current border-opacity-10 text-xs text-slate-500">
          <span>Created: {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : "N/A"}</span>
          <span>Updated: {test.updatedAt ? new Date(test.updatedAt).toLocaleDateString() : "N/A"}</span>
        </div>
      </div>

      {/* Footer/CTA */}
      <div className="px-5 py-4 sm:px-6 sm:py-5 border-t border-current border-opacity-10">
        {isPastDue ? (
          <Button disabled variant="outline" className="w-full text-slate-500 bg-transparent">
            Past Due
          </Button>
        ) : isCompleted ? (
          <Button
            disabled
            variant="outline"
            className="w-full text-green-600 border-green-200 bg-green-50 hover:bg-green-50"
          >
            ✓ Completed
          </Button>
        ) : (
          <Button onClick={onTakeTest} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
            Take Test
          </Button>
        )}
      </div>
    </div>
  )
}
