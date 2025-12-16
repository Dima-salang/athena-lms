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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react"

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

    // Autosave state
    const dirtyAnswerIds = useRef<Set<number>>(new Set())
    const answersRef = useRef(answers)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    // Sync answers ref
    useEffect(() => {
        answersRef.current = answers
    }, [answers])

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

        if (timeLeft !== 0 && !window.confirm("Are you sure you want to submit your test?")) return

        try {
            setSubmitting(true)
            const answerList = Object.values(answers)
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !test) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex flex-col items-center gap-2 max-w-md text-center">
                    <AlertTriangle className="h-6 w-6" />
                    <p className="font-medium">{error || "Test not found"}</p>
                    <Button variant="outline" onClick={() => navigate("/student-dashboard")} className="mt-2">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    const isLowTime = timeLeft !== null && timeLeft <= 300;

    return (
        <div className="min-h-screen bg-slate-50/50 relative pb-20">
            {/* Sticky Timer Header */}
            <div className={`sticky top-0 z-40 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-300 border-b ${isLowTime ? 'bg-red-50/90 border-red-200' : 'bg-white/80 border-slate-200'
                }`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <div className="flex-1 min-w-0 mr-4">
                        <h1 className="text-lg font-bold text-slate-900 truncate">{test.testName}</h1>
                        {isLowTime && (
                            <p className="text-xs text-destructive font-semibold animate-pulse flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Less than 5 minutes remaining!
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <Badge variant={isLowTime ? "destructive" : "secondary"} className="text-base px-3 py-1 font-mono gap-2">
                            <Clock className="h-4 w-4" />
                            {timeLeft !== null ? formatTime(timeLeft) : '--:--:--'}
                        </Badge>

                        <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground">
                            <span>{test.questions.length} Questions</span>
                            {isSaving ? (
                                <span className="text-blue-600 flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                                </span>
                            ) : lastSaved ? (
                                <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Saved {lastSaved.toLocaleTimeString()}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-muted-foreground mb-4">{test.testDescription}</p>
                        {/* Mobile only status */}
                        <div className="sm:hidden flex justify-between text-xs text-muted-foreground border-t pt-3">
                            <span>{test.questions.length} Questions</span>
                            {isSaving ? (
                                <span className="text-blue-600 animate-pulse">Saving...</span>
                            ) : lastSaved ? (
                                <span className="text-green-600">Saved {lastSaved.toLocaleTimeString()}</span>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {test.questions.map((question, index) => (
                        <Card key={question.id}>
                            <CardContent className="p-6 flex gap-4">
                                <Badge variant="outline" className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground border-secondary font-bold text-sm p-0">
                                    {index + 1}
                                </Badge>
                                <div className="flex-1 space-y-4">
                                    <p className="text-lg font-medium leading-relaxed">{question.questionText}</p>

                                    {question.questionType === 'MULTIPLE_CHOICE' && (
                                        <RadioGroup
                                            value={answers[question.id]?.optionId?.toString() || ""}
                                            onValueChange={(val) => handleAnswerChange(question.id, Number(val), 'option')}
                                        >
                                            <div className="space-y-3">
                                                {question.options?.map((option) => (
                                                    <div key={option.id?.toString() || option.tempId || index} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50 transition-colors">
                                                        <RadioGroupItem value={(option.id || option.tempId || index).toString()} id={`opt-${question.id}-${option.id || option.tempId || index}`} />
                                                        <Label htmlFor={`opt-${question.id}-${option.id}`} className="flex-1 cursor-pointer font-normal">
                                                            {option.optionText}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    )}

                                    {question.questionType === 'TRUE_FALSE' && (
                                        <RadioGroup
                                            value={answers[question.id]?.textAnswer || ""}
                                            onValueChange={(val) => handleAnswerChange(question.id, val, 'text')}
                                        >
                                            <div className="space-y-3">
                                                {['true', 'false'].map((optionValue) => (
                                                    <div key={optionValue} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50 transition-colors">
                                                        <RadioGroupItem value={optionValue} id={`opt-${question.id}-${optionValue}`} />
                                                        <Label htmlFor={`opt-${question.id}-${optionValue}`} className="flex-1 cursor-pointer capitalize font-normal">
                                                            {optionValue}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    )}

                                    {question.questionType === 'ESSAY' && (
                                        <Textarea
                                            rows={5}
                                            placeholder="Type your answer here..."
                                            value={answers[question.id]?.textAnswer || ''}
                                            onChange={(e) => handleAnswerChange(question.id, e.target.value, 'text')}
                                            className="resize-none"
                                        />
                                    )}

                                    {question.questionType === 'IDENTIFICATION' && (
                                        <Input
                                            type="text"
                                            placeholder="Type your answer here..."
                                            value={answers[question.id]?.textAnswer || ''}
                                            onChange={(e) => handleAnswerChange(question.id, e.target.value, 'text')}
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full sm:w-auto"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Test"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default TakeTestPage
