"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTestById, type Test } from "../services/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, BookOpen, Layers, HelpCircle, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

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
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="gap-2 pl-0 hover:pl-2 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{test.testName}</CardTitle>
            <CardDescription className="text-base mt-2">
              {test.testDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t">
              <div className="space-y-1">
                <span className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                  Subject
                </span>
                <p className="font-medium">{test.subject?.name}</p>
              </div>
              <div className="space-y-1">
                <span className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <Layers className="h-3.5 w-3.5 mr-1.5" />
                  Section
                </span>
                <p className="font-medium">{test.section?.name}</p>
              </div>
              <div className="space-y-1">
                <span className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  Duration
                </span>
                <p className="font-medium">
                  {test.testDuration ? `${test.testDuration / 60} mins` : "No time limit"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                  Questions
                </span>
                <p className="font-medium">{test.questions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight px-1">Questions Preview</h2>

          {test.questions && test.questions.length > 0 ? (
            <div className="space-y-4">
              {test.questions.map((q, index) => (
                <Card key={q.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-bold bg-blue-50 text-blue-700 border-blue-200">
                          Q{index + 1}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {q.questionType.replace("_", " ").toLowerCase()}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="border-slate-300">
                        {q.fullPoints} pts
                      </Badge>
                    </div>

                    <p className="text-lg leading-relaxed font-medium">
                      {q.questionText}
                    </p>

                    {q.questionType === "MULTIPLE_CHOICE" && (
                      <div className="space-y-3 pl-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Options
                        </p>
                        <div className="grid gap-2">
                          {q.options?.map((opt, i) => {
                            const isCorrect = q.correctAnswer === opt.optionText
                            return (
                              <div
                                key={i}
                                className={`flex items-center gap-3 p-3 rounded-md border text-sm transition-colors ${isCorrect
                                  ? "bg-green-50 border-green-200 text-green-900"
                                  : "bg-white border-slate-200"
                                  }`}
                              >
                                <span className={`
                                                                    flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold border
                                                                    ${isCorrect
                                    ? "bg-green-100 border-green-300 text-green-700"
                                    : "bg-slate-100 border-slate-200 text-slate-500"
                                  }
                                                                `}>
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <span className="flex-1 font-medium">{opt.optionText}</span>
                                {isCorrect && (
                                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Correct
                                  </Badge>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {q.questionType === "TRUE_FALSE" && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Correct Answer
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 uppercase px-3 py-1 text-sm">
                            {q.correctAnswer || "Not set"}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {q.questionType === "IDENTIFICATION" && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Correct Answer
                        </p>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-900 font-medium inline-block min-w-[200px]">
                          {q.correctAnswer || "No answer set"}
                        </div>
                      </div>
                    )}

                    {q.questionType === "ESSAY" && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Model Answer / Key Points
                        </p>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-sm italic">
                          {q.correctAnswer || "No model answer provided."}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <HelpCircle className="h-12 w-12 text-slate-300" />
                <p className="text-muted-foreground">No questions have been added to this test yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestDetailPage
