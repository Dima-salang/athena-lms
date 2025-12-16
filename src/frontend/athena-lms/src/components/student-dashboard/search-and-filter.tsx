"use client"

import type React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchAndFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export function SearchAndFilter({ searchTerm, onSearchChange }: SearchAndFilterProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Tests Available</h2>
          <p className="text-sm text-slate-600 mt-1">View and complete your assigned tests</p>
        </div>

        <div className="w-full sm:w-72">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
