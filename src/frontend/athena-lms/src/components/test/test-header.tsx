"use client"
import type { Test } from "../../services/api"
import { useNavigate } from "react-router-dom"
interface TestHeaderProps {
  test: Test
}

/**
 * TestHeader Component
 * Displays test metadata and navigation
 * Extracted for better code organization and reusability
 */
export default function TestHeader({ test }: TestHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="mb-6 md:mb-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        aria-label="Back to Dashboard"
      >
        ← Back to Dashboard
      </button>

      <div className="rounded-lg border border-border bg-card p-4 md:p-6">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{test.testName}</h1>
          {test.testDescription && <p className="text-sm text-muted-foreground md:text-base">{test.testDescription}</p>}

          <dl className="grid grid-cols-1 gap-3 pt-3 text-sm md:grid-cols-3">
            {test.subject && (
              <div>
                <dt className="font-semibold text-foreground">Subject</dt>
                <dd className="text-muted-foreground">{test.subject.name}</dd>
              </div>
            )}
            {test.section && (
              <div>
                <dt className="font-semibold text-foreground">Section</dt>
                <dd className="text-muted-foreground">{test.section.name}</dd>
              </div>
            )}
            {test.testDuration && (
              <div>
                <dt className="font-semibold text-foreground">Duration</dt>
                <dd className="text-muted-foreground">{Math.floor(test.testDuration / 60)} minutes</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </header>
  )
}
