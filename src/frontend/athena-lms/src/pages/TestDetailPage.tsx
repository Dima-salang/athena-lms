"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTestById, type Test } from "../services/api"

const TestDetailPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>()
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return
      try {
        const data = await getTestById(Number(testId))
        setTest(data)
      } catch (err) {
        setError("Failed to load test details.")
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [testId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="font-semibold text-red-700">Error Loading Test</h1>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    )
  }

  if (!test) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Test Not Found</h1>
          <p className="mt-2 text-slate-600">The test you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{test.testName}</h1>
              <p className="text-slate-600 text-base">{test.testDescription}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Subject</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">{test.subject?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Section</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">{test.section?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Duration</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {test.testDuration ? `${test.testDuration / 60} mins` : "No time limit"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Questions</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">{test.questions?.length || 0}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions</h2>

          {test.questions && test.questions.length > 0 ? (
            <div className="space-y-4">
              {test.questions.map((q, index) => (
                <div key={q.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded">
                        Q{index + 1}
                      </span>
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                        {q.questionType.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{q.fullPoints} pts</span>
                  </div>

                  <p className="text-base text-slate-900 mb-4 leading-relaxed">{q.questionText}</p>

                  {q.questionType === "MULTIPLE_CHOICE" && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Options:</p>
                      <ul className="space-y-2">
                        {q.options?.map((opt, i) => {
                          const isCorrect = q.correctAnswer === opt.optionText
                          return (
                            <li
                              key={i}
                              className={`flex items-center gap-2 p-3 rounded border ${isCorrect ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"
                                }`}
                            >
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${isCorrect ? "bg-green-200 text-green-700" : "bg-slate-200 text-slate-700"
                                  }`}
                              >
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span
                                className={`text-sm ${isCorrect ? "font-semibold text-green-700" : "text-slate-700"}`}
                              >
                                {opt.optionText}
                                {isCorrect && (
                                  <span className="ml-2 text-xs font-semibold text-green-600">✓ Correct</span>
                                )}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  {q.questionType === "TRUE_FALSE" && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                        Correct Answer:
                      </p>
                      <div className="inline-block px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg capitalize">
                        {q.correctAnswer || "Not set"}
                      </div>
                    </div>
                  )}

                  {q.questionType === "IDENTIFICATION" && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                        Correct Answer:
                      </p>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium">
                        {q.correctAnswer || "No answer set"}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-lg shadow-md">
              <p className="text-slate-600">No questions added yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestDetailPage
