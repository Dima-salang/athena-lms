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
            console.log("Dirty answer IDs:", dirtyAnswerIds.current)
            console.log("Answers:", answers)
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
            submission: submission // This might be redundant if backend handles it, but good for local state
        }

        if (type === 'option') {
            const optionId = value as number
            console.log("Option ID:", optionId)

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
        // Prevent manual double submit if auto-submit triggered
        if (submitting) return

        // Only ask for confirmation if time is NOT up (manual trigger)
        // If triggered by timer (timeLeft === 0), skip confirmation
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-slate-600">Loading test...</div>
            </div>
        )
    }

    if (error || !test) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-red-600">{error || "Test not found"}</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            {/* Sticky Timer Header */}
            <div className={`sticky top-0 z-40 shadow-md backdrop-blur-md transition-colors duration-300 ${(timeLeft !== null && timeLeft <= 300) ? 'bg-red-50 border-b border-red-200' : 'bg-white/90 border-b border-slate-200'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 truncate max-w-xs sm:max-w-md">{test.testName}</h1>
                        {(timeLeft !== null && timeLeft <= 300) && (
                            <p className="text-xs text-red-600 font-semibold animate-pulse">Warning: Less than 5 minutes remaining!</p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg ${(timeLeft !== null && timeLeft <= 300) ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {timeLeft !== null ? formatTime(timeLeft) : '--:--:--'}
                        </div>

                        <div className="hidden sm:block text-sm text-slate-500 text-right">
                            <div>Question {test.questions.length} total</div>
                            {isSaving ? (
                                <span className="text-blue-600 animate-pulse text-xs">Saving...</span>
                            ) : lastSaved ? (
                                <span className="text-green-600 text-xs">Saved {lastSaved.toLocaleTimeString()}</span>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <p className="text-slate-600 mb-4">{test.testDescription}</p>
                    {/* Mobile only status */}
                    <div className="sm:hidden flex justify-between text-xs text-slate-500 border-t pt-3">
                        <span>{test.questions.length} Questions</span>
                        {isSaving ? (
                            <span className="text-blue-600 animate-pulse">Saving...</span>
                        ) : lastSaved ? (
                            <span className="text-green-600">Saved {lastSaved.toLocaleTimeString()}</span>
                        ) : null}
                    </div>
                </div>

                <div className="space-y-6">
                    {test.questions.map((question, index) => (
                        <div key={question.id} className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 font-bold rounded-full">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="text-lg text-slate-900 mb-4">{question.questionText}</p>

                                    {question.questionType === 'MULTIPLE_CHOICE' && (
                                        <div className="space-y-3">
                                            {question.options?.map((option) => (
                                                <label key={option.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition">
                                                    <input
                                                        type="radio"
                                                        name={`question-${question.id}`}
                                                        value={option.id}
                                                        onChange={(e) => handleAnswerChange(question.id, Number(e.target.value), 'option')}
                                                        checked={answers[question.id]?.optionId === option.id}
                                                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-slate-700">{option.optionText}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {question.questionType === 'TRUE_FALSE' && (
                                        <div className="space-y-3">
                                            {['true', 'false'].map((optionValue) => (
                                                <label key={optionValue} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition">
                                                    <input
                                                        type="radio"
                                                        name={`question-${question.id}`}
                                                        value={optionValue}
                                                        onChange={(e) => handleAnswerChange(question.id, e.target.value, 'text')}
                                                        checked={answers[question.id]?.textAnswer === optionValue}
                                                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-slate-700 capitalize">{optionValue}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {(question.questionType === 'ESSAY' || question.questionType === 'IDENTIFICATION') && (
                                        <textarea
                                            rows={4}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            placeholder="Type your answer here..."
                                            value={answers[question.id]?.textAnswer || ''}
                                            onChange={(e) => handleAnswerChange(question.id, e.target.value, 'text')}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {submitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TakeTestPage
