"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    getStudentTestById,
    startTest,
    submitTest,
    updateAnswers,
    getStudentAnswers,
    type Test,
    type Submission,
    type StudentAnswer
} from "../services/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Loader2, CheckCircle2, Save, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const TakeTestPage: React.FC = () => {
    const { testId } = useParams<{ testId: string }>()
    const navigate = useNavigate()
    const [test, setTest] = useState<Test | null>(null)
    const [submission, setSubmission] = useState<Submission | null>(null)
    const [answers, setAnswers] = useState<Record<number, StudentAnswer>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const [progress, setProgress] = useState(0)

    // Autosave state
    const dirtyAnswerIds = useRef<Set<number>>(new Set())
    const answersRef = useRef(answers)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    // Sync answers ref and calculate progress
    useEffect(() => {
        answersRef.current = answers

        if (test?.questions) {
            const answeredCount = Object.keys(answers).length
            const totalQuestions = test.questions.length
            setProgress(totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0)
        }
    }, [answers, test])

    useEffect(() => {
        const initTest = async () => {
            if (!testId) return
            try {
                setLoading(true)
                const testData = await getStudentTestById(Number(testId))
                setTest(testData)

                // Start the test (create submission) or resume
                const submissionData = await startTest(Number(testId))
                setSubmission(submissionData)

                // Initialize Timer
                if (submissionData.startTime && testData.testDuration) {
                    const startTime = new Date(submissionData.startTime).getTime()
                    const durationMs = testData.testDuration * 1000
                    const endTime = startTime + durationMs
                    const now = new Date().getTime()
                    const initialTimeLeft = Math.max(0, Math.floor((endTime - now) / 1000))
                    setTimeLeft(initialTimeLeft)
                }

                // Fetch existing answers if any
                const existingAnswers = await getStudentAnswers(submissionData.id)
                if (existingAnswers && existingAnswers.length > 0) {
                    const answersMap: Record<number, StudentAnswer> = {}
                    existingAnswers.forEach(ans => {
                        answersMap[ans.question.id] = ans
                    })
                    setAnswers(answersMap)
                }
            } catch (err) {
                console.error(err)
                setError("Failed to load test. Please try again.")
            } finally {
                setLoading(false)
            }
        }
        initTest()
    }, [testId])

    // Timer logic
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 0) {
                    clearInterval(timer)
                    return 0
                }
                const newTime = prev - 1

                if (newTime === 0) {
                    // Auto-submit logic
                    alert("Time is up! Submitting your test.")
                    handleSubmit()
                }
                return newTime
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft]) // Re-run if timeLeft is set from null to a value

    // Autosave effect
    useEffect(() => {
        const interval = setInterval(async () => {
            if (dirtyAnswerIds.current.size === 0) return
            try {
                setIsSaving(true)
                const answersToSave = Array.from(dirtyAnswerIds.current).map(id => answersRef.current[id]).filter(Boolean)

                if (answersToSave.length > 0) {
                    await updateAnswers(answersToSave)
                    dirtyAnswerIds.current.clear()
                    setLastSaved(new Date())
                    console.log(answersToSave)
                }
            } catch (err) {
                console.error("Autosave failed", err)
            } finally {
                setIsSaving(false)
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const handleAnswerChange = (questionId: number, value: string | number, type: 'text' | 'option') => {
        if (!test || !submission) return

        const question = test.questions.find(q => q.id === questionId)
        if (!question) return

        const currentAnswer = answers[questionId] || {
            question: question,
            submission: submission
        }

        if (type === 'option') {
            const optionId = value as number
            setAnswers(prev => ({
                ...prev,
                [questionId]: {
                    ...currentAnswer,
                    optionId: optionId,
                    question: question
                }
            }))
        } else {
            setAnswers(prev => ({
                ...prev,
                [questionId]: {
                    ...currentAnswer,
                    textAnswer: value as string,
                    question: question
                }
            }))
        }

        dirtyAnswerIds.current.add(questionId)
    }

    const handleSubmit = async () => {
        if (!submission) return
        if (submitting) return

        if (timeLeft !== 0 && !window.confirm("Are you sure you want to submit your test? You won't be able to change your answers.")) return

        try {
            setSubmitting(true)
            const answerList = Object.values(answers)
            console.log("Answer list: ", answerList)
            await submitTest(submission.id, answerList)
            if (timeLeft !== 0) alert("Test submitted successfully!")
            navigate("/student-dashboard")
        } catch (err) {
            console.error(err)
            alert("Failed to submit test. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50 dark:bg-slate-900">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground animate-pulse">Preparing your assessment...</p>
                </div>
            </div>
        )
    }

    if (error || !test) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
                <div className="bg-destructive/10 text-destructive p-8 rounded-xl flex flex-col items-center gap-3 max-w-md text-center shadow-sm border border-destructive/20">
                    <AlertTriangle className="h-8 w-8" />
                    <h3 className="font-semibold text-lg">Error Loading Test</h3>
                    <p className="text-sm opacity-90">{error || "Test not found"}</p>
                    <Button variant="outline" onClick={() => navigate("/student-dashboard")} className="mt-4 bg-white border-destructive/30 hover:bg-destructive/5 text-destructive">
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    const isLowTime = timeLeft !== null && timeLeft <= 300;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 relative pb-20">
            {/* Sticky Header */}
            <div className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md transition-all duration-300 border-b shadow-sm ${isLowTime
                ? 'bg-red-50/90 dark:bg-red-950/50 border-red-200 dark:border-red-900'
                : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800'
                }`}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="flex-1 min-w-0 w-full sm:w-auto">
                            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{test.testName}</h1>
                            <div className="flex items-center gap-4 text-xs">
                                <span className="text-muted-foreground hidden sm:inline">
                                    Question {Object.keys(answers).length} of {test.questions.length} Answered
                                </span>
                                {isLowTime && (
                                    <span className="text-red-600 dark:text-red-400 font-bold animate-pulse flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Less than 5 mins!
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                            <div className={`flex flex-col items-end px-3 py-1 rounded-lg border ${isLowTime
                                ? "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800"
                                : "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                                }`}>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Time Remaining</div>
                                <div className={`font-mono text-lg font-bold ${isLowTime ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"
                                    }`}>
                                    {timeLeft !== null ? formatTime(timeLeft) : 'Unlimited'}
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                size="sm"
                                className={isLowTime ? "bg-red-600 hover:bg-red-700" : ""}
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                            </Button>
                        </div>
                    </div>
                    <Progress value={progress} className="h-1 mt-3 w-full" />
                </div>
            </div>

            <div className="max-w-4xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Instructions Card */}
                <Card className="border-none shadow-sm bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900">
                    <CardContent className="p-6 flex gap-4">
                        <div className="shrink-0 hidden sm:block">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <FileText className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Instructions</h3>
                            <p className="text-indigo-800/80 dark:text-indigo-200/80 text-sm leading-relaxed">{test.testDescription}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    {test.questions.map((question, index) => {
                        const isAnswered = answers[question.id] !== undefined;
                        return (
                            <Card key={question.id} className={`transition-all duration-200 border-none shadow-sm ${isAnswered
                                ? "bg-white/80 dark:bg-slate-900/80 border-l-4 border-l-green-500"
                                : "bg-white dark:bg-slate-900 border-l-4 border-l-slate-300 dark:border-l-slate-700 hover:shadow-md"
                                }`}>
                                <CardContent className="p-6 md:p-8 flex gap-6">
                                    <div className="shrink-0 flex flex-col items-center gap-2">
                                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border ${isAnswered
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                                            }`}>
                                            {index + 1}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-mono">{question.fullPoints}pts</span>
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        <p className="text-lg font-medium leading-relaxed text-slate-800 dark:text-slate-100">
                                            {question.questionText}
                                        </p>

                                        {question.questionType === 'MULTIPLE_CHOICE' && (
                                            <RadioGroup
                                                value={answers[question.id]?.optionId?.toString() || ""}
                                                onValueChange={(val) => handleAnswerChange(question.id, Number(val), 'option')}
                                                className="space-y-3"
                                            >
                                                {question.options?.map((option, idx) => {
                                                    const val = option.id || option.tempId || idx
                                                    const isSelected = answers[question.id]?.optionId === val
                                                    return (
                                                        <div key={val} className="relative">
                                                            <RadioGroupItem
                                                                value={val.toString()}
                                                                id={`opt-${question.id}-${val}`}
                                                                className="peer sr-only"
                                                            />
                                                            <div
                                                                onClick={() => handleAnswerChange(question.id, val, 'option')}
                                                                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                                                    ? "border-primary bg-primary/5 text-primary"
                                                                    : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                                    }`}
                                                            >
                                                                <div className={`flex items-center justify-center h-5 w-5 rounded-full border mr-3 relative ${isSelected
                                                                    ? "border-primary bg-primary"
                                                                    : "border-slate-300 dark:border-slate-600"
                                                                    }`}>
                                                                    {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                                                                </div>
                                                                <span className="text-base font-normal">{option.optionText}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </RadioGroup>
                                        )}

                                        {question.questionType === 'TRUE_FALSE' && (
                                            <RadioGroup
                                                value={answers[question.id]?.textAnswer || ""}
                                                onValueChange={(val) => handleAnswerChange(question.id, val, 'text')}
                                                className="grid grid-cols-2 gap-4 max-w-md"
                                            >
                                                {['true', 'false'].map((optionValue) => {
                                                    const isSelected = answers[question.id]?.textAnswer === optionValue
                                                    return (
                                                        <div key={optionValue} className="relative">
                                                            <RadioGroupItem value={optionValue} id={`opt-${question.id}-${optionValue}`} className="peer sr-only" />
                                                            <div
                                                                onClick={() => handleAnswerChange(question.id, optionValue, 'text')}
                                                                className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all capitalize font-medium text-lg ${isSelected
                                                                    ? "border-primary bg-primary/5 text-primary"
                                                                    : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                                    }`}
                                                            >
                                                                {optionValue}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </RadioGroup>
                                        )}

                                        {question.questionType === 'ESSAY' && (
                                            <Textarea
                                                rows={6}
                                                placeholder="Type your answer here..."
                                                value={answers[question.id]?.textAnswer || ''}
                                                onChange={(e) => handleAnswerChange(question.id, e.target.value, 'text')}
                                                className="resize-none bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 text-base leading-relaxed p-4"
                                            />
                                        )}

                                        {question.questionType === 'IDENTIFICATION' && (
                                            <Input
                                                type="text"
                                                placeholder="Type your answer here..."
                                                value={answers[question.id]?.textAnswer || ''}
                                                onChange={(e) => handleAnswerChange(question.id, e.target.value, 'text')}
                                                className="bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 h-12 text-base"
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Bottom Status Bar */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 transform translate-y-0 opacity-100">
                    <div className="bg-slate-900/90 text-white backdrop-blur-md shadow-lg rounded-full px-5 py-2.5 flex items-center gap-3 text-sm font-medium">
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                                <span>Saving progress...</span>
                            </>
                        ) : lastSaved ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                                <span>Specific answers saved</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                <span>Ready to save</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex justify-center pt-8 pb-12">
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full max-w-sm h-14 text-lg shadow-xl shadow-primary/20"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Submitting Assessment...
                            </>
                        ) : (
                            "Submit Assessment"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default TakeTestPage
