"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  page: number
  totalPages: number
  onPreviousPage: () => void
  onNextPage: () => void
}

export function Pagination({ page, totalPages, onPreviousPage, onNextPage }: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 p-4 bg-white rounded-lg border border-slate-200">
      <Button
        onClick={onPreviousPage}
        disabled={page === 0}
        variant="outline"
        size="sm"
        className="gap-2 bg-transparent"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <div className="text-sm text-slate-600 font-medium px-4">
        Page <span className="text-slate-900 font-bold">{page + 1}</span> of{" "}
        <span className="text-slate-900 font-bold">{totalPages}</span>
      </div>

      <Button
        onClick={onNextPage}
        disabled={page === totalPages - 1}
        variant="outline"
        size="sm"
        className="gap-2 bg-transparent"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
