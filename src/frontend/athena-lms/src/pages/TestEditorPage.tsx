"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
    getTestById,
    type Test,
    type Question,
    createOrUpdateQuestions,
    deleteQuestion as deleteQuestionApi,
    autosaveTest,
} from "../services/api"
import QuestionEditor from "../components/QuestionEditor"

const TestEditorPage: React.FC = () => {
    const { testId } = useParams<{ testId: string }>()
    const [test, setTest] = useState<Test | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)

    // Test details state
    const [testName, setTestName] = useState("")
    const [testDescription, setTestDescription] = useState("")
    const [testDuration, setTestDuration] = useState<number>(0)
    const [isTestDetailsDirty, setIsTestDetailsDirty] = useState(false)

    useEffect(() => {
        if (testId) {
            fetchTest(Number(testId))
        }
    }, [testId])

    const fetchTest = async (id: number) => {
        try {
            const fetchedTest = await getTestById(id)
            setTest(fetchedTest)
            setTestName(fetchedTest.testName)
            setTestDescription(fetchedTest.testDescription)
            setTestDuration(fetchedTest.testDuration / 60) // Convert seconds to minutes for display
            if (fetchedTest.questions) {
                setQuestions(fetchedTest.questions.map((q) => ({ ...q, isDirty: false })))
            }
        } catch (error) {
            console.error("Failed to fetch test", error)
        }
    }

    // Autosave for questions
    useEffect(() => {
        if (testId && isDirty) {
            const timer = setTimeout(() => {
                handleAutosaveQuestions()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [questions, testId, isDirty])

    // Autosave for test details
    useEffect(() => {
        if (testId && isTestDetailsDirty) {
            const timer = setTimeout(() => {
                handleAutosaveTestDetails()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [testName, testDescription, testDuration, testId, isTestDetailsDirty])

    const handleAutosaveQuestions = async () => {
        if (!testId || !isDirty) return
        setIsSaving(true)
        try {
            const questionsToSave = questions
                .filter((q) => q.isDirty)
                .map((q) => {
                    const tempId = q.tempId || (q.id < 0 ? q.id : undefined);
                    let cleanedQuestion = { ...q, tempId };

                    // Clean up incompatible fields based on question type
                    if (q.questionType === "IDENTIFICATION" || q.questionType === "TRUE_FALSE" || q.questionType === "ESSAY") {
                        // Remove MCQ-specific fields
                        delete (cleanedQuestion as any).options;
                        delete (cleanedQuestion as any).correctOptionId;
                    }

                    console.log("Question to save:", cleanedQuestion);
                    return cleanedQuestion;
                });

            if (questionsToSave.length === 0) {
                setIsDirty(false)
                setIsSaving(false)
                return
            }

            const response = await createOrUpdateQuestions(questionsToSave, Number(testId))
            const savedQuestions = response as Question[]

            setQuestions((prevQuestions) => {
                const newQuestions = [...prevQuestions]
                const savedQuestionsMap = new Map<number, Question>()
                savedQuestions.forEach((q) => {
                    if (q.tempId) savedQuestionsMap.set(q.tempId, q)
                    else savedQuestionsMap.set(q.id, q)
                })

                return newQuestions.map((localQ) => {
                    if (localQ.isDirty) {
                        let savedQ: Question | undefined
                        if (localQ.tempId && savedQuestionsMap.has(localQ.tempId)) {
                            savedQ = savedQuestionsMap.get(localQ.tempId)
                        } else if (localQ.id > 0 && savedQuestionsMap.has(localQ.id)) {
                            savedQ = savedQuestionsMap.get(localQ.id)
                        }

                        if (savedQ) {
                            const newQ = { ...localQ, id: savedQ.id, isDirty: false }

                            // Preserve correctAnswer for IDENTIFICATION and TRUE_FALSE since backend might not return it correctly
                            if (localQ.questionType === "IDENTIFICATION" || localQ.questionType === "TRUE_FALSE") {
                                console.log("Preserving correctAnswer for", localQ.questionType);
                                console.log("Local correctAnswer:", (localQ as any).correctAnswer);
                                console.log("Saved correctAnswer from backend:", (savedQ as any).correctAnswer);
                                (newQ as any).correctAnswer = (localQ as any).correctAnswer;
                                console.log("Final newQ correctAnswer:", (newQ as any).correctAnswer);
                            }

                            if (localQ.questionType === "MULTIPLE_CHOICE") {
                                let updatedOptions: any[] | undefined = undefined

                                if (localQ.options && savedQ.options) {
                                    const savedOptionsMap = new Map<number, any>()
                                    savedQ.options.forEach((o: any) => {
                                        if (o.tempId) savedOptionsMap.set(o.tempId, o)
                                        // Also map by ID if available (for updates)
                                        if (o.id) savedOptionsMap.set(o.id, o)
                                    })

                                    updatedOptions = localQ.options.map((localO) => {
                                        // Try to find by tempId
                                        if (localO.tempId && savedOptionsMap.has(localO.tempId)) {
                                            return { ...localO, id: savedOptionsMap.get(localO.tempId).id }
                                        }
                                        // Try to find by ID (if updating existing option)
                                        if (localO.id && savedOptionsMap.has(localO.id)) {
                                            // Ensure ID is preserved/confirmed
                                            return { ...localO, id: savedOptionsMap.get(localO.id).id }
                                        }
                                        return localO
                                    })

                                    if (newQ.correctOptionId && newQ.correctOptionId < 0) {
                                        if (savedOptionsMap.has(newQ.correctOptionId)) {
                                            newQ.correctOptionId = savedOptionsMap.get(newQ.correctOptionId).id
                                        }
                                    }
                                }

                                if (updatedOptions) {
                                    newQ.options = updatedOptions
                                }
                            }
                            return newQ
                        }
                    }
                    return localQ
                })
            })

            setLastSavedTime(new Date())
            setIsDirty(false)
        } catch (error) {
            console.error("Autosave questions failed", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleAutosaveTestDetails = async () => {
        if (!testId || !isTestDetailsDirty) return
        setIsSaving(true)
        try {
            await autosaveTest(Number(testId), {
                testName,
                testDescription,
                testDuration: testDuration * 60 // Convert minutes back to seconds
            })
            console.log("Autosave test details success")
            console.log("Duration: ", testDuration)
            setLastSavedTime(new Date())
            setIsTestDetailsDirty(false)
        } catch (error) {
            console.error("Autosave test details failed", error)
        } finally {
            setIsSaving(false)
        }
    }

    const addQuestion = () => {
        const tempId = -Date.now()
        const newQuestion: Question = {
            id: tempId,
            tempId: tempId,
            test: { id: Number(testId) } as Test,
            questionNumber: (questions.length + 1).toString(),
            questionText: "",
            questionType: "MULTIPLE_CHOICE",
            fullPoints: 1,
            correctPoints: 1,
            options: [
                { optionText: "", tempId: tempId - 1 },
                { optionText: "", tempId: tempId - 2 },
                { optionText: "", tempId: tempId - 3 },
                { optionText: "", tempId: tempId - 4 },
            ],
            correctAnswer: "",
            isDirty: true,
        }
        setQuestions([...questions, newQuestion])
        setIsDirty(true)
    }

    const updateQuestion = (updatedQuestion: Question) => {
        setQuestions(questions.map((q) => (q.id === updatedQuestion.id ? { ...updatedQuestion, isDirty: true } : q)))
        setIsDirty(true)
    }

    const handleDeleteQuestion = async (id: number) => {
        if (id > 0) {
            await deleteQuestionApi(id)
        }
        setQuestions(questions.filter((q) => q.id !== id))
    }

    const saveAll = async () => {
        await Promise.all([handleAutosaveQuestions(), handleAutosaveTestDetails()])
    }

    if (!test) return <div className="text-center py-8">Loading...</div>

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Edit Test</h1>
                        <p className="text-slate-600 text-sm mt-1">Manage test details and questions</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {isSaving && <span className="text-blue-600 font-medium">Saving...</span>}
                        {lastSavedTime && (
                            <span className="text-slate-600 text-sm">Saved {lastSavedTime.toLocaleTimeString()}</span>
                        )}
                    </div>
                </div>

                {/* Test Details Editor */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Test Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Test Name</label>
                            <input
                                type="text"
                                value={testName}
                                onChange={(e) => {
                                    setTestName(e.target.value)
                                    setIsTestDetailsDirty(true)
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter test name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                value={testDescription}
                                onChange={(e) => {
                                    setTestDescription(e.target.value)
                                    setIsTestDetailsDirty(true)
                                }}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter test description"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                value={testDuration}
                                onChange={(e) => {
                                    setTestDuration(Number(e.target.value))
                                    setIsTestDetailsDirty(true)
                                }}
                                min="0"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">Set to 0 for no time limit</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Questions</h2>
                    {questions.map((q) => (
                        <QuestionEditor
                            key={q.id || q.tempId}
                            question={q}
                            onUpdate={updateQuestion}
                            onDelete={handleDeleteQuestion}
                            onSave={() => saveAll()}
                        />
                    ))}
                </div>

                <div className="space-y-4">
                    <button
                        onClick={addQuestion}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
                    >
                        + Add New Question
                    </button>
                    <Link to="/dashboard" onClick={() => saveAll()}>
                        <button
                            className="w-full py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition duration-200"
                        >
                            Done & Return to Dashboard
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default TestEditorPage
