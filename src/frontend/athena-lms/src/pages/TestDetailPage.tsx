"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTestById, type Test } from "../services/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, BookOpen, Layers, HelpCircle, CheckCircle2, AlertCircle, Loader2, Calendar, FileText } from "lucide-react"

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
      } catch {
        setError("Failed to load test details.")
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [testId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Test Not Found</h1>
          <p className="text-muted-foreground">The test you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Modern Header */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div className="relative z-10">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-6 pl-0 hover:pl-2 transition-all text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>

            <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {test.subject?.name}
                  </Badge>
                  <Badge variant="outline" className="text-slate-500">
                    {test.section?.name}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
                  {test.testName}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {test.testDescription}
                </p>
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                <Button className="w-full shadow-md bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => navigate(`/test/${test.id}/edit`)}>
                  Edit Configuration
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/teacher/test/${test.id}/submissions`)}>
                  View Submissions
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Duration</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {test.testDuration ? `${test.testDuration / 60} mins` : "Unlimited"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Due Date</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {new Date(test.testDueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Questions</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {test.questions?.length || 0} Items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Total Points</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {test.questions?.reduce((acc, q) => acc + q.fullPoints, 0) || 0} pts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold tracking-tight">Question Preview</h2>
            <Badge variant="outline" className="bg-slate-100">
              ReadOnly View
            </Badge>
          </div>

          {test.questions && test.questions.length > 0 ? (
            <div className="grid gap-6">
              {test.questions.map((q, index) => (
                <Card key={q.id} className="overflow-hidden border-none shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                  <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-80" />
                  <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-bold text-sm">
                          {index + 1}
                        </span>
                        <Badge variant="secondary" className="capitalize font-medium">
                          {q.questionType.replace("_", " ").toLowerCase()}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="border-slate-200 font-mono">
                        {q.fullPoints} pts
                      </Badge>
                    </div>

                    <div className="pl-11">
                      <p className="text-lg font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                        {q.questionText}
                      </p>

                      <div className="mt-6">
                        {q.questionType === "MULTIPLE_CHOICE" && (
                          <div className="grid gap-3">
                            {q.options?.map((opt, i) => {
                              const isCorrect = q.correctAnswer === opt.optionText
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center gap-4 p-3 rounded-xl border text-sm transition-all ${isCorrect
                                    ? "bg-green-50/50 border-green-200 text-green-900 shadow-sm"
                                    : "bg-white/50 border-slate-100 text-slate-600"
                                    }`}
                                >
                                  <span className={`
                                        flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold border transition-colors
                                        ${isCorrect
                                      ? "bg-green-100 border-green-300 text-green-700"
                                      : "bg-slate-100 border-slate-200 text-slate-400"
                                    }
                                    `}>
                                    {String.fromCharCode(65 + i)}
                                  </span>
                                  <span className="flex-1 font-medium">{opt.optionText}</span>
                                  {isCorrect && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {q.questionType === "TRUE_FALSE" && (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Answer:</span>
                            <Badge className={q.correctAnswer === 'true' ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                              {q.correctAnswer}
                            </Badge>
                          </div>
                        )}

                        {q.questionType === "IDENTIFICATION" && (
                          <div className="flex flex-col gap-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Correct Answer</span>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm text-slate-700 inline-block w-fit">
                              {q.correctAnswer || "Not specified"}
                            </div>
                          </div>
                        )}

                        {q.questionType === "ESSAY" && (
                          <div className="flex flex-col gap-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Model Answer / Key Points</span>
                            <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-md text-slate-600 text-sm italic">
                              {q.correctAnswer || "No model answer provided."}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 shadow-none bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="bg-white p-4 rounded-full shadow-sm">
                  <FileText className="h-8 w-8 text-slate-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">No Questions Added</h3>
                  <p className="text-muted-foreground">This test is currently empty.</p>
                </div>
                <Button variant="outline" onClick={() => navigate(`/test/${test.id}/edit`)}>
                  Add Questions
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestDetailPage
