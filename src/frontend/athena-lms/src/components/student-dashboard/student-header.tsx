"use client"
import { User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Student } from "@/services/api"

interface StudentHeaderProps {
  student: Student | null
  onLogout: () => void
}

export function StudentHeader({ student, onLogout }: StudentHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">My Tests</h1>
              <p className="text-xs text-slate-500">Welcome back to your dashboard</p>
            </div>
          </div>

          {student && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {student.firstName?.charAt(0)}
                    {student.firstName?.charAt(1) || ""}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-900">{student.firstName}</p>
                  <p className="text-xs text-slate-500">{student.section?.name}</p>
                </div>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="gap-2 text-slate-600 hover:text-slate-900 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
