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
    type StudentAnswer,
    type MultipleChoiceQuestion,
    type Option
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
            // Find option object if needed, but ID is enough for backend usually
            // However, our API expects Option object in StudentAnswer if strict, 
            // but usually ID is what matters for mapping.
            // Let's assume we need to pass optionId.
            // But the interface says `option?: Option`.
            // We might need to find the option object from the question.
            console.log("Option ID:", optionId)
            const mcq = question as MultipleChoiceQuestion
            const selectedOption = mcq.options?.find(o => { o.id === optionId; console.log(o.id) }) as Option
            console.log("Selected Option:", selectedOption)

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
        if (!window.confirm("Are you sure you want to submit your test?")) return

        try {
            setSubmitting(true)
            const answerList = Object.values(answers)
            await submitTest(submission.id, answerList)
            alert("Test submitted successfully!")
            navigate("/student-dashboard")
        } catch (err) {
            console.error(err)
            alert("Failed to submit test. Please try again.")
        } finally {
            setSubmitting(false)
        }
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
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{test.testName}</h1>
                    <p className="text-slate-600 mb-4">{test.testDescription}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Duration: {test.testDuration / 60} mins</span>
                        <span>Questions: {test.questions.length}</span>
                        {isSaving && <span className="text-blue-600 animate-pulse">Saving...</span>}
                        {!isSaving && lastSaved && <span className="text-green-600">Saved at {lastSaved.toLocaleTimeString()}</span>}
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
                                            {(question as MultipleChoiceQuestion).options?.map((option) => (
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
