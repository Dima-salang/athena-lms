"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
    getTestById,
    type Test,
    type Question,
    type MultipleChoiceQuestion,
    createOrUpdateQuestions,
    deleteQuestion as deleteQuestionApi,
} from "../services/api"
import QuestionEditor from "../components/QuestionEditor"

const TestEditorPage: React.FC = () => {
    const { testId } = useParams<{ testId: string }>()
    const [test, setTest] = useState<Test | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)

    useEffect(() => {
        if (testId) {
            fetchTest(Number(testId))
        }
    }, [testId])

    const fetchTest = async (id: number) => {
        try {
            const fetchedTest = await getTestById(id)
            setTest(fetchedTest)
            if (fetchedTest.questions) {
                setQuestions(fetchedTest.questions.map((q) => ({ ...q, isDirty: false })))
            }
        } catch (error) {
            console.error("Failed to fetch test", error)
        }
    }

    useEffect(() => {

        if (testId && isDirty) {
            const timer = setTimeout(() => {
                handleAutosave()
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [questions, testId, isDirty])

    const handleAutosave = async () => {
        if (!testId || !isDirty) return
        setIsSaving(true)
        try {
            const questionsToSave = questions
                .filter((q) => q.isDirty)
                .map((q) => {
                    const tempId = q.tempId || (q.id < 0 ? q.id : undefined)
                    return { ...q, tempId }
                })

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

                            if (localQ.questionType === "MULTIPLE_CHOICE") {
                                const mcQuestion = localQ as MultipleChoiceQuestion
                                const savedMcQuestion = savedQ as MultipleChoiceQuestion
                                let updatedOptions: any[] | undefined = undefined

                                if (mcQuestion.options && savedMcQuestion.options) {
                                    const savedOptionsMap = new Map<number, any>()
                                    savedMcQuestion.options.forEach((o: any) => {
                                        if (o.tempId) savedOptionsMap.set(o.tempId, o)
                                    })

                                    updatedOptions = mcQuestion.options.map((localO) => {
                                        if (localO.tempId && savedOptionsMap.has(localO.tempId)) {
                                            return { ...localO, id: savedOptionsMap.get(localO.tempId).id }
                                        }
                                        return localO
                                    })

                                    const newMcQ = newQ as MultipleChoiceQuestion
                                    if (newMcQ.correctOptionId && newMcQ.correctOptionId < 0) {
                                        if (savedOptionsMap.has(newMcQ.correctOptionId)) {
                                            newMcQ.correctOptionId = savedOptionsMap.get(newMcQ.correctOptionId).id
                                        }
                                    }
                                }

                                if (updatedOptions) {
                                    ; (newQ as MultipleChoiceQuestion).options = updatedOptions
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
            console.error("Autosave failed", error)
        } finally {
            setIsSaving(false)
        }
    }

    const addQuestion = () => {
        const tempId = -Date.now()
        const newQuestion: MultipleChoiceQuestion = {
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
            questionAnswer: "",
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

    const saveQuestion = async () => {
        handleAutosave()
    }

    if (!test) return <div className="text-center py-8">Loading...</div>

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Editing: {test.testName}</h1>
                        <p className="text-slate-600 text-sm mt-1">Add and manage questions for this test</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {isSaving && <span className="text-blue-600 font-medium">Saving...</span>}
                        {lastSavedTime && (
                            <span className="text-slate-600 text-sm">Saved {lastSavedTime.toLocaleTimeString()}</span>
                        )}
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    {questions.map((q) => (
                        <QuestionEditor
                            key={q.id || q.tempId}
                            question={q}
                            onUpdate={updateQuestion}
                            onDelete={handleDeleteQuestion}
                            onSave={() => saveQuestion()}
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
                    <Link to="/dashboard" onClick={() => handleAutosave()}>
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
